import React, { useState } from 'react';
import SidebarMenu from './SidebarMenu';

import AdminUser from './AdminUser';
import Questions from './Questions';
import UploadDocuments from './UploadDocuments'; // Importar el nuevo componente
import Dashboard from './Dashboard';
import UploadKPI from './UploadKPI';
import '../styles/Menu.css';
import PreviewKPI from './PreviewKPI';
import HistoricalKPI from './HistoricalKPI';
import UploadData from './UploadData';
import PreviewData from './PreviewData';
import collage from '../assets/images/collage.png';
const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app";
const Menu = () => {
  const [view, setView] = useState('default'); // Estado para controlar la vista actual
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleQuestions = () => {
    triggerTransition(() => setView('questions'));
  };

  // Función para cambiar la vista de subir documentos
  const handleUploadClick = () => {
    triggerTransition(() => setView('upload'));
  };

  // Función para cambiar la vista al menú principal
  const handleHomeClick = () => {
    triggerTransition(() => setView('default'));
  };

  const handleDashboard = () => {
    triggerTransition(() => setView('dashboard'));
  };

  const handleUploadKpiClick = () => {
    triggerTransition(() => setView('uploadKPI'));
  };

  const handleAdminUserClick = () => {
    triggerTransition(() => setView('adminUser'));
  }

  const handlePreviewKPI = () => {
    triggerTransition(() => setView('indicators'))
  }

  const handleHistoricalKPI = () => {
    triggerTransition(() => setView('historical'))
  }

  const handleUploadData = () => {
    triggerTransition(() => setView('uploadData'))
  }
  const handlePreviewData = () => {
    triggerTransition(() => setView('previewData'))
  }



  // Función para activar la animación de transición antes de cambiar la vista
  const triggerTransition = (updateView) => {
    setIsTransitioning(true); // Activar la clase `active` para animación
    setTimeout(() => {
      updateView(); // Cambiar la vista después de la animación
      setIsTransitioning(false); // Desactivar la clase `active`
    }, 500); // Duración de la animación debe coincidir con la duración definida en CSS
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        window.location.href = '/'; // Redirige a la página de inicio de sesión
      } else {
        console.error('Error al cerrar la sesión');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="menu-container">
      <SidebarMenu

        onHomeClick={handleHomeClick}
        onUploadClick={handleUploadClick}
        onAdminUser={handleAdminUserClick}
        onQuestions={handleQuestions}
        onUploadKPIClick={handleUploadKpiClick} // Añadir la función de subida de KPI
        onLogout={handleLogout}
        onDashboard={handleDashboard}
        onPreviewKPI={handlePreviewKPI}
        onHistorical={handleHistoricalKPI}
        onUploadData={handleUploadData}
        onPreviewData={handlePreviewData}

      />
      <div className={`content-container-the-comeback ${isTransitioning ? 'active' : ''}`}>
        {view === 'default' && (
          <>
            <section className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">Bienvenido al Portal del Hospital</h1>
                <p className="hero-description">
                </p>
              </div>
            </section>

            <section className="featured-image-section">
              <img

                src={collage}
                alt="Collage Hospital San Juan de Dios"
                className="featured-image"
              />
            </section>
          </>
        )}
        <div className='content-container'>
          {view === 'adminUser' && <AdminUser onSuccess={handleHomeClick} />}
          {view === 'upload' && <UploadDocuments onSuccess={handleHomeClick} />}
          {view === 'questions' && <Questions onSuccess={handleQuestions} />}
          {view === 'dashboard' && <Dashboard onSuccess={handleDashboard} />}
          {view === 'uploadKPI' && <UploadKPI onSuccess={handlePreviewKPI} />}
          {view === 'indicators' && <PreviewKPI onSuccess={handlePreviewKPI} />}
          {view === 'historical' && <HistoricalKPI onSuccess={handleHistoricalKPI} />}
          {view === 'uploadData' && <UploadData onSuccess={handleUploadData} />}
          {view === 'previewData' && <PreviewData onSuccess={handlePreviewData} />}


        </div>
      </div>
    </div>
  );
};

export default Menu;
