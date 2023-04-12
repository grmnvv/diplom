import React, {useState, useEffect, useContext} from 'react'
import { Context } from '../..';
import Store from '../../store/store';

const Projects = () => {
    const {store} = useContext(Context);
    useEffect({
        //store.getProjects()
    }, [])

  return (
    <div>
        {store.Projects.map((project, index) => {
            <div key={index}>
                <div>
                    <h2>{project.name}</h2>
                </div>
                <div>
                    <p>{project.count}</p>
                    <p>{project.annotated}</p>
                </div>
                <button>

                </button>
            </div>
        })}
        <div>
            Создать проект
        </div>
    </div>
  )
}

export default Projects;