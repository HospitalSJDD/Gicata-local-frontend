import React from 'react';
import '../styles/LoginError.css'; // Nuevo archivo CSS para estilos personalizados de la página de error

const PermissionError = () => {
  return (
    <div className="error-container">
      <div className="error-box">
        <h1 className="error-title">Error de Permisos</h1>
        <p className="error-message">No tiene permisos para acceder a estas funcionalidades.</p>
        <button className="error-button" onClick={() => window.location.href = '/menu'}>Regresar al menu</button>
      </div>
    </div>
  );
};

export default PermissionError;
