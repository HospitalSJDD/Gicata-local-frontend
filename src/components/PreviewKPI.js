// PreviewKPI.jsx
import React, { useState, useEffect } from 'react';
import '../styles/PreviewKPI.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faInfoCircle, faCalculator, faBook, faSave, faChartLine } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from './ConfirmModal'; // Importar el nuevo componente

Modal.setAppElement('#root'); // Para accesibilidad

const PreviewKPI = () => {
  const [kpiList, setKpiList] = useState([]);
  const [filteredKpiList, setFilteredKpiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedKpi, setEditedKpi] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryKPI, setSelectedCategoryKPI] = useState(null);
  const [selectedComponentKPI, setSelectedComponentKPI] = useState(null);
  const [ifFixedDenominator, setIfFixedDenominator] = useState(false);
  const [ifFixedNumerator, setIfFixedNumerator] = useState(false);

  const [viewKpi, setViewKpi] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const [listComponents, setListComponents] = useState([]);
  const [listPrograms, setListPrograms] = useState([]);
  const [program, setProgram] = useState('');
  const [programID, setProgramID] = useState('');

  const [totalKpis, setTotalKpis] = useState(0);

  
  const renderField = (field) => {
    if (typeof field === 'object' && field !== null) {
      return JSON.stringify(field);
    }
    return field || 0 ||  'N/A';
  };

  
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        console.log('Intentando obtener KPIs desde el backend...');
        const response = await fetch('http://localhost:5000/api/kpi'); // Ruta actualizada
        const data = await response.json();
        console.log('Respuesta del backend:', data);
        if (response.ok) {
          setKpiList(data); // Asumiendo que el backend devuelve una lista
          setFilteredKpiList(data);
          setTotalKpis(data.length); // Actualiza el total de KPIs
        } else {
          setError(data.error || 'Error al obtener los KPIs.');
        }
      } catch (err) {
        setError('Error en la conexión con el servidor.');
        console.error('Error al fetch KPIs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPIs();
    fetchPrograms();
    fetchComponents();
  }, []);

  const openConfirmModal = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleConfirm = () => {
    console.log('Confirmación recibida, ejecutando acción.');
    if (confirmAction) confirmAction();
    closeConfirmModal();
  };

  const fetchPrograms = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/programs');
        const data = await response.json();
        if (response.ok) {
            setListPrograms(data);
        } else {
            toast.error(`Error al obtener programas: ${data.error}`);
        }
    } catch (error) {
        toast.error('Error al conectar con el servidor.');
        console.error(error);
    }
};

