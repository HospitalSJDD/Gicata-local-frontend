import React, { useState } from 'react';
import '../styles/OTPVerification.css';  // Asegúrate de que este archivo exista y tenga estilos opcionales
import logo_coquimbo from '../assets/images/salud_coquimbo.png';

const OTPVerification = () => {
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedOtp = otpCode.replace(/\s+/g, '');

    try {
      const response = await fetch('http://localhost:5000/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Asegura que se envíe como JSON
        },
        credentials: 'include',  // Permitir que las cookies de sesión se envíen con la solicitud
        body: JSON.stringify({ otp_code: formattedOtp }),  // Enviar el código OTP como JSON
      });

      const data = await response.json();

      if (response.status === 200) {
        window.location.href = '/menu';  // O la ruta a donde quieres redirigir
      } else {
        setMessage(data.message || 'Error en la verificación del OTP');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error en la verificación del OTP');
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-box">
        <img src={logo_coquimbo} alt="Logo del Hospital" className="login-logo" />
        <h2 className="otp-title">Verificación OTP</h2>
        <form onSubmit={handleSubmit} className="otp-form">
          <input
            type="text"
            placeholder="Ingresa el código OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="otp-input"
          />
          <button type="submit" className="otp-button">Verificar</button>
        </form>
        {message && <p className="otp-message">{message}</p>}  {/* Mostrar el resultado */}
      </div>
    </div>
  );
};

export default OTPVerification;
