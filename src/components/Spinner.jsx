import React from 'react';

const Spinner = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', width: '100%' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
