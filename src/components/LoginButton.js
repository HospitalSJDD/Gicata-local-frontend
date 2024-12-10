import React from 'react';
import '../styles/LoginButton.css';  // Ruta relativa correcta para importar los estilos del botón

const LoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/login';  // Redirige al backend para iniciar sesión
  };

  return (
    <button className="login-button" onClick={handleLogin}>
      Iniciar sesión
    </button>
  );
};

export default LoginButton;
