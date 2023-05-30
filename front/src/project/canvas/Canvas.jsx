import React, { useState, useContext, useEffect } from "react";
import ImageAnnotation from "./ImageAnnotation/ImageAnnotation";
import { Context } from "../..";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import styles from "./Canvas.module.css";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";

const Thumbnail = ({ image, onClick, selected, index }) => {
  const thumbnailStyle = selected
    ? { filter: "drop-shadow(0px 4px 41px #10781A)", borderRadius: "10px" }
    : {};

  return (
    <div className={styles.thumb}>
      <div
        style={{
          color: "white",
          fontSize: "14px",
          textAlign: "left",
          margin: "0 0 10px 0",
          display: "inline-block",
          width: "100%",
        }}
      >
        fa[{index}].name = {image.name}
      </div>
      <img
        src={image.url}
        alt="thumbnail"
        width="150"
        onClick={onClick}
        style={thumbnailStyle}
      />
    </div>
  );
};

const Canvas = () => {
  const [imagesData, setImagesData] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [allCanvasRect, setAllCanvasRect] = useState([]);
  const { store } = useContext(Context);
  const { id } = useParams();
  const [thumbnailsCollapsed, setThumbnailsCollapsed] = useState(false);

  const handleCollapseClick = () => {
    setThumbnailsCollapsed(!thumbnailsCollapsed);
  };
  useEffect(() => {
    store.getProject();
    store.selectProject(id);
  }, []);

  useEffect(() => {
    if (store.isLoading == false) {
      store.selectProject(id);
      if (store.Project.id !== "") {
        setImagesData(store.Project.imageData);
        console.log(store.Project);
      }
    }
  }, [store.Project, store.isLoading]);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    saveToProject();
  };

  const saveToProject = () => {
    store.Project.imageData = imagesData;
    store.saveProject();
    console.log("Сохранено в проект.");
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
  async function saveYOLOformat() {
    const zip = new JSZip();
    const imagesFolder = zip.folder("cropped_images");
    const annotationsFolder = zip.folder("annotations");
  
    const allLabels = [];
  
    const collectUniqueLabels = (imageDataArray) => {
      const uniqueLabels = [...new Set(imageDataArray.flatMap(imageData => imageData.rects.map(rect => rect.label)))];
      allLabels.push(...uniqueLabels);
    };
  
    const processImage = (imageData) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageData.url;
  
        img.onload = () => {
          const promises = [];
          const filename = imageData.name;
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
                imagesFolder.file(`${filename}.jpeg`, blob);
                resolveBlob();
              }, "image/jpeg");
            });
  
            promises.push(blobPromise);
  
            // Если rect.label пуст, пропустите этот прямоугольник
            if (!rect.label) {
              continue;
            }
  
            // Получение индекса label для YOLO
            const labelIndex = allLabels.indexOf(rect.label);
            if (labelIndex === -1) {
              throw new Error(`Label '${rect.label}' not found in allLabels`);
            }
  
            // Формат аннотации YOLO
            const normalizedX = (rect.x + rect.width / 2) / img.width;
            const normalizedY = (rect.y + rect.height / 2) / img.height;
            const normalizedWidth = rect.width / img.width;
            const normalizedHeight = rect.height / img.height;
            const annotation = `${labelIndex} ${normalizedX} ${normalizedY} ${normalizedWidth} ${normalizedHeight}\n`;
            
            // Сохранение аннотации
            annotationsFolder.file(`${filename}.txt`, annotation);
          }
  
          Promise.all(promises).then(() => resolve());
        };
      });
    };
  
    const allImageData = imagesData; // замените это на массив с вашими данными imageData
    
    // Сбор уникальных меток перед обработкой изображений
    collectUniqueLabels(allImageData);
  
    for (const imageData of allImageData) {
      await processImage(imageData);
    }
  
    // Сохранение меток в текстовый файл
    const labelsAsObject = allLabels.reduce((obj, label, index) => {
      obj[index + 1] = label;
      return obj;
    }, {});
    zip.file("labels_object.txt", JSON.stringify(labelsAsObject, null, 2));
    zip.file("labels_array.txt", JSON.stringify(allLabels, null, 2));
  
    zip.generateAsync({type: "blob"}).then((content) => {
      saveAs(content, "images_and_annotations.zip");
    });

    
  }

  return (
    <div className={styles.center}>
      <div className={styles.workspace}>
        {/* Показываем или прячем миниатюры в зависимости от состояния thumbnailsCollapsed */}
        {!thumbnailsCollapsed && (
          <div className={styles.thumbnail}>
            {imagesData.map((imageData, index) => (
              <div key={index}>
                <Thumbnail
                  key={index}
                  image={imageData}
                  onClick={() => handleImageClick(index)}
                  selected={index === selectedImageIndex}
                  index={index}
                />
              </div>
            ))}
          </div>
        )}
        {/* Добавляем кнопку для сворачивания миниатюр */}
        <button
          onClick={handleCollapseClick}
          style={{ position: "absolute", left: 0, top: "50%" }}
        >
          {thumbnailsCollapsed ? ">" : "<"}
        </button>
        {/* Даем imageannotation области занимать все пространство, когда миниатюры свернуты */}
        <div
          className={
            thumbnailsCollapsed
              ? styles.imageannotationFullWidth
              : styles.imageannotation
          }
        >
          {selectedImageIndex !== null && (
            <ImageAnnotation
              imageURL={imagesData[selectedImageIndex].url}
              rects={imagesData[selectedImageIndex].rects}
              onRectsChange={handleRectsChange}
              saveAllCroppedImages={saveCroppedImages}
              saveCRNN={saveCroppedImages}
              saveYOLO={saveYOLOformat}
              thumbnailsCollapsed={thumbnailsCollapsed}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default observer(Canvas);
