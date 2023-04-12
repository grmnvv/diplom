import React, { useState, useEffect, useRef } from "react";


const CroppedImage = ({ image, rect, onFilenameChange }) => {

    const canvasRef = useRef(null);
    const [inputValue, setInputValue] = useState("");
  
    useEffect(() => {
      if (!canvasRef.current || !image) return;
  
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        rect.x ,
        rect.y ,
        rect.width ,
        rect.height ,
        0,
        0,
        rect.width,
        rect.height
      );
    }, [image, rect]);
  
    const handleFilenameChange = (e) => {
      onFilenameChange(rect, e.target.value);
    };
  
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
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
      <div>
        <canvas
          ref={canvasRef}
          width={rect.width}
          height={rect.height}
          style={{ border: "1px solid black" }}
        />
        <p>
          x: {rect.x}, y: {rect.y}, width: {rect.width}, height: {rect.height}
        </p>
        <label>
          Имя файла:
          <input
            type="text"
            value={rect.name}
            onChange={handleFilenameChange}
          />
        </label>
        <button onClick={sendRequest}>Отправить</button>
      </div>
    );
  };

  export default CroppedImage;