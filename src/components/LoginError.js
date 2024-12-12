import React, {useEffect, useState } from 'react';
import '../styles/LoginError.css'; // Nuevo archivo CSS para estilos personalizados de la página de error
const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app";



const LoginError = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/session_data`, {
          method: 'GET',
          credentials: 'include', // Asegúrate de incluir las credenciales de la sesión
        });

        if (!response.ok) {
          throw new Error('Error al obtener los datos de la sesión');
        }

        const data = await response.json();
        console.log('Datos de la sesión:', data.session_data); // Mostrar en la consola

      } catch (err) {
        console.error('Error al verificar la sesión:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  return (
    <div className="error-container">
      <div className="error-box">
        <h1 className="error-title">Error de Autenticación</h1>
        <p className="error-message">No se pudo iniciar sesión. Por favor, inténtalo nuevamente.</p>
        <button className="error-button" onClick={() => window.location.href = '/'}>Regresar a Inicio</button>
      </div>
    </div>
  );
};

export default LoginError;
