import React, {useState, useEffect, useContext} from 'react'
import { Context } from '../..';


const NewProject = () => {
    const {store} = useContext(Context);


  return (
    <div>
        <div>
            <p>
                Название проекта
            </p>
            <input type="text" />
        </div>
        <div>
            <p>Drag&Drop</p>
            <input type="file" name="" />
        </div>
        <div>
            <p>Использовать помощник</p>
            <input type="radio" />
        </div>
    </div>
  )
}

export default NewProject