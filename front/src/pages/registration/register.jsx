import React, { useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../..';
import styles from './register.module.css';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const { store } = useContext(Context);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [step, setStep] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(null);
  const [emailValid, setEmailValid] = useState(null);
  const [loginValid, setLoginValid] = useState(null);
  const [validation, setValidation] = useState({
    'длина не менее 8 символов': null,
    'минимум 1 спец. символ': null,
    'минимум 2 цифры': null,
    'минимум 1 заглавная буква': null,
  });


  const navigate = useNavigate();

  useEffect(() => {
    if(store.isAuth){
        navigate('/projects');
      }
  }, [store.isAuth]);

  useEffect(() => {
    validatePassword(password);
  }, [password]);
  useEffect(() => {
    validatePasswordConfirm(passwordConfirm);
  }, [passwordConfirm]);

  const validateEmail = () => {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    setEmailValid(emailRegex.test(email));
  };

  const validateLogin = () => {
    setLoginValid(login.length > 5);
  };

  const validatePassword = (password) => {
    setValidation({
      'длина не менее 8 символов': password.length >= 8,
      'минимум 1 спец. символ': /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(password),
      'минимум 2 цифры': (password.match(/\d/g) || []).length >= 2,
      'минимум 1 заглавная буква': /[A-Z]/.test(password),
    });
  };
  const validatePasswordConfirm = (passwordConfirm) => {
    setConfirmPasswordValid(password === passwordConfirm);
  };

  async function handleRegister(email, password, login) {
    validateEmail()
    validateLogin()
    setStep(true)
    console.log(step)
    await store.registration(email, password, login);
  }
  return (
    <div className={styles.center}>
      <div className={styles.centered}>
        <p className={styles.registerLabel}> <span style={{color:'#C586C0'}}>import</span> fastannot <span style={{color:'#C586C0'}}>as</span> fa</p>
        <p className={styles.label}>#объявите почту</p>
        <label>email = </label>
        <input
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className={styles.input}
        />
        {step && !emailValid && <div className={styles.error}>#введите верную почту</div>}
        <p className={styles.label}>#объявите логин</p>
        <label>login = </label>
        <input
          type="text"
          onChange={(e) => setLogin(e.target.value)}
          value={login}
          className={styles.input}
        />
        {step && !loginValid && <div className={styles.error}>#логин должен быть длиннее 5 символов</div>}
        <p className={styles.label}>#объявите пароль</p>

        <label>password = </label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className={styles.input}
        />
        {step && Object.entries(validation).map(([key, value]) =>
          value === false ? (
            <p key={key} className={styles.errorPass}>
              #{key}
            </p>
          ) : null
        )}
        <p className={styles.label}>#повторите пароль</p>
        <label>password2 = </label>
        <input
          type="password"
          onChange={(e) => setPasswordConfirm(e.target.value)}
          value={passwordConfirm}
          style={{ color: password == passwordConfirm ? '' : '#a70000' }}
          className={styles.input}
        />
        {password !== passwordConfirm && <div className={styles.error}>#пароли должны совпадать</div>}
        {store.error && <div className={styles.error}>{store.error}</div>}
        <p className={styles.label} style={{margin: '100px 0 5px 0'}}>#нажмите на функцию, чтобы зарегистрироваться</p>
        <button onClick={() => handleRegister(email, password, login)} className={styles.button} style={{textAlign:'le'}}>
          <p style={{textAlign:'left'}}>if(password == password2):</p> 
          <p style={{margin: '0 0 0 20px', textAlign:'left'}}>fa.register(email, password, login)</p> 
          
          
        </button>
        <div className={styles.buttons}>
          <div className={styles.child}>
            <p className={styles.label} style={{margin: '50px 0 5px 0', fontSize:'14px'}}>#уже зарегистрированы?</p>
            <button onClick={() => navigate('/login')} className={styles.button} style={{fontSize:'14px'}} >
              fa.login()
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(RegisterPage);