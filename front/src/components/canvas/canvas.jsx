import React, { useState, useContext} from "react";
import ImageAnnotation from "../../pages/augmentation/augmentation";
import { Context } from "../..";

const Thumbnail = ({ image, onClick }) => {
  return <img src={image.url} alt="thumbnail" width="100" onClick={onClick} />;
};

const App = () => {
  const [imagesData, setImagesData] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [allCanvasRect, setAllCanvasRect] = useState([])

  const handleFileChange = (e) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagesData([
            ...imagesData,
            { url: e.target.result, rects: [] },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleRectsChange = (newRects) => {
    setImagesData(
      imagesData.map((imageData, index) =>
        index === selectedImageIndex ? { ...imageData, rects: newRects } : imageData
      )
    );
    setAllCanvasRect(
      allCanvasRect.map((imageData) => ({ ...imageData, newRects }))
    );
  };
  

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      <div>
        {imagesData.map((imageData, index) => (
          <Thumbnail
            key={index}
            image={imageData}
            onClick={() => handleImageClick(index)}
          />
        ))}
      </div>
      {selectedImageIndex !== null && (
        <ImageAnnotation
          imageURL={imagesData[selectedImageIndex].url}
          rects={imagesData[selectedImageIndex].rects}
          onRectsChange={handleRectsChange}
          allCanvasRects={imagesData}
        />
      )}
    </div>
  );
};

export default App;
