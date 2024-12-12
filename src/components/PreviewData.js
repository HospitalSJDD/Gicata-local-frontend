import React, { useState, useEffect } from 'react';
import '../styles/PreviewData.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import ConfirmModal from './ConfirmModal'; // Importa el ConfirmModal

Modal.setAppElement('#root'); // Para accesibilidad
const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app";
const PreviewData = () => {
  const [programList, setProgramList] = useState([]);
  const [componentList, setComponentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [filteredComponents, setFilteredComponents] = useState([]); // Componentes asociados al programa
  const [componentToEdit, setComponentToEdit] = useState(null); // Componente seleccionado para editar
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false); // Estado del modal de componente
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);


  useEffect(() => {
    fetchPrograms();
    fetchComponents();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/programs`);
      const data = await response.json();
      if (response.ok) setProgramList(data);
      else toast.error(`Error al obtener programas: ${data.error}`);
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmModal = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action); // Guarda la acción que se ejecutará al confirmar
    setIsConfirmModalOpen(true);
  };
  
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const confirmDelete = (ID, type) => {
    const message =
      type === 'Program'
        ? '¿Estás seguro de que deseas eliminar este programa?'
        : '¿Estás seguro de que deseas eliminar este componente?';
  
    openConfirmModal(message, () => handleDelete(ID, type));
  };
  
  

  const fetchComponents = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/components`);
      const data = await response.json();
      if (response.ok) setComponentList(data);
      else toast.error(`Error al obtener componentes: ${data.error}`);
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
      console.error(error);
    }
  };

  const handleView = (item) => {
    setViewItem(item);
    setEditedItem({ ...item });
    // Filtrar componentes asociados al programa
    const associatedComponents = componentList.filter(
      (component) => component.program_id === item.id
    );
    setFilteredComponents(associatedComponents);
    setIsViewModalOpen(true);
  };

  const handleEdit = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en los componentes
  const handleComponentChange = (e) => {
    const { name, value } = e.target;
    setComponentToEdit((prev) => ({ ...prev, [name]: value }));
  };



  // Abrir modal para editar componente
  const handleEditComponent = (component) => {
    setComponentToEdit({ ...component });
    setIsComponentModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Actualizar el programa con sus umbrales de alerta
      if (!componentToEdit){
        const responseProgram = await fetch(
          `${BACKEND_URL}/api/program-update/${editedItem.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedItem),
          }
        );

        if (responseProgram.ok) {
          viewItem.name = editedItem.name;
          toast.success('Programa actualizado con éxito.');
          setProgramList((prev) =>
            prev.map((item) => (item.id === editedItem.id ? editedItem : item))
          );
          viewItem.low_alert_threshold = editedItem.low_alert_threshold;
          viewItem.medium_alert_threshold = editedItem.medium_alert_threshold;
          viewItem.high_alert_threshold = editedItem.high_alert_threshold;
          setIsEditing(false);
          setIsComponentModalOpen(false);
        } else {
          toast.error('Error al actualizar el programa.');
        }
      }
      // Actualizar componentes existentes
      else if (componentToEdit) {
        const response = await fetch(
          `${BACKEND_URL}/api/component-update/${componentToEdit.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(componentToEdit),
          }
        );
        if (!response.ok) {
          toast.error('Error al actualizar componente.');
          return;
        }
        if (response.ok) {
          toast.success('Componente actualizado con éxito.');
          fetchComponents();
          
          setIsEditing(false);
          setIsComponentModalOpen(false);
          
          setFilteredComponents((prev) =>
            prev.map((component) =>
              component.id === componentToEdit.id ? componentToEdit : component
            )
          );
          setComponentToEdit(null);
        }
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
      console.error(error);
    }
  };

  


  const handleDelete = async (ID,type) => {
    console.log(ID,type)
    try {
        
        if (type === 'Program') {
            const response = await fetch(`${BACKEND_URL}/api/program-delete/${ID}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Programa eliminado con éxito.');
                fetchPrograms(); // Actualizar lista de programas
                fetchComponents();
                setProgramList(programList.filter((program) => program.id !== ID));
                
            } else {
                toast.error(`Error: ${result.error}`);
            }
        } else if (type === 'Component') {
            const response = await fetch(`${BACKEND_URL}/api/component-delete/${ID}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (response.ok) {
                toast.success('Componente eliminado con éxito.');
                fetchComponents(); // Actualizar lista de componentes
                setFilteredComponents(filteredComponents.filter((component) => component.id !== ID));
                
                
            } else {
                toast.error(`Error: ${result.error}`);
            }
        }else {
          toast.error('No existe!')
        }
    } catch (error) {
        toast.error('Error en la conexión al eliminar.');
        console.error(error);
    }
    fetchPrograms(); // Actualizar lista de programas
    fetchComponents(); // Actualizar lista de componentes

}


const closeProgram = () => {
  setIsViewModalOpen(false);
  setIsEditing(false);
  setViewItem(null);
  setEditedItem(null);  
  }


  return (
    <div className="preview-data-container">
      <h2 className="preview-data-title"> Programas y Componentes</h2>
      {isLoading ? (
        <p className="preview-data-loading">Cargando datos...</p>
      ) : error ? (
        <p className="preview-data-error">{error}</p>
      ) : (
        <>
          <table className="preview-data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programList.map((program) => (
                <tr key={program.id}>
                  <td>{program.name}</td>
                  <td>
                    <button
                      className="preview-data-view-button"
                      onClick={() => handleView(program)}
                    >
                      Ver
                    </button>
                    <button
                      className="preview-data-delete-button"
                      onClick={() => confirmDelete(program.id, 'Program')}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Modal para el programa */}
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        className="preview-data-modal"
        overlayClassName="preview-data-overlay"
      >
        {viewItem && (
          <>
            <h2 className="preview-data-modal-title">Información del Programa</h2>
            <div className="preview-data-field">
              <label>Nombre:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedItem.name}
                  onChange={handleChange}
                  className="preview-data-input"
                />
              ) : (
                <p className="preview-data-name">{viewItem.name}</p>
              )}
            </div>

            {/* Mostrar umbrales de alerta del programa */}
            <div className="preview-data-alerts-container">
              <div className="preview-data-field">
                <label>Alerta Baja:</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="low_alert_threshold"
                    value={editedItem.low_alert_threshold}
                    onChange={handleChange}
                    className="preview-data-alerts-input"
                  />
                ) : (
                  <p className="preview-data-value">
                    {viewItem.low_alert_threshold}
                  </p>
                )}
              </div>
              <div className="preview-data-field">
                <label>Alerta Media:</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="medium_alert_threshold"
                    value={editedItem.medium_alert_threshold}
                    onChange={handleChange}
                    className="preview-data-alerts-input"
                  />
                ) : (
                  <p className="preview-data-value">
                    {viewItem.medium_alert_threshold}
                  </p>
                )}
              </div>
              <div className="preview-data-field">
                <label>Alerta Alta:</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="high_alert_threshold"
                    value={editedItem.high_alert_threshold}
                    onChange={handleChange}
                    className="preview-data-alerts-input"
                  />
                ) : (
                  <p className="preview-data-value">
                    {viewItem.high_alert_threshold}
                  </p>
                )}
              </div>
             
            </div>
            {/* Mostrar componentes asociados */}
            <h3 className="preview-data-modal-subtitle">Componentes Asociados</h3>
            <table className="preview-data-modal-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((component) => (
                  <tr key={component.id}>
                    <td>{component.name}</td>
                    <td>
                      <button
                        className="preview-data-edit-button"
                        onClick={() => handleEditComponent(component)}
                      >
                        Editar
                      </button>
                      <button
                        className="preview-data-delete-button"
                        onClick={() => handleDelete(component.id, "Component") }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="preview-data-modal-buttons">
              {isEditing ? (
                <button
                  className="preview-data-save-button"
                  onClick={handleSaveEdit}
                >
                  Guardar
                </button>
              ) : (
                <button
                  className="preview-data-edit-button"
                  onClick={handleEdit}
                >
                  Editar
                </button>
              )}
              <button
                className="preview-data-close-button"
                onClick={closeProgram}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Modal para editar componente */}
      <Modal
  isOpen={isComponentModalOpen}
  onRequestClose={() => setIsComponentModalOpen(false)}
  className="preview-data-modal"
  overlayClassName="preview-data-overlay"
