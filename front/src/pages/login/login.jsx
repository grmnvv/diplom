import React, { useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import styles from './login.module.css';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { store } = useContext(Context);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    store.refresh()
}, []); 

  useEffect(() => {
    if(store.isAuth){
        navigate('/projects');
      }
}, [store.isAuth]); 

  async function handleLogin(email, password) {
     await store.login(email, password);


  }

  return (
    <div className={styles.center}>
      <div className={styles.centered}>
        <p className={styles.loginLabel}> <span style={{color:'#C586C0'}}>import</span> fastannot <span style={{color:'#C586C0'}}>as</span> fa</p>
        <p className={styles.label}>#объявите почту</p>
        <label>email = </label>
        <input
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className={styles.input}
        />
        <p className={styles.label}>#объявите пароль</p>
        <label>password = </label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className={styles.input}
        />
        {store.error && <div className={styles.error}>{store.error}</div>}
        <p className={styles.label} style={{margin: '100px 0 5px 0'}}>#нажмите на функцию, чтобы войти</p>
        <button onClick={() => handleLogin(email, password)} className={styles.button}>
          fa.login(email, password)
        </button>
        <div className={styles.buttons}>
          <div className={styles.child}>
            <p className={styles.label} style={{margin: '50px 0 5px 0', fontSize:'14px'}}>#не зарегистрированы</p>
            <button onClick={() => navigate('/registration')} className={styles.button} style={{fontSize:'14px'}} >
              fa.register()
            </button>
          </div>
          <div className={styles.child}>
          <p className={styles.label} style={{margin: '50px 0 5px 0', fontSize:'14px'}}>#забыли пароль</p>
            <button onClick={() => navigate('/reset-password')} className={styles.button} style={{fontSize:'14px'}}>
              fa.forgot()
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default observer(LoginPage);
