import React, { useState, useEffect, useContext } from "react";

import { Context } from "../..";
import { observer } from "mobx-react-lite";
import { Link, useNavigate } from "react-router-dom";
import styles from "./projects.module.css";
import { Navigate } from "react-router-dom";

const Projects = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  useEffect(() => {
    store.getProject();
    console.log(store.allProjects);
  }, []);

  const handleDelete = async (id) => {
    await store.deleteProject(id);
    await store.getProject(); // обновляем список проектов после удаления
  };



  return (
    <div className={styles.center}>
      <div className={styles.centered}>
        <p className={styles.loginLabel}><span style={{color:'#C586C0'}}>import</span> fastannot <span style={{color:'#C586C0'}}>as</span> fa</p>
        <p className={styles.label}>#список ваших проектов</p>
        {store.allProjects.slice().map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectInfo}>
              <p>fa.project.name = '{project.name}'</p>
              <p>fa.project.images = {project.imageData.length}</p>
              <p>fa.project.annotated = {
                project.imageData.filter((image) => image.rects.length > 0).length
              }</p>
            </div>
            <div className={styles.buttons}>
              <div className={styles.child}>
                <p className={styles.label} style={{margin: '10px 0 5px 0', fontSize:'14px'}}>#открыть проект</p>
                <button onClick={() => navigate(`/project/${project.id}`)} className={styles.button}>
                  fa.open_project('{project.name}')
                </button>
              </div>
              <div className={styles.child}>
                <p className={styles.label} style={{margin: '10px 0 5px 0', fontSize:'14px'}}>#редактировать проект</p>
                <button onClick={() => navigate(`/project/edit/${project.id}`)} className={styles.button}>
                  fa.edit_project('{project.name}')
                </button>
              </div>
              <div className={styles.child}>
                <p className={styles.label} style={{margin: '10px 0 5px 0', fontSize:'14px'}}>#удалить проект</p>
                <button onClick={() => handleDelete(project.id)} className={styles.button}>
                  fa.delete_project('{project.name}')
                </button>
              </div>
            </div>
          </div>
        ))}
        <p className={styles.label} style={{margin: '100px 0 5px 0'}}>#создать новый проект</p>
        <button onClick={() => navigate('/project/new')} className={styles.button}>
          fa.create_project()
        </button>
      </div>
    </div>
  );
};




export default observer(Projects);