const fetchComponents = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/components');
        const data = await response.json();
        if (response.ok) {
            
            setListComponents(data);
        }
    } catch (error) {
        toast.error('Error al conectar con el servidor.');
        console.error(error);
    }
};

  const handleEdit = () => {
    setIsEditing(!isEditing);
    setEditedKpi({ ...viewKpi });
  };

  const alertDelete = (kpi) => {
    openConfirmModal(`¿Estás seguro de que deseas eliminar el KPI "${kpi.name}"?`, () => handleDelete(kpi.id));
  };

  const alertSave = () => {
    openConfirmModal('¿Estás seguro de que deseas editar este KPI?', () => handleSaveEdit());
  };

  const handleDelete = async (kpiId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/kpi/delete/${kpiId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log('Respuesta al eliminar KPI:', data);
      if (response.ok) {
        // Actualizar la lista de KPIs
        const updatedKpiList = kpiList.filter((kpi) => kpi.id !== kpiId);
        setKpiList(updatedKpiList);
        setFilteredKpiList(updatedKpiList);
        setEditedKpi(null);
        setTotalKpis(totalKpis-1);
        toast.success('KPI eliminado con éxito.');
      } else {
        toast.error(`Error al eliminar el KPI: ${data.error}`);
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor.');
      console.error('Error al eliminar KPI:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedKpi) {
      toast.error('No hay datos para actualizar.');
      return;
    }

    // Validación básica
    if (!editedKpi.name || editedKpi.name.trim() === '') {
      toast.error('El nombre del KPI no puede estar vacío.');
      return;
    }

    if (isNaN(editedKpi.goal) || editedKpi.goal < 0) {
      toast.error('La meta debe ser un número positivo.');
      return;
    }

    try {
      console.log('Intentando editar KPI:', editedKpi);

      if (!editedKpi.id) {
        toast.error('El ID del KPI no está definido.');
        return;
      }

      // Crear un payload solo con los campos editables
      const payload = {
        name: editedKpi.name,
        goal: Number(editedKpi.goal), // Convertir 'goal' a número
        numerator_selection: Number(editedKpi.numerator_selection), // Convertir 'numerator_selection' a número
        denominator_selection: Number(editedKpi.denominator_selection), // Convertir 'denominator_selection' a número
        relative_goal: Number(editedKpi.relative_goal) // Convertir 'relative_goal' a número
      };

      console.log('Datos que se enviarán al backend:', JSON.stringify(payload));

      const response = await fetch(`http://localhost:5000/api/kpi/update/${editedKpi.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Respuesta del backend:', data);

      if (response.ok) {
        // Actualizar la lista de KPIs
        const updatedKpiList = kpiList.map((kpi) => (kpi.id === editedKpi.id ? { ...kpi, ...payload } : kpi));
        setKpiList(updatedKpiList);
        setFilteredKpiList(updatedKpiList);
        // Actualizar el KPI visualizado
        setViewKpi({ ...viewKpi, ...payload });
        // Resetear el estado de edición
        setIsEditing(false);
        // Cerrar el modal
        setIsViewModalOpen(false);
        toast.success('KPI actualizado con éxito.');
      } else {
        if (data.error) {
          toast.error(`Error al actualizar el KPI: ${data.error}`);
        } else {
          toast.error('Ocurrió un error desconocido al actualizar el KPI.');
        }
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor.');
      console.error('Error al editar KPI:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'goal' ? Number(value) : value; // Convertir 'goal' a número
    setEditedKpi((prevKpi) => ({
      ...prevKpi,
      [name]: newValue
    }));
  };

  const handleView = (kpi) => {
    setViewKpi(kpi);
    if (kpi.denominator_book === null) {
      setIfFixedDenominator(true);
    }
    else {
      setIfFixedDenominator(false);
    }
    if (kpi.numerator_book === null) {
      setIfFixedNumerator(true);
    }
    else {
      setIfFixedNumerator(false);
    }
    setIsViewModalOpen(true);
    console.log(kpi.is_additive)
  };

  

  

  const handleClose = () => {
    setIsViewModalOpen(false);
    setIsEditing(false);
    setViewKpi(null);
  };

  const handleCategoryChange = (e) => {
    const selectedProgramName = e.target.value;
    setProgram(selectedProgramName);
    setSelectedCategoryKPI(selectedProgramName);
    applyFilters(e.target.value, selectedComponentKPI);
    const selectedProgram = listPrograms.find((program) => program.name === selectedProgramName);
      if (selectedProgram) {
          setProgramID(selectedProgram.id);
      } else {
          setProgramID('');
      }
  };

  const handleComponentChange = (e) => {
    setSelectedComponentKPI(e.target.value);
    applyFilters(selectedCategoryKPI, e.target.value);
  };



  const applyFilters = (category, component) => {
    const filtered = kpiList.filter((kpi) => {
      const matchesCategory = category ? kpi.category === category : true;
      const matchesComponent = component ? kpi.component === component : true;
      return matchesCategory && matchesComponent;
    });
    setFilteredKpiList(filtered);
  };

  // Manejar el bloqueo del scroll cuando el modal está abierto
  useEffect(() => {
    if (isViewModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isViewModalOpen]);

  return (
    <div className="preview-kpi-container">

        <div className="card-container-preview-kpi">
          <div className="stat-card-preview-kpi">
          
            <div className="stat-info-preview-kpi">
           
              <h3> <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '10px' }} />Total de Indicadores </h3>
              <p>{totalKpis}</p>
            </div>
          </div>
        </div>

      <h2 className="preview-kpi-title">Vista Previa de KPIs</h2>

      <div className="filter-container">
        <div className="form-group">
          <label>Seleccionar Programa:</label>
          <select value={selectedCategoryKPI} onChange={handleCategoryChange} className="form-select">
            <option value="">--- Selecciona una Programa ---</option>
            {listPrograms.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Seleccionar Componente:</label>
          <select value={selectedComponentKPI} onChange={handleComponentChange} className="form-select">
            <option value="">--- Selecciona un Componente ---</option>
            {(listComponents
              .filter((component) => component.program_id === programID))
              .map((component) => (
                <option key={component.id} value={component.name}>
                  {component.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="loading-text">Cargando KPIs...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <table className="kpi-table">
          <thead>
            <tr>
              <th>Nombre del Indicador</th>
              <th>Meta</th>
              <th>Programa</th>
              <th>Componente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredKpiList.map((kpi) => (
              <tr key={kpi.id}>
                <td data-label="Nombre del Indicador">{renderField(kpi.name)}</td>
                <td data-label="Meta">{renderField(kpi.goal)}%</td>
                <td data-label="Programa">{renderField(kpi.category)}</td>
                <td data-label="Componente">{renderField(kpi.component)}</td>
                <td data-label="Acciones">
                  <button
                    className="view-button-preview"
                    onClick={() => handleView(kpi)}
                  >
                    Ver Información
                  </button>
                  <button
                    className="delete-button-preview"
                    onClick={() => alertDelete(kpi)
                      
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para Ver Información del KPI */}
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        contentLabel="Información del KPI"
        className="modal-overlay-preview-kpi"
 
        
      >
        {viewKpi && (
          <div className="modal-content-preview-kpi">
            <h2>Información del KPI</h2>
            <div className="kpi-info">
              <div className="kpi-section">
                <h3>
                  <FontAwesomeIcon icon={faInfoCircle} /> Detalles Generales
                </h3>
                <div className="field-group-preview">
                  <p className="field-title-preview">Nombre del Indicador</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedKpi?.name || ''}
                      onChange={handleChange}
                      className="field-value-preview"
                    />
                  ) : (
                    <p className="field-value-preview">{viewKpi.name}</p>
                  )}
                </div>
                <div className="field-group-preview">
                  <p className="field-title-preview">Meta</p>
                  {isEditing ? (
                    <input
                      type="number"
                      name="goal"
                      value={editedKpi?.goal || ''}
                      onChange={handleChange}
                      className="field-value-preview"
                      min="0"
                    />
                  ) : (
                    <p className="field-value">{viewKpi.goal}%</p>
                  )}
                </div>
                <div className="field-group-preview">
                  <p className="field-title-preview">Programa</p>
                  <p className="field-value">{renderField(viewKpi.category)}</p>
                </div>
                <div className="field-group-preview">
                  <p className="field-title-preview">Componente</p>
                  <p className="field-value">{renderField(viewKpi.component)}</p>
                </div>
                <div className="field-group-preview">
                  <p className="field-title-preview">Importancia Relativa</p>
                  {isEditing ? (
                    <input
                      type="number"
                      name="relative_goal"
                      value={editedKpi?.relative_goal || ''}
                      onChange={handleChange}
                      className="field-value-preview"
                      min="0"
                    />
                  ) : (
                    <p className="field-value-preview">{viewKpi.relative_goal}%</p>
                  )}
                </div>
                
              </div>
              {ifFixedNumerator ? (
                <div className="kpi-section">
                  <h3>
                    <FontAwesomeIcon icon={faBook} /> Numerador
                  </h3>
                  <div className="field-group-preview">
                    <p className="field-title-preview">Valor Fijo</p>
                    {isEditing ? (
                    <input
                      type="number"
                      name="numerator_selection"
                      value={editedKpi?.numerator_selection || ''}
                      onChange={handleChange}
                      className="field-value-preview"
                    />
                  ) : (
                    <p className="field-value-preview">{viewKpi.numerator_selection}</p>
                  )}
                  </div>
                </div>
              ) : (
              <div className="kpi-section">
                <h3>
                  <FontAwesomeIcon icon={faCalculator} /> Numerador
                </h3>
                <div className="field-group-preview">
                  <p className="field-title-preview">Libro</p>
                  <p className="field-value-preview">{renderField(viewKpi.numerator_book)}</p>
                </div>
                <div className="field-group-preview">
                  <p className="field-title-preview">Hoja</p>
                  <p className="field-value-preview">{renderField(viewKpi.numerator_sheet)}</p>
                </div>
                <div className="field-group-preview">
                  <p className="field-title-preview">Sección</p>
                  <p className="field-value-preview">{renderField(viewKpi.numerator_section)}</p>
                </div>

              </div>
               )}




              {ifFixedDenominator ? (
                <div className="kpi-section">
                  <h3>
                    <FontAwesomeIcon icon={faBook} /> Denominador
                  </h3>
                  <div className="field-group-preview">
                    <p className="field-title-preview">Valor Fijo</p>
                    {isEditing ? (
                    <input
                      type="number"
                      name="denominator_selection"
                      value={editedKpi?.denominator_selection || ''}
                      onChange={handleChange}
                      className="field-value-preview"
                    />
                  ) : (
                    <p className="field-value-preview">{viewKpi.denominator_selection}</p>
                  )}
                  </div>
                </div>
              ) : (
                <div className="kpi-section">
                  <h3>
                    <FontAwesomeIcon icon={faBook} /> Denominador
                  </h3>
                  <div className="field-group-preview">
                    <p className="field-title-preview">Libro</p>
                    <p className="field-value-preview">{renderField(viewKpi.denominator_book)}</p>
                  </div>
                  <div className="field-group-preview">
                    <p className="field-title-preview">Hoja</p>
                    <p className="field-value-preview">{renderField(viewKpi.denominator_sheet)}</p>
                  </div>
                  <div className="field-group-preview">
                    <p className="field-title-preview">Sección</p>
                    <p className="field-value-preview">{renderField(viewKpi.denominator_section)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-buttons-preview">
              {isEditing ? (
                <button className="save-button-preview" onClick={alertSave}>
                  <FontAwesomeIcon icon={faSave} Guardar/> Guardar
                </button>
              ) : (
                <button className="edit-button-preview" onClick={handleEdit}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
              )}
              <button
                type="button"
                className="close-button-preview-kpi"
                onClick={() => handleClose()}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onRequestClose={closeConfirmModal}
        onConfirm={handleConfirm}
        message={confirmMessage}
      />

      <ToastContainer />
    </div>
  );
};

export default PreviewKPI;
