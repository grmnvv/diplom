import React, { useState, useEffect, useContext } from "react";

import { Context } from "../..";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import styles from "./projects.module.css";

const Projects = () => {
  const { store } = useContext(Context);

  useEffect(() => {
    store.getProject();
    console.log(store.allProjects);
  }, []);

  const handleDelete = async (id) => {
    await store.deleteProject(id);
    await store.getProject(); // обновляем список проектов после удаления
  };


  return (
    <div className={styles.projectsContainer}>
      <div className={`${styles.projectCard} ${styles.newProjectCard}`}>
        <div>Создать проект</div>
        <Link to={`/project/new`}>
          <button>Создать проект</button>
        </Link>
      </div>
      {store.allProjects.slice().map((project) => (
        <div key={project.id} className={styles.projectCard}>
          <div>
            <h2>{project.name}</h2>
          </div>
          <div>
            <p>Images: {project.imageData.length}</p>
            <p>
              Annotated:{" "}
              {
                project.imageData.filter((image) => image.rects.length > 0)
                  .length
              }
            </p>
          </div>
          <div>
          <Link to={`/project/edit/${project.id}`}>
            <button>Редактировать проект</button>
          </Link>
            <button onClick={() => handleDelete(project.id)}>
              Удалить проект
            </button>
          </div>
          <Link to={`/project/${project.id}`}>
            <button>Открыть проект</button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default observer(Projects);
