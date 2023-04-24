import React, { useState, useContext } from 'react';
import { Context } from '../..';
import styles from './NewProject.module.css';
import { v4 as uuidv4 } from 'uuid';

const NewProject = () => {
  const { store } = useContext(Context);
  const [projectName, setProjectName] = useState('');
  const [imagesData, setImagesData] = useState([]);
  const [isHelper, setIsHelper] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleProjectNameChange = (e) => {
    setProjectName(e.target.value);
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };
  const dataURLtoBlob = (dataURL) => {
    const binary = atob(dataURL.split(",")[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: "image/jpeg" });
  };
  const handleFiles = (files) => {
    if (files) {
      const newImagesData = Array.from(files).map((file) => ({
        file, // Добавьте эту строку
        url: URL.createObjectURL(file),
        rects: [],
        name: file.name,
      }));
  
      setImagesData((prevImagesData) => [...prevImagesData, ...newImagesData]);
    }
  };
  

  const handleIsHelperChange = () => {
    setIsHelper(!isHelper);
  };

  const handleSubmit = async () => {
    const projectNew = {
      projectName,
      imagesData,
      isHelper,
      id: uuidv4(),
    };
  
    const formData = new FormData();
    formData.append('projectName', projectNew.projectName);
    formData.append('isHelper', projectNew.isHelper);
    formData.append('id', projectNew.id);
    projectNew.imagesData.forEach((imageData, index) => {
      formData.append(`images`, imageData.file, imageData.name);
      formData.append(`rects[${index}]`, JSON.stringify(imageData.rects));
    });
    store.createProject(formData)


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
    <div>
      <div>
        <p>Название проекта</p>
        <input type="text" value={projectName} onChange={handleProjectNameChange} />
      </div>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>{imagesData.length ? `${imagesData.length} файл(ов)` : 'Перетащите файлы сюда'}</p>
      </div>
      <div>
        <label htmlFor="file-input" className="file-upload-button">
          Выберите файлы
        </label>
        <input
          type="file"
          id="file-input"
          name=""
          onChange={handleFileChange}
          multiple
          style={{ display: 'none' }}
        />
      </div>
      <div>
        <p>Использовать помощник</p>
        <input type="checkbox" checked={isHelper} onChange={handleIsHelperChange} />
      </div>
      <button onClick={handleSubmit}>Создать проект</button>
    </div>
  );
};

export default NewProject;
