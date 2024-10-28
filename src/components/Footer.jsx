import React from 'react'

function Footer() {
  return <div className="d-flex flex-column flex-md-row align-items-center justify-content-between p-3 footer">
  <div className="d-flex align-items-center mb-2 mb-md-0 mx-5">
    <img src="/images/logo.jpeg" alt="Logo" style={{ height: '40px' }} />
    <span className="fw-semibold ms-2">Connectify</span>
  </div>

  <div className="text-center my-2 my-md-0 col mx-5">
    <strong>ADIB AFSAR</strong>
    <div className="social-icons d-flex justify-content-center mt-2">
      <a href="https://facebook.com" style={{ color: 'white', margin: '0 10px' }}>
        <i className="bi bi-facebook"></i>
      </a>
      <a href="https://twitter.com" style={{ color: 'white', margin: '0 10px' }}>
        <i className="bi bi-twitter"></i>
      </a>
      <a href="https://instagram.com" style={{ color: 'white', margin: '0 10px' }}>
        <i className="bi bi-instagram"></i>
      </a>
    </div>
  </div>

  <div className="col text-center mt-3 mt-md-0">
    <p className="fw-semibold mb-1">&copy; 2024 Connectify. All rights reserved.</p>
    <p className="mb-0">123 anonymous Street, unknown City, alien Country</p>
  </div>
</div>

       
 
}

export default Footer