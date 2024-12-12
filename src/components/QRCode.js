import React, { useState, useEffect } from 'react';
const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app";
const QRCode = () => {
  const [qrCodeUrl, setQRCodeUrl] = useState(null);

  useEffect(() => {
    // Hacer una solicitud al backend para obtener la imagen del código QR
    fetch(`${BACKEND_URL}/qrcode`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener el código QR');
        }
        return response.blob();
      })
      .then(blob => {
        // Convertir el blob en una URL de imagen
        const qrCodeUrl = URL.createObjectURL(blob);
        setQRCodeUrl(qrCodeUrl);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h2>Escanea este código QR en Google Authenticator</h2>
      {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" /> : <p>Cargando código QR...</p>}
    </div>
  );
};

export default QRCode;
