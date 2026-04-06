import React from 'react';
import styles from './AuthLayout.module.css';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className={styles.container}>
      <div className={styles.blob}></div>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
