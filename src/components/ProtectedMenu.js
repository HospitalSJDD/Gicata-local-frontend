import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Menu from './Menu';
import UploadDocuments from './UploadDocuments';
import Questions from './Questions';
import AdminUser from './AdminUser'; // Asegúrate de importar el componente de administración de usuarios
import { Navigate } from 'react-router-dom';
const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app";
const ProtectedMenu = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/user`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();

        if (response.ok) {
          setAuthenticated(true); // El usuario ha sido autenticado correctamente
          setPermissions(data.permissions || []); // Guardar los permisos del usuario
        } else {
          navigate('/login-error'); // Redirigir al login si no está autenticado
        }
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        navigate('/login-error');
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Verificar si el usuario tiene permiso para acceder a la administración de usuarios
  const hasAdminAccess = permissions.includes('Administrador') || permissions.includes('Supervisor (Editor)');

  return authenticated ? (
    <Routes>
      <Route path="/menu" element={<Menu />} />
      <Route path="/upload" element={<UploadDocuments />} />
      <Route path="/questions" element={<Questions />} />
      <Route 
        path="/admin" 
        element={hasAdminAccess ? <AdminUser /> : <Navigate to="/permission-errors" replace />} 
      />
    </Routes>
  ) : null;
};

export default ProtectedMenu;
