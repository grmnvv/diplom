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
    if(store.isAuth){
        navigate('/projects');
      }
}, [store.isAuth]); 

  async function handleLogin(email, password) {
     await store.login(email, password);


  }

  return (
    <div className={styles.center}>
      <h2 className={styles.loginLabel}>LOGIN</h2>
      <label className={styles.label}>Email</label>
      <input
        type="text"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        placeholder="Email/Username"
        className={styles.input}
      />
      <label className={styles.label}>Password</label>
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        placeholder="Password"
        className={styles.input}
      />
      {store.error && <div className={styles.error}>{store.error}</div>}
      <button onClick={() => handleLogin(email, password)} className={styles.button}>
        Login
      </button>
    </div>
  );
};

export default observer(LoginPage);
