import React from 'react';
import styles from './Skeleton.module.css';

const Skeleton = ({ type = 'text', className = '', style = {} }) => {
  const classNames = `${styles.skeleton} ${styles[type]} ${className}`;
  return <div className={classNames} style={style} />;
};

export default Skeleton;
