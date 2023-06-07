import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import BoundingBox from "./BoundingBox/BoundingBox";
import CroppedImage from "./CroppedImage/CroppedImage";
import styles from "./ImageAnnotation.module.css";
import { observer } from "mobx-react-lite";

const MIN_RECT_SIZE = 10;

const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const ImageAnnotation = ({
  imageURL,
  rects: initialRects,
  onRectsChange,
  saveCRNN,
  saveYOLO,
  thumbnailsCollapsed,
  saveToProject,
}) => {
  const [image] = useImage(imageURL);
  const [rects, setRects] = useState(initialRects);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null);
  const [selectedRectId, setSelectedRectId] = useState(null);
  const rectsRef = useRef(rects);
  const [scale, setScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  const divRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (divRef.current?.offsetHeight && divRef.current?.offsetWidth) {
      setDimensions({
        width: divRef.current.offsetWidth,
        height: divRef.current.offsetHeight,
      });
    }
  }, [window.innerWidth, thumbnailsCollapsed]);

  useEffect(() => {
    const handleRightClick = (e) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleRightClick);

    return () => {
      window.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);

  // Обработчик начала перетаскивания сцены
  const handleStageDragStart = (e) => {
    const stage = e.target.getStage(); // Получаем сцену
    setStagePosition({ x: stage.x(), y: stage.y() }); // Устанавливаем позицию сцены
  };

  // Обработчик процесса перетаскивания сцены
  const handleStageDragMove = (e) => {
    const stage = e.target.getStage(); // Получаем сцену
    setStagePosition({ x: stage.x(), y: stage.y() }); // Устанавливаем позицию сцены
  };

  // useEffect срабатывает при монтировании и обновлении компонента, устанавливая прямоугольники в их исходное состояние
  useEffect(() => {
    setRects(initialRects);
  }, [initialRects, imageURL]);

  // Этот useEffect вызывается при изменении rects или onRectsChange
  // Проверяет, изменился ли rects, и если да, то вызывает onRectsChange
  useEffect(() => {
    if (JSON.stringify(rectsRef.current) !== JSON.stringify(rects)) {
      rectsRef.current = rects;
      onRectsChange(rects);
    }
  }, [rects, onRectsChange]);

  // Этот useEffect вызывается при изменении rects или selectedRectId
  // Если selectedRectId не пуст, обновляет состояние rects
  useEffect(() => {
    const updateCroppedImages = () => {
      if (selectedRectId) {
        setRects(rects);
      }
    };
    updateCroppedImages();
  }, [rects, selectedRectId]);

  // Этот useEffect добавляет обработчик события нажатия клавиши на window
  // Если нажат "Backspace" и есть selectedRectId, удаляет соответствующий прямоугольник
  // При демонтировании компонента удаляет обработчик
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace" && selectedRectId) {
        setRects(rects.filter((rect) => rect.id !== selectedRectId));
        setSelectedRectId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rects, selectedRectId]);

  function handleDelete(selectedRectId) {
    setRects(rects.filter((rect) => rect.id !== selectedRectId));
  }
  function handleSelect(selectedRectId) {
    setSelectedRectId(selectedRectId);
  }
  const dataURLtoBlob = (dataURL) => {
    const binary = atob(dataURL.split(",")[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: "image/jpeg" });
  };

  const handleScaleChange = (e) => {
    setScale(parseFloat(e.target.value));
  };

  const sendRequest = async (rect) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.drawImage(
      image,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      rect.width,
      rect.height
    );

    const imageDataUrl = canvas.toDataURL("image/jpeg");
    const imageBlob = dataURLtoBlob(imageDataUrl);

    const formData = new FormData();
    formData.append("image", imageBlob);

    try {
      const response = await axios.post("http://127.0.0.1:8000/word", formData);
      return response.data.result;
    } catch (error) {
      console.error("Ошибка отправки запроса:", error);
    }
  };

  const handleMouseDown = (e) => {
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      e.target.getStage().startDrag();
    } else {
      setDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      setCurrentRect({
        x: (pos.x - stagePosition.x) / scale,
        y: (pos.y - stagePosition.y) / scale,
        width: 0,
        height: 0,
        id: uuidv4(),
        color: randomColor(),
        name: "",
        label: "",
      });
    }
  };

  // Обработчик события колесика мыши
  const handleWheel = (e) => {
    // Предотвращаем дефолтное поведение браузера при прокрутке
    e.evt.preventDefault();

    // Устанавливаем значение, на которое будем масштабировать
    const scaleBy = 1.036;

    // Получаем старое значение масштаба
    const oldScale = scale;

    // Получаем ссылку на сцену (этап/слои)
    const stage = e.target.getStage();

    // Получаем позицию курсора на сцене
    var pointer = stage.getPointerPosition();

    const pointerPosition = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    // Если клавиша Ctrl не нажата, выполняем панорамирование сцены
    if (!e.evt.ctrlKey) {
      // Вычисляем новые координаты для позиции сцены
      const newX = stagePosition.x - e.evt.deltaX * 0.4;
      const newY = stagePosition.y - e.evt.deltaY * 0.4;

      // Устанавливаем новую позицию сцены
      setStagePosition({ x: newX, y: newY });

      return;
    }
    // Определяем направление прокрутки колесика мыши: при прокрутке вверх deltaY > 0, присваиваем -1, иначе 1.
    let direction = e.evt.deltaY > 0 ? -1 : 1;

    // Изменяем масштаб в зависимости от направления: если вверх, уменьшаем масштаб, если вниз, увеличиваем.
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Устанавливаем новое значение масштаба
    setScale(newScale);

    // Вычисляем новую позицию сцены, учитывая измененный масштаб и позицию указателя мыши
    const newPos = {
      x: pointer.x - pointerPosition.x * newScale,
      y: pointer.y - pointerPosition.y * newScale,
    };

    // Устанавливаем новую позицию для сцены
    setStagePosition(newPos);
  };

  const handleMouseUp = async (e) => {
    if (e.evt.button === 2) {
      e.target.getStage().stopDrag();
    }
    if (drawing && currentRect) {
      let finalRect = currentRect;

      if (currentRect.width < 0) {
        finalRect = {
          ...finalRect,
          x: currentRect.x + currentRect.width,
          width: -currentRect.width,
        };
      }

      if (currentRect.height < 0) {
        finalRect = {
          ...finalRect,
          y: currentRect.y + currentRect.height,
          height: -currentRect.height,
        };
      }

      if (
        finalRect.width >= MIN_RECT_SIZE &&
        finalRect.height >= MIN_RECT_SIZE
      ) {
        const result = await sendRequest(finalRect);
        setRects([...rects, { ...finalRect, name: result }]);
        console.log(finalRect);
      }
      setCurrentRect(null);
    }
    saveToProject();
    setDrawing(false);
  };

  const handleDragEnd = async (e, index) => {
    const newRects = rects.slice();
    newRects[index] = {
      ...newRects[index],
      x: e.target.x() / scale,
      y: e.target.y() / scale,
    };

    sendRequest(newRects[index]);
    const result = await sendRequest(newRects[index]);
    const updatedRects = rects.map((r) => {
      if (r.id === newRects[index].id) {
        return {
          ...r,
          name: result,
        };
      }
      return r;
    });
    setRects(updatedRects);
    saveToProject();
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentRect({
      ...currentRect,
      width: (pos.x - stagePosition.x - currentRect.x * scale) / scale,
      height: (pos.y - stagePosition.y - currentRect.y * scale) / scale,
    });
  };

  const handleDragMove = (e, index) => {
    const newRects = rects.slice();
    newRects[index] = {
      ...newRects[index],
      x: e.target.x() / scale,
      y: e.target.y() / scale,
    };
    setRects(newRects);
  };
  // Функция, вызываемая при завершении изменения размеров прямоугольника
  const handleResizeEnd = async (index) => {
    const rect = rects[index]; // Получаем изменяемый прямоугольник из массива
    let newX = rect.x; // Начальная позиция X прямоугольника
    let newY = rect.y;
    let newWidth = rect.width; // Начальная ширина прямоугольника
    let newHeight = rect.height;

    // Если новая ширина отрицательна, обновляем позицию X и меняем знак ширины
    if (newWidth < 0) {
      newX += newWidth;
      newWidth = -newWidth;
    }

    // Если новая высота отрицательна, обновляем позицию Y и меняем знак высоты
    if (newHeight < 0) {
      newY += newHeight;
      newHeight = -newHeight;
    }

    // Создаем обновленный объект прямоугольника с новыми значениями
    const updatedRect = {
      ...rect,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    // Отправляем запрос на обновление прямоугольника и получаем результат
    const result = await sendRequest(updatedRect);

    // Обновляем массив прямоугольников, заменяя изменяемый прямоугольник на обновленный объект
    const updatedRects = rects.map((r) => {
      if (r.id === rect.id) {
        return {
          ...updatedRect,
          name: result, // Обновляем имя прямоугольника с результатом запроса
        };
      }
      return r;
    });

    // Устанавливаем обновленный массив прямоугольников в состояние
    setRects(updatedRects);
  };

  // Функция обработки изменения размеров прямоугольников
  const handleResize = (e, index, anchorIndex) => {
    const newRects = rects.slice(); // Создаем копию массива прямоугольников
    const pos = e.target.getStage().getPointerPosition(); // Получаем позицию указателя мыши
    let newWidth, newX, newY, newHeight; // Объявляем переменные для новой ширины, позиции X, позиции Y и новой высоты

    // Изменяем позицию X и ширину прямоугольника в зависимости от якорной точки
    if (anchorIndex === 0 || anchorIndex === 2) {
      newX = (pos.x - stagePosition.x) / scale;
      newWidth =
        rects[index].width -
        ((pos.x - stagePosition.x) / scale - rects[index].x);
    } else {
      newX = rects[index].x;
      newWidth = (pos.x - stagePosition.x) / scale - rects[index].x;
    }

    // Изменяем позицию Y и высоту прямоугольника в зависимости от якорной точки
    if (anchorIndex === 0 || anchorIndex === 1) {
      newY = (pos.y - stagePosition.y) / scale;
      newHeight =
        rects[index].height -
        ((pos.y - stagePosition.y) / scale - rects[index].y);
    } else {
      newY = rects[index].y;
      newHeight = (pos.y - stagePosition.y) / scale - rects[index].y;
    }

    // Обновляем массив прямоугольников с новыми значениями для изменяемого прямоугольника
    newRects[index] = {
      ...newRects[index],
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    // Устанавливаем обновленный массив прямоугольников в состояние
    setRects(newRects);
  };

  const handleFilenameChange = (rect, name) => {
    const updatedRects = rects.map((r) => {
      if (r.id === rect.id) {
        return {
          ...r,
          name: name,
        };
      }
      return r;
    });
    setRects(updatedRects);
  };
  const handleLabelChange = (rect, label) => {
    const updatedRects = rects.map((r) => {
      if (r.id === rect.id) {
        return {
          ...r,
          label: label,
        };
      }
      return r;
    });
    setRects(updatedRects);
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.stageWrapper} ref={divRef}>
          <Stage
            x={Math.floor(stagePosition.x)}
            y={Math.floor(stagePosition.y)}
            width={dimensions.width}
            height={dimensions.height}
            onDragStart={handleStageDragStart}
            onDragMove={handleStageDragMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
          >
            <Layer>
              <Image
                image={image}
                width={image ? image.width : 0}
                height={image ? image.height : 0}
                scaleX={scale}
                scaleY={scale}
              />
              {rects.map((rect, index) => (
                <BoundingBox
                  key={rect.id}
                  rect={rect}
                  onDragMove={(e) => handleDragMove(e, index)}
                  onDragEnd={(e) => handleDragEnd(e, index)}
                  onResize={(e, anchorIndex) =>
                    handleResize(e, index, anchorIndex)
                  }
                  onResizeEnd={(e) => handleResizeEnd(index)}
                  onSelect={setSelectedRectId}
                  selected={selectedRectId === rect.id}
                  scale={scale}
                />
              ))}
              {currentRect && drawing && (
                <BoundingBox rect={currentRect} scale={scale} />
              )}
            </Layer>
          </Stage>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.sidebar}>
          {rects.map((rect) => (
            <div key={rect.id}>
              <CroppedImage
                key={rect.id}
                image={image}
                rect={rect}
                onFilenameChange={handleFilenameChange}
                handleDelete={handleDelete}
                handleSelect={handleSelect}
                onLabelChange={handleLabelChange}
              />
            </div>
          ))}
        </div>
        <button onClick={saveCRNN}>fa.saveCRNN()</button>
        <button onClick={saveYOLO}>fa.saveYOLO()</button>
      </div>
    </div>
  );
};

export default observer(ImageAnnotation);
