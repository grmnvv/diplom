import React, { useContext, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../..";
import styles from "./forgot.module.css";
import { useNavigate } from "react-router-dom";

const ForgotPage = () => {
  const { store } = useContext(Context);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [enter, setEnter] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [emailVal, setEmailVal] = useState(null);
  const [error, setError] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  async function handleResetRequest(email) {
    try {
    
      if(email !== ''){
        const Acode = Math.floor(Math.random() * 9000 * 1000);
        setCode(Acode);
        console.log(Acode);
  
        await store.sendCode(email, Acode);
  
        if (store.error === "") {
          setTimer(60);
          setTimerActive(true);
          setStep(2);
          setError('')
        }
  
        console.log(store.error);
      } else {
        setError('#введите логин')
      }
      
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  async function handleCodeValidation() {
    if (enter == code) {
      setStep(3);
    } else {
      setError("#неверный код");
    }
  }

  async function handlePasswordReset(password) {
    try {
      await store.changePassword(email, password);
      navigate("/login");
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }

  return (
    <div className={styles.center}>
      <div className={styles.centered}>
        <p className={styles.loginLabel}>
          {" "}
          <span style={{ color: "#C586C0" }}>import</span> fastannot{" "}
          <span style={{ color: "#C586C0" }}>as</span> fa
        </p>

        {step === 1 && (
          <>
            <p className={styles.label}>#объявите логин</p>
            <label>login = </label>
            <input
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className={styles.input}
            />
            <p className={styles.label}>#отправить код</p>
            <button
              onClick={() => {
                handleResetRequest(email);
              }}
              className={styles.button}
              disabled={timerActive ? true : false}
            >
              {timerActive ? `${timer}` : "fa.sendCode(login)"}
              
            </button>
            <p className={styles.error}>{error}</p>
          </>
        )}

        {step === 2 && (
          <>
            <p className={styles.label}>#объявите код с почты</p>

            <label>code = </label>
            <input
              type="text"
              onChange={(e) => setEnter(e.target.value)}
              value={enter}
              className={styles.input}
            />
            <p className={styles.label}>#проверить код</p>
            <button
              onClick={() => {
                handleCodeValidation();
              }}
              className={styles.button}
            >
              fa.validateCode()
            </button>
            <p className={styles.error}>{error}</p>
            <p className={styles.label}>#назад</p>
            <button
              onClick={() => {
                setStep(1);
              }}
              className={styles.button}
            > fa.back()
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p className={styles.label}>#объявите новый пароль</p>
            <label>password = </label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className={styles.input}
            />
            <p className={styles.label}>#обновить пароль</p>
            <button
              onClick={() => handlePasswordReset(password)}
              className={styles.button}
            >
              fa.resetPassword(password)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default observer(ForgotPage);
