// Импорт необходимых библиотек и компонентов
import React, { useState, useContext, useEffect } from "react";
import { Context } from "../..";
import styles from "./NewProject.module.css";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";

const NewProject = () => {
  // Инициализация состояний и контекста
  const { store } = useContext(Context);
  const [projectName, setProjectName] = useState("");
  const [imagesData, setImagesData] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(false);
  const navigate = useNavigate();

  // Функция для обновления названия проекта
  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
  };

  // Функция для обработки загрузки файлов
  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  // Получение данных из контекста
  useEffect(() => {
    store.refresh();
  }, []);

  // Функция для обработки файлов
  const handleFiles = (files) => {
    if (files) {
      // Создаем временный массив для хранения данных об изображениях
      const newImagesData = [];
      for (const file of Array.from(files)) {
        // Проверка типа файла
        if (!file.type.startsWith("image/")) {
          setError(`# файл '${file.name}' не изображение`);
          return;
        }
        // Добавляем файл в массив
        newImagesData.push({
          file,
          url: URL.createObjectURL(file),
          rects: [],
          name: file.name,
        });
      }
      // Обновление состояния данных изображения
      setError("");
      setImagesData((prevImagesData) => [...prevImagesData, ...newImagesData]);
    }
  };

  // Функция для обработки отправки формы
  const handleSubmit = async () => {
    if (projectName !== "") {
      // Создаем объект проекта
      const projectNew = {
        projectName,
        imagesData,
        id: uuidv4(),
      };
      const formData = new FormData();
      formData.append("projectName", projectNew.projectName);
      formData.append("id", projectNew.id);
      projectNew.imagesData.forEach((imageData, index) => {
        formData.append(`images`, imageData.file, imageData.name);
        formData.append(`rects[${index}]`, JSON.stringify(imageData.rects));
      });
      store.createProject(formData);
      navigate("/projects");
    } else {
      setName(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <Header login={store.user.login} />
      <div className={styles.center}>
        <div className={styles.centered}>
          <p className={styles.label}>#объявите название проекта</p>
          <label style={name ? { color: "#a70000" } : {}}>projectName = </label>
          <input
            type="text"
            value={projectName}
            onChange={handleProjectNameChange}
            className={styles.input}
          />
          <div
            className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>
              {imagesData.length
                ? `${imagesData.length} файл(ов)`
                : "Перетащите файлы сюда или "}
            </p>
            <label htmlFor="file-input" className={styles.button}>
              fa.addFiles()
            </label>
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              multiple
              style={{ display: "none" }}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <p className={styles.label} style={{ margin: "100px 0 5px 0" }}>
            #нажмите на функцию, чтобы создать проект
          </p>
          <button onClick={handleSubmit} className={styles.button}>
            fa.createProject(projectName, files)
          </button>
        </div>
      </div>
    </>
  );
};

export default NewProject;
