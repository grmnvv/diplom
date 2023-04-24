import React, { useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../..";
import styles from "./register.module.css";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { store } = useContext(Context);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [validation, setValidation] = useState({
    length: false,
    specialChar: false,
    digits: false,
    uppercase: false,
    confirmPassword: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (store.isRegistered) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [store.isRegistered, navigate]);

  const validatePassword = (password) => {
    console.log(validation)
    setValidation({
      length: password.length >= 8,
      specialChar: /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(password),
      digits: (password.match(/\d/g) || []).length >= 2,
      uppercase: /[A-Z]/.test(password),
      confirmPassword: password === passwordConfirm,
    });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    validatePassword(e.target.value);
  };

  const handlePasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);
    setValidation((prevValidation) => ({
      ...prevValidation,
      confirmPassword: password === e.target.value,
    }));
  };

  async function handleRegister(email, password, login) {
    try {
      await store.registration(email, password, login);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className={styles.container}>
            <div className={styles.center}>
      <h2 className={styles.registerLabel}>REGISTER</h2>
      <label className={styles.label}>Email</label>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        placeholder="Email"
        className={styles.input}
      />
      <label className={styles.label}>Login</label>
      <input
        type="text"
        onChange={(e) => setLogin(e.target.value)}
        value={login}
        placeholder="Login"
        className={styles.input}
      />
      <label className={styles.label}>Password</label>
      <input
        type="password"
        onChange={handlePasswordChange}
        value={password}
        placeholder="Password"
        className={`${styles.input} ${
          Object.values(validation).every((v) => v)
            ? styles.valid
            : styles.invalid
        }`}
      />
      <div className={styles.requirements}>
        <p className={validation.length ? styles.valid : styles.invalid}>
          Length &gt; 8
        </p>
        <p className={validation.specialChar ? styles.valid : styles.invalid}>
          Special character
        </p>
        <p className={validation.digits ? styles.valid : styles.invalid}>
          At least 2 digits
        </p>
        <p className={validation.uppercase ? styles.valid : styles.invalid}>
          One uppercase letter
        </p>
      </div>
      <label className={styles.label}>Confirm Password</label>
      <input
        type="password"
        onChange={handlePasswordConfirmChange}
        value={passwordConfirm}
        placeholder="Confirm Password"
        className={`${styles.input} ${
          validation.confirmPassword ? styles.valid : styles.invalid
        }`}
      />
      {store.isRegistered && (
        <div className={styles.success}>Registration successful</div>
      )}
      <button
        onClick={() => handleRegister(email, password, login)}
        className={styles.button}
        disabled={!Object.values(validation).every((v) => v)}
      >
        Register
      </button>
    </div>
    </div>
  );
};

export default observer(RegisterPage);
