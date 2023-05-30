import React, { useState, useEffect, useContext } from "react";

import { Context } from "../..";
import { observer } from "mobx-react-lite";
import { Link, useNavigate } from "react-router-dom";
import styles from "./projects.module.css";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header/Header";

const Projects = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // флаг для отслеживания состояния компонента

    const refreshAndLoad = async () => {
      await store.refresh();
      await store.getProject();
      if (isMounted) {
        console.log(store.allProjects);
        if (!store.isAuth) {
          navigate("/login");
        }
      }
    };

    refreshAndLoad();

    return () => { isMounted = false }; // очистка эффекта
  }, []);

  const handleDelete = async (id) => {
    await store.deleteProject(id);
    if(store.getProject){
      await store.getProject(); // обновляем список проектов после удаления
    }
  };

  if(store.isLoading){
    return(
      <div className={styles.center}>
        <p className={styles.label}>#загрузка</p>
      </div>
    )
  } else {
    return (
      <>
        <Header login={store.user && store.user.login } />
        <div className={styles.center}>
          <div className={styles.centered}>
            {store.allProjects && store.allProjects.length !== 0 && (
              <p className={styles.label}>#список ваших проектов</p>
            )}
            {store.allProjects && store.allProjects.slice().map((project) => (
                <div key={project.id} className={styles.projectCard}>
                  {store.allProjects && (
                    <div className={styles.projectInfo}>
                      <p>fa.project.name = '{project.name}'</p>
                      <p>fa.project.images = {project.imageData ? project.imageData.length : 0}</p>
                      <p>
                        fa.project.annotated ={" "}
                        {project.imageData && project.imageData.filter(
                            (image) => image.rects && image.rects.length > 0
                          ).length}
                      </p>
                    </div>
                  )}
                  {project.id && <div className={styles.buttons}>
                    <div className={styles.child}>
                      <p
                        className={styles.label}
                        style={{ margin: "10px 0 5px 0", fontSize: "14px" }}
                      >
                        #открыть проект
                      </p>
                      <button
                        onClick={() => navigate(`/project/${project.id}`)}
                        className={styles.button}
                      >
                        fa.open_project('{project.name}')
                      </button>
                    </div>
                    <div className={styles.child}>
                      <p
                        className={styles.label}
                        style={{ margin: "10px 0 5px 0", fontSize: "14px" }}
                      >
                        #редактировать проект
                      </p>
                      <button
                        onClick={() => navigate(`/project/edit/${project.id}`)}
                        className={styles.button}
                      >
                        fa.edit_project('{project.name}')
                      </button>
                    </div>
                    <div className={styles.child}>
                      <p
                        className={styles.label}
                        style={{ margin: "10px 0 5px 0", fontSize: "14px" }}
                      >
                        #удалить проект
                      </p>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className={styles.button}
                      >
                        fa.delete_project('{project.name}')
                      </button>
                    </div>
                  </div>}
                </div>
              ))}
            <p
              className={styles.label}
              style={store.allProjects.length !== 0 ? { margin: "100px 0 5px 0" } : {}}
            >
              #создать новый проект
            </p>
            <button
              style={{ fontSize: "16px" }}
              onClick={() => navigate("/project/new")}
              className={styles.button}
            >
              fa.create_project()
            </button>
          </div>
        </div>
      </>
    );
  }

};

export default observer(Projects);
