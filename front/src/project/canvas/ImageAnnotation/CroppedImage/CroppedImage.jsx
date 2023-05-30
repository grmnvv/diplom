import React, { useState, useEffect, useRef } from "react";
import styles from "../ImageAnnotation.module.css";
import { observer } from "mobx-react-lite";

const CroppedImage = ({
  image,
  rect,
  onFilenameChange,
  handleDelete,
  handleSelect,
  onLabelChange,
}) => {
  const canvasRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  }, [image, rect]);

  const handleFilenameChange = (e) => {
    onFilenameChange(rect, e.target.value);
  };

  const handleLabelChange = (e) => {
    onLabelChange(rect, e.target.value);
  };

  const dataURLtoBlob = (dataURL) => {
    const binary = atob(dataURL.split(",")[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: "image/jpeg" });
  };

  const sendRequest = async () => {
    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    const imageBlob = dataURLtoBlob(imageDataUrl);

    const formData = new FormData();
    formData.append("image", imageBlob);

    try {
      const response = await fetch("http://127.0.0.1:8000/word", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setInputValue(result.result);
    } catch (error) {
      console.error("Ошибка отправки запроса:", error);
    }
  };

  return (
    <div className={styles.containerc}>
      <p style={{ fontSize: "14px", margin: "10px 0" }}>
        fa.xywh: ({Math.floor(rect.x)},{Math.floor(rect.y)}),(
        {Math.floor(rect.width)},{Math.floor(rect.height)})
      </p>
      <label style={{ fontSize: "14px", margin: "10px 0", textAlign: "left" }}>
        fa.bbname =
      </label>
      <input
        type="text"
        value={rect.name}
        onChange={handleFilenameChange}
        style={{ margin: "10px 0", padding: "0" }}
      />
      <label style={{ fontSize: "14px", margin: "10px 0", textAlign: "left" }}>
        fa.label =
      </label>
      <input
        type="text"
        value={rect.label}
        onChange={handleLabelChange}
        style={{ margin: "10px 0", padding: "0" }}
      />

      <canvas
        ref={canvasRef}
        width={rect.width}
        height={rect.height}
        onClick={() => {
          handleSelect(rect.id);
        }}
        className={styles.croppedcanvas}
      />
      <button
        onClick={() => {
          handleDelete(rect.id);
        }}
        style={{ fontSize: "14px" }}
      >
        fa.delete()
      </button>
    </div>
  );
};

export default observer(CroppedImage);