>
  {componentToEdit && (
    <>
      <h2 className="preview-data-modal-title">Editar Componente</h2>
      <div className="preview-data-field">
        <label>Nombre:</label>
        <input
          type="text"
          name="name"
          value={componentToEdit.name}
          onChange={handleComponentChange}
          className="preview-data-input"
        />
      </div>
      <div className="preview-data-alert">
          <label>Peso Relativo:</label>
          <input
            type="number"
            name="relative_weight"
            value={componentToEdit.relative_weight}
            onChange={handleComponentChange}
            className="preview-data-input"
          />
      </div>
      { !componentToEdit.wholeYear ? (
      <div className="preview-data-field">
        <label>Rango de meses:</label>     
        <p className="preview-data-input">
          {componentToEdit.monthRange}
        </p>
    
      </div>
      ) : (<> </>)}


      {/* Agrupar los campos de alerta */}
      <h3 className="preview-data-modal-subtitle">Umbrales de Alerta</h3>
      <div className="preview-data-alerts-container">
        
        <div className="preview-data-alert">
          <label>Alerta Baja:</label>
          <input
            type="number"
            name="low_alert_threshold"
            value={componentToEdit.low_alert_threshold}
            onChange={handleComponentChange}
            className="preview-data-alerts-input"
          />
        </div>
        <div className="preview-data-alert">
          <label>Alerta Media:</label>
          <input
            type="number"
            name="medium_alert_threshold"
            value={componentToEdit.medium_alert_threshold}
            onChange={handleComponentChange}
            className="preview-data-alerts-input"
          />
        </div>
        <div className="preview-data-alert">
          <label>Alerta Alta:</label>
          <input
            type="number"
            name="high_alert_threshold"
            value={componentToEdit.high_alert_threshold}
            onChange={handleComponentChange}
            className="preview-data-alerts-input"
          />
        </div>
      </div>

      <div className="preview-data-modal-buttons">
        <button
          className="preview-data-save-button"
          onClick={handleSaveEdit}
        >
          Guardar
        </button>
        <button
          className="preview-data-close-button"
          onClick={() => setIsComponentModalOpen(false)}
        >
          Cancelar
        </button>
      </div>
    </>
  )}
</Modal>
    <ConfirmModal
          isOpen={isConfirmModalOpen}
          onRequestClose={closeConfirmModal}
          onConfirm={() => {
            if (confirmAction) confirmAction();
            closeConfirmModal();
          }}
          message={confirmMessage}
        />
      <ToastContainer />
    </div>
  );
};

export default PreviewData;
