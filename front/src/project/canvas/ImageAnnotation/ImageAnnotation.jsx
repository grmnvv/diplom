import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image, Rect, Circle } from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import BoundingBox from "./BoundingBox/BoundingBox";
import CroppedImage from "./CroppedImage/CroppedImage";
import styles from "./ImageAnnotation.module.css";

const MIN_RECT_SIZE = 10;

const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const ImageAnnotation = ({
  imageURL,
  rects: initialRects,
  onRectsChange,
  saveAllCroppedImages,
}) => {
  const [image] = useImage(imageURL);
  const [rects, setRects] = useState(initialRects);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null);
  const [selectedRectId, setSelectedRectId] = useState(null);
  const rectsRef = useRef(rects);
  const [scale, setScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const stageRef = useRef(null);
  

  useEffect(() => {
    const handleRightClick = (e) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleRightClick);

    return () => {
      window.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);




const handleStageDragStart = (e) => {
    const stage = e.target.getStage();
    setStagePosition({ x: stage.x(), y: stage.y() });
};

const handleStageDragMove = (e) => {
    const stage = e.target.getStage();
    setStagePosition({ x: stage.x(), y: stage.y() });
};

  useEffect(() => {
    setRects(initialRects);
  }, [initialRects, imageURL]);

  useEffect(() => {
    setScale(1);
  }, [imageURL]);

  useEffect(() => {
    if (JSON.stringify(rectsRef.current) !== JSON.stringify(rects)) {
      rectsRef.current = rects;
      onRectsChange(rects);
    }
  }, [rects, onRectsChange]);

  useEffect(() => {
    const updateCroppedImages = () => {
      if (selectedRectId) {
        setRects(rects);
      }
    };
    updateCroppedImages();
  }, [rects, selectedRectId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Backspace" || e.key === "Delete") && selectedRectId) {
        setRects(rects.filter((rect) => rect.id !== selectedRectId));
        setSelectedRectId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rects, selectedRectId]);

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
        x: (pos.x - stagePosition.x) / scale ,
        y: (pos.y - stagePosition.y) / scale,
        width: 0,
        height: 0,
        id: uuidv4(),
        color: randomColor(),
        name: "",
      });
    }
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
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentRect({
      ...currentRect,
      width: ((pos.x - stagePosition.x) - currentRect.x * scale) / scale,
      height: ((pos.y - stagePosition.y) - currentRect.y * scale) / scale,
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
  const handleResizeEnd = async (index) => {
    const rect = rects[index];
    let newX = rect.x;
    let newY = rect.y;
    let newWidth = rect.width;
    let newHeight = rect.height;

    if (newWidth < 0) {
      newX += newWidth;
      newWidth = -newWidth;
    }

    if (newHeight < 0) {
      newY += newHeight;
      newHeight = -newHeight;
    }

    const updatedRect = {
      ...rect,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    const result = await sendRequest(updatedRect);
    const updatedRects = rects.map((r) => {
      if (r.id === rect.id) {
        return {
          ...updatedRect,
          name: result,
        };
      }
      return r;
    });

    setRects(updatedRects);
  };

  const handleResize = (e, index, anchorIndex) => {
    const newRects = rects.slice();
    const pos = e.target.getStage().getPointerPosition();
    let newWidth, newX, newY, newHeight;

    if (anchorIndex === 0 || anchorIndex === 2) {
      newX = (pos.x - stagePosition.x) / scale;
      newWidth = rects[index].width - ((pos.x - stagePosition.x) / scale - rects[index].x);
    } else {
      newX = rects[index].x;
      newWidth = (pos.x - stagePosition.x) / scale - rects[index].x;
    }

    if (anchorIndex === 0 || anchorIndex === 1) {
      newY = (pos.y - stagePosition.y) / scale;
      newHeight = rects[index].height - ((pos.y - stagePosition.y) / scale - rects[index].y);
    } else {
      newY = rects[index].y;
      newHeight = (pos.y - stagePosition.y) / scale - rects[index].y;
    }

    newRects[index] = {
      ...newRects[index],
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

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

  const saveCroppedImages = async () => {
    const zip = new JSZip();
    const folder = zip.folder("cropped_images");
    for (const rect of rects) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.drawImage(
        image,
        rect.x / scale,
        rect.y / scale,
        rect.width / scale,
        rect.height / scale,
        0,
        0,
        rect.width,
        rect.height
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      const filename = rect.name || `image_${rect.id}`;
      folder.file(`${filename}.jpeg`, blob);
    }

    zip
      .generateAsync({ type: "blob" })
      .then((content) => saveAs(content, "cropped_images.zip"));
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.stageWrapper}>
          <Stage
              x={stagePosition.x} 
              y={stagePosition.y} 
              width={image ? image.width : 0} 
              height={image ? image.height : 0} 

              onDragStart={handleStageDragStart} 
              onDragMove={handleStageDragMove} 
              onMouseDown={handleMouseDown} 
              onMouseUp={handleMouseUp} 
              onMouseMove={handleMouseMove}>

            <Layer>
              <Image
                image={image}
                width={image ? image.width  : 0}
                height={image ? image.height  : 0}
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
        <div className={styles.scaleInputWrapper}>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.005"
            value={scale}
            onChange={handleScaleChange}
            style={{ width: "200px" }}
          />
        </div>
      </div>
      <div className={styles.sidebar}>
        {rects.map((rect) => (
          <CroppedImage
            key={rect.id}
            image={image}
            rect={rect}
            onFilenameChange={handleFilenameChange}
          />
        ))}
        <div>
          <button onClick={saveCroppedImages}>
            Сохранить нарезанные изображения
          </button>
        </div>
        <div>
          <button onClick={saveAllCroppedImages}>Сохранить</button>
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotation;
