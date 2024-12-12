import React from 'react';
import '../styles/LoginButton.css';  // Ruta relativa correcta para importar los estilos del botón
const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app"
const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/login`;  // Redirige al backend para iniciar sesión
  };

  return (
    <button className="login-button" onClick={handleLogin}>
      Iniciar sesión
    </button>
  );
};

export default LoginButton;
