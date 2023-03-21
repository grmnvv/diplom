import React, { useRef, useState } from "react";

function App() {
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // function to handle image uploads
  const handleImageUpload = (event) => {
    const files = event.target.files;

    // loop through uploaded files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          // draw first image on canvas
          if (i === 0) {
            const aspectRatio = img.width / img.height;
            const canvasWidth = canvas.offsetWidth;
            const canvasHeight = canvasWidth / aspectRatio;
            canvas.height = canvasHeight;
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          }

          // add image data to photos array
          const imageData = canvas.toDataURL();
          setPhotos(prevPhotos => [...prevPhotos, imageData]);
        };

        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

  // function to handle selection of photo
  const handlePhotoSelect = (index) => {
    setSelectedPhotoIndex(index);
    drawSelectedPhoto(index);
  };

  // draw selected photo on canvas
  const drawSelectedPhoto = (index) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = photos[index];
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const canvasWidth = canvas.offsetWidth;
      const canvasHeight = canvasWidth / aspectRatio;
      canvas.height = canvasHeight;
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    };
  };

  return (
    <div>
      <input type="file" multiple onChange={handleImageUpload} />

      <div>
        {photos.slice(1).map((photo, index) => (
          <img
            key={photo}
            src={photo}
            alt="uploaded"
            style={{ width: "15%", cursor: "pointer" }}
            onClick={() => handlePhotoSelect(index + 1)}
          />
        ))}
      </div>

      <canvas ref={canvasRef} />
    </div>
  );
}

export default App;
