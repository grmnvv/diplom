import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image, Rect, Circle } from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import BoundingBox from "./BoundingBox/BoundingBox";
import CroppedImage from "./CroppedImage/CroppedImage";

const MIN_RECT_SIZE = 10;

const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const ImageAnnotation = ({
  imageURL,
  rects: initialRects,
  onRectsChange,
  saveAllCroppedImages
}) => {
  const [image] = useImage(imageURL);
  const [rects, setRects] = useState(initialRects);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null);
  const [selectedRectId, setSelectedRectId] = useState(null);
  const rectsRef = useRef(rects);

  const [filenames, setFilenames] = useState({});

  useEffect(() => {
    setRects(initialRects);
  }, [initialRects, imageURL]);

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
    setDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setCurrentRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      id: uuidv4(),
      color: randomColor(),
      name: "",
    });
  };

  const handleMouseUp = async () => {
    if (drawing && currentRect) {
      if (
        currentRect.width >= MIN_RECT_SIZE &&
        currentRect.height >= MIN_RECT_SIZE
      ) {
        const result = await sendRequest(currentRect);
        console.log(result)
        setRects([...rects, { ...currentRect, name: result }]);
      }
      setCurrentRect(null);
    }
    setDrawing(false);
  };
  const handleDragEnd = async (e, index) => {
    const newRects = rects.slice();
    newRects[index] = { ...newRects[index], x: e.target.x(), y: e.target.y() };

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
      width: pos.x - currentRect.x,
      height: pos.y - currentRect.y,
    });
  };

  const handleDragMove = (e, index) => {
    const newRects = rects.slice();
    newRects[index] = { ...newRects[index], x: e.target.x(), y: e.target.y() };
    setRects(newRects);
  };
  const handleResizeEnd = async (index) => {
    const rect = rects[index];
    const result = await sendRequest(rect);
    const updatedRects = rects.map((r) => {
      if (r.id === rect.id) {
        return {
          ...r,
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
      newX = pos.x;
      newWidth = rects[index].width - (pos.x - rects[index].x);
    } else {
      newX = rects[index].x;
      newWidth = pos.x - rects[index].x;
    }

    if (anchorIndex === 0 || anchorIndex === 1) {
      newY = pos.y;
      newHeight = rects[index].height - (pos.y - rects[index].y);
    } else {
      newY = rects[index].y;
      newHeight = pos.y - rects[index].y;
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
        rect.x,
        rect.y,
        rect.width,
        rect.height,
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
    <div>
      <Stage
        width={image ? image.width : 0}
        height={image ? image.height : 0}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          <Image image={image} />
          {rects.map((rect, index) => (
            <BoundingBox
              key={rect.id}
              rect={rect}
              onDragMove={(e) => handleDragMove(e, index)}
              onDragEnd={(e) => handleDragEnd(e, index)}
              onResize={(e, anchorIndex) => handleResize(e, index, anchorIndex)}
              onResizeEnd={(e) => handleResizeEnd(index)}
              onSelect={setSelectedRectId}
              selected={selectedRectId === rect.id}
            />
          ))}
          {currentRect && drawing && <BoundingBox rect={currentRect} />}
        </Layer>
      </Stage>
      <div>
        {rects.map((rect) => (
          <CroppedImage
            key={rect.id}
            image={image}
            rect={rect}
            onFilenameChange={handleFilenameChange}
          />
        ))}
      </div>
      <button onClick={saveCroppedImages}>
        Сохранить нарезанные изображения
      </button>
      <button onClick={saveAllCroppedImages}>
        Сохранить
      </button>
    </div>
  );
};

export default ImageAnnotation;
