import React, { useState, useContext, useEffect } from "react";
import ImageAnnotation from "./ImageAnnotation/ImageAnnotation";
import { Context } from "../..";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import styles from "./Canvas.module.css";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";

// Компонент для отображения эскиза изображения
const Thumbnail = ({ image, onClick, selected, index }) => {
  // Стиль выбранного эскиза
  const thumbnailStyle = selected
    ? { filter: "drop-shadow(0px 4px 41px #10781A)", borderRadius: "10px" }
    : {};

  return (
    <div className={styles.thumb}>
      {/* Отображение названия изображения */}
      <div
        style={{
          color: "white",
          fontSize: "14px",
          textAlign: "left",
          margin: "0 0 10px 0",
          display: "inline-block",
          width: "100%",
          textOverflow: "ellipsis",
        }}
      >
        fa[{index}].name = {image.name}
      </div>
      {/* Отображение эскиза изображения */}
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

// Основной компонент Canvas
const Canvas = () => {
  // Инициализация состояний и переменных с помощью хуков
  const [imagesData, setImagesData] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [allCanvasRect, setAllCanvasRect] = useState([]);
  const { store } = useContext(Context);
  const { id } = useParams();
  const [thumbnailsCollapsed, setThumbnailsCollapsed] = useState(false);

  // Обработчик клика на кнопку сворачивания эскизов
  const handleCollapseClick = () => {
    setThumbnailsCollapsed(!thumbnailsCollapsed);
  };

  // Загрузка данных проекта и обновление состояний
  useEffect(() => {
    store.refresh();
    store.getProject();
    store.selectProject(id);
  }, []);

  // Обновление состояний при изменении данных проекта
  useEffect(() => {
    if (store.isLoading == false) {
      store.selectProject(id);
      if (store.Project.id !== "") {
        setImagesData(store.Project.imageData);
        console.log(store.Project);
      }
    }
  }, [store.Project]);

  // Обработчик клика на эскиз изображения
  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    saveToProject();
  };

  // Сохранение проекта в базе данных
  const saveToProject = () => {
    store.Project.imageData = imagesData;
    store.saveProject();
    console.log("Сохранено в проект.");
  };

  // Изменение прямоугольников на изображении
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

  // Сохранение обрезанных изображений в формате zip
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

  // Сохранение проекта в формате YOLO
  async function saveYOLOformat() {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    const annotationsFolder = zip.folder("annotations");

    const allLabels = [];

    const collectUniqueLabels = (imageDataArray) => {
      const uniqueLabels = [
        ...new Set(
          imageDataArray.flatMap((imageData) =>
            imageData.rects.map((rect) => rect.label)
          )
        ),
      ];
      allLabels.push(...uniqueLabels);
    };

    const processImage = (imageData) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageData.url;

        img.onload = () => {
          const promises = [];

          if (!imageData.rects.length) {
            resolve();
            return;
          }

          const filename = imageData.name.split(".").slice(0, -1).join(".");
          const annotations = [];

          for (const rect of imageData.rects) {
            const labelIndex = allLabels.indexOf(rect.label);
            if (labelIndex === -1) {
              throw new Error(`Label '${rect.label}' not found in allLabels`);
            }

            const normalizedX = (rect.x + rect.width / 2) / img.width;
            const normalizedY = (rect.y + rect.height / 2) / img.height;
            const normalizedWidth = rect.width / img.width;
            const normalizedHeight = rect.height / img.height;

            const annotation = `${labelIndex} ${normalizedX} ${normalizedY} ${normalizedWidth} ${normalizedHeight}\n`;
            annotations.push(annotation);
          }

          if (annotations.length === 0) {
            resolve();
            return;
          }

          annotationsFolder.file(`${filename}.txt`, annotations.join(""));

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const blobPromise = new Promise((resolveBlob) => {
            canvas.toBlob((blob) => {
              imagesFolder.file(`${filename}.jpeg`, blob);
              resolveBlob();
            }, "image/jpeg");
          });

          promises.push(blobPromise);

          Promise.all(promises).then(() => resolve());
        };
      });
    };

    const allImageData = imagesData;
    collectUniqueLabels(allImageData);

    for (const imageData of allImageData) {
      await processImage(imageData);
    }

    const labelsAsObject = allLabels.reduce((obj, label, index) => {
      obj[index + 1] = label;
      return obj;
    }, {});
    zip.file("labels_object.txt", JSON.stringify(labelsAsObject, null, 2));
    zip.file("labels_array.txt", JSON.stringify(allLabels, null, 2));

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "images_and_annotations.zip");
    });
  }

  return (
    <div className={styles.center}>
      <Header login={store.user.login} />
      <div className={styles.workspace}>
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
        {/* Кнопка сворачивания эскизов */}
        <button
          onClick={handleCollapseClick}
          style={{ position: "absolute", left: 0, top: "50%" }}
        >
          {thumbnailsCollapsed ? ">" : "<"}
        </button>
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
              saveToProject={saveToProject}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Экспорт компонента Canvas с использованием observer
export default observer(Canvas);
