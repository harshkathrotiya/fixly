import React from 'react';
import { cardStyles } from './adminStyles';

const TableLayout = ({ children, title, actionButton }) => {
  return (
    <div className={cardStyles.container}>
      <div className={cardStyles.header}>
        <h2 className={cardStyles.title}>{title}</h2>
        {actionButton}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );

export default TableLayout;