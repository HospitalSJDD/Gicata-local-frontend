import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OTPVerification from './components/OTPVerification';
import UploadDocuments from './components/UploadDocuments';
import LoginError from './components/LoginError';
import LoginButton from './components/LoginButton';
import PermissionError from './components/PermissionError';
import ProtectedMenu from './components/ProtectedMenu';
import logo_coquimbo from './assets/images/salud_coquimbo.png';
import './App.css';

// Componente para la página de inicio con el botón de login
const Home = () => {
  useEffect(() => {
    document.title = "GICATA - Hospital"; // Establecer el título de la página
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo_coquimbo} alt="Logo del Hospital" className="login-logo" />
        <h1 className="login-title">GICATA</h1>
        <p className="login-subtitle">Portal de Autenticación - Hospital San Juan de Dios Vicuña</p>
        <p className="login-description">
          Este portal le permite acceder a la visualización de Indicadores Claves de manera rápida y segura.
        </p>
        <div className="login-button-container">
          <LoginButton />
        </div>
      </div>
    </div>
  );
};

// Componente principal con el enrutamiento
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta para la página de inicio (home) */}
        <Route path="/" element={<Home />} />

        {/* Ruta para la verificación de OTP */}
        <Route path="/otp-verification" element={<OTPVerification />} />

        {/* Ruta error login */}
        <Route path="/login-error" element={<LoginError />} />

        {/* Ruta error permisos */}
        <Route path="/permission-errors" element={<PermissionError />} />

        {/* Ruta protegida para el menú */}
        <Route path="/*" element={<ProtectedMenu />} />
      </Routes>
    </Router>
  );
};

export default App;
