import React, { useState, useContext } from 'react';
import { Context } from '../..';
import styles from './NewProject.module.css';
import { v4 as uuidv4 } from 'uuid';

const NewProject = () => {
  const { store } = useContext(Context);
  const [projectName, setProjectName] = useState('');
  const [imagesData, setImagesData] = useState([]);
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
        file,
        url: URL.createObjectURL(file),
        rects: [],
        name: file.name,
      }));
  
      setImagesData((prevImagesData) => [...prevImagesData, ...newImagesData]);
    }
  };

  const handleSubmit = async () => {
    const projectNew = {
      projectName,
      imagesData,
      id: uuidv4(),
    };
  
    const formData = new FormData();
    formData.append('projectName', projectNew.projectName);
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
    <div className={styles.center}>
      <div className={styles.centered}>
        <p className={styles.loginLabel}> <span style={{color:'#C586C0'}}>import</span> fastannot <span style={{color:'#C586C0'}}>as</span> fa</p>
        <p className={styles.label}>#объявите название проекта</p>
        <label>projectName = </label>
        <input type="text" value={projectName} onChange={handleProjectNameChange} className={styles.input} />
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>{imagesData.length ? `${imagesData.length} файл(ов)` : 'Перетащите файлы сюда или '}</p>
          <label htmlFor="file-input" className={styles.button}>
            Добавить файлы
          </label>
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            multiple
            style={{ display: 'none' }}
          />
        </div>
        <p className={styles.label} style={{margin: '100px 0 5px 0'}}>#нажмите на функцию, чтобы создать проект</p>
        <button onClick={handleSubmit} className={styles.button}>
          fa.createProject(projectName, files)
        </button>
      </div>
    </div>
  );
};

export default NewProject;
