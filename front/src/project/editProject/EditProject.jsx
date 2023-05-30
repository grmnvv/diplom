import React, { useState, useEffect, useContext } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditProject.module.css";

import { Context } from "../..";

const EditProject = () => {
  const { store } = useContext(Context);
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState({
    projectName: "",
    imagesData: [],
  });
  const [value, setValue] = useState("");

  useEffect(() => {
    const projectToEdit = store.allProjects.find((proj) => proj.id === id);
    if (projectToEdit) {
      setProject({
        projectName: projectToEdit.name,
        imagesData: projectToEdit.imageData,
      });
    } else {
      navigate("/projects");
    }
  }, [id, store]);

  useEffect(() => {
    console.log(project);
  }, [project]);

  const handleImageDelete = (imageIndex) => {
    const newImagesData = project.imagesData.filter(
      (_, index) => index !== imageIndex
    );
    setProject({ ...project, imagesData: newImagesData });
  };

  const handleFiles = (files) => {
    if (files) {
      const newImagesData = Array.from(files).map((file) => ({
        file,
        url: URL.createObjectURL(file),
        rects: [],
        name: file.name,
      }));

      setProject({
        ...project,
        imagesData: [...project.imagesData, ...newImagesData],
      });
    }
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("projectName", project.projectName);
    project.imagesData.forEach((imageData, index) => {
      formData.append(`images`, imageData.file, imageData.name);
    });

    await store.updateProject(id, formData);
    navigate("/projects");
  };

  return (
    <div className={styles.center}>
      <div className={styles.centered}>
        <p className={styles.loginLabel}><span style={{color:'#C586C0'}}>import</span> fastannot <span style={{color:'#C586C0'}}>as</span> fa</p>
        <p className={styles.label}>#объявите название проекта</p>
        <label>projectName = </label>
        <input
          type="text"
          value={project.projectName}
          onChange={(e) => setProject({...project, projectName: e.target.value})}
          className={styles.input}
        />
        <p className={styles.label}>#добавьте изображения</p>
        <label htmlFor="file-input" className={styles.button}>fa.addImages()</label>
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          multiple
          style={{ display: "none" }}
        />
        <div className={styles.imagesContainer}>
          {project.imagesData.map((imageData, index) => (
            <div key={index} className={styles.child}>
              <img src={imageData.url} alt="project-thumbnail" className={styles.image}/>
              <button onClick={() => handleImageDelete(index)} className={styles.button}>
                fa.deleteImage()
              </button>
            </div>
          ))}
        </div>
        <p className={styles.label} style={{margin: '50px 0 5px 0'}}>#нажмите на функцию, чтобы сохранить изменения</p>
        <button onClick={handleSubmit} className={styles.button} style={{margin:'0 0 100px 0'}}>
          fa.saveChanges()
        </button>
      </div>
    </div>
  );
};

export default observer(EditProject);