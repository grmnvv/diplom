import React, { useState, useContext } from "react";
import ImageAnnotation from "./ImageAnnotation/ImageAnnotation";
import { Context } from "../..";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import styles from './Canvas.module.css'

const Thumbnail = ({ image, onClick }) => {
  return <img src={image.url} alt="thumbnail" width="100" onClick={onClick} />;
};

const Canvas = () => {
  const [imagesData, setImagesData] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [allCanvasRect, setAllCanvasRect] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const fileReadPromises = Array.from(e.target.files).map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({ url: e.target.result, rects: [], name: file.name });
          };
          reader.readAsDataURL(file);
        });
      });
  
      Promise.all(fileReadPromises).then((newImagesData) => {
        setImagesData([...imagesData, ...newImagesData]);
      });
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleRectsChange = (newRects) => {
    setImagesData(
      imagesData.map((imageData, index) =>
        index === selectedImageIndex
          ? { ...imageData, rects: newRects }
          : imageData
      )
    );
    setAllCanvasRect(
      allCanvasRect.map((imageData) => ({ ...imageData, newRects }))
    );
  };

  const saveCroppedImages = async () => {
    const zip = new JSZip();
    const folder = zip.folder("cropped_images");

    const processImage = (imageData) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageData.url;

        img.onload = () => {
          const promises = [];

          for (const rect of imageData.rects) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.drawImage(
              img,
              rect.x,
              rect.y,
              rect.width,
              rect.height,
              0,
              0,
              rect.width,
              rect.height
            );

            const blobPromise = new Promise((resolveBlob) => {
              canvas.toBlob((blob) => {
                const filename = rect.name || `image_${rect.id}`;
                folder.file(`${filename}.jpeg`, blob);
                resolveBlob();
              }, "image/jpeg");
            });

            promises.push(blobPromise);
          }

          Promise.all(promises).then(() => resolve());
        };
      });
    };

    const allPromises = imagesData.map((imageData) => processImage(imageData));
    await Promise.all(allPromises);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "cropped_images.zip");
  };

  return (
    <div className={styles.project}>
      <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      </div>

      <div className={styles.workspace}>
        <div>
          {imagesData.map((imageData, index) => (
            <Thumbnail
              key={index}
              image={imageData}
              onClick={() => handleImageClick(index)}
            />
          ))}
        </div>
        <div>
          {selectedImageIndex !== null && (
            <ImageAnnotation
              imageURL={imagesData[selectedImageIndex].url}
              rects={imagesData[selectedImageIndex].rects}
              onRectsChange={handleRectsChange}
              saveAllCroppedImages={saveCroppedImages}
            />
          )}
        </div>
        
        
      </div>
    </div>
  );
};

export default Canvas;
