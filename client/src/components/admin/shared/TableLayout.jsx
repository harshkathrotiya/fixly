import React from 'react';

const TableLayout = ({ children, title, actionButton }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {actionButton}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export default TableLayout;