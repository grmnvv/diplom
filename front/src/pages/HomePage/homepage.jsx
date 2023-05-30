import { observer } from 'mobx-react-lite'
import React from 'react'
import Header from '../../components/Header/Header';
import styles from './homepage.module.css'
import Image from '../../assets/usage.png'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate()
  return (
    <div className={styles.main}>
    <Header/>
    <div className={styles.container}>
      <div className={styles.logo}>FASTANNOTATION</div>
      <div className={styles.underlogo}>Разметка данных в паре с быстрейшей нейронной сетью в таких форматах как YOLoV8, yoloV7, yoloV6 & CRNN</div>
      <button onClick={() => navigate('/login')}>welcome to command</button>
      <div className={styles.image}>
        <img src={Image} />
      </div>
    </div>
    </div>
  )
}

export default observer(HomePage);