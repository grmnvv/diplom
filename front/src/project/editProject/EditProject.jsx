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
    console.log(projectToEdit)
    if (projectToEdit) {
      setProject(projectToEdit);
    } else {
      // Например, перенаправить пользователя обратно к списку проектов
      navigate("/projects");
    }
  }, [id, store]);

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
    <div>
      <div>
        <p>Название проекта</p>
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div>
        {project.imagesData &&
          project.imagesData.map((imageData, index) => (
            <div key={index}>
              <img src={imageData.url} alt="project-thumbnail" width="100" />
              <button onClick={() => handleImageDelete(index)}>
                Удалить изображение
              </button>
            </div>
          ))}
      </div>
      <div>
        <label htmlFor="file-input" className="file-upload-button">
          Добавить изображения
        </label>
        <input
          type="file"
          id="file-input"
          name=""
          onChange={handleFileChange}
          multiple
          style={{ display: "none" }}
        />
      </div>
      <button onClick={handleSubmit}>Сохранить изменения</button>
    </div>
  );
};

export default observer(EditProject);
