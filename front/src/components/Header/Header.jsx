import { observer } from "mobx-react-lite";
import React, { useContext, useState } from "react";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import { Context } from "../..";

const Header = ({ login }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  if (login) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.registerLabel} onClick={() => navigate("/")}>
            {" "}
            <span style={{ color: "#C586C0" }}>import</span> fastannot{" "}
            <span style={{ color: "#C586C0" }}>as</span> fa
          </p>
          <div className={styles.menu} onClick={handleClick}>
            {login}
            {isOpen && (
              <div className={styles.dropdownReport}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => navigate("/projects")}
                >
                  fa.navigate('проекты')
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={async () => {await store.logout(); navigate('/')}}
                >
                  fa.exit()
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
        <p className={styles.registerLabel} onClick={() => navigate("/")}>
          {" "}
          <span style={{ color: "#C586C0" }}>import</span> fastannot{" "}
          <span style={{ color: "#C586C0" }}>as</span> fa
        </p>
        <button className={styles.menu} onClick={() => navigate('/login')}>
          fa.login()
        </button>
      </div>
      </div>
    );
  }
};

export default observer(Header);
