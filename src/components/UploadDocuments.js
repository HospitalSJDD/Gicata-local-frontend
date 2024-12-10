// UploadDocuments.js

import React, { useState, useEffect,useRef } from 'react';
import '../styles/UploadDocuments.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from './ConfirmModal'; // Importar el componente ConfirmModal

const UploadDocuments = ({ onSuccess }) => {
  // Estados existentes
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(''); // Estado para el año
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados adicionales para el modal y confirmación
  const [showModal, setShowModal] = useState(false);
  const [monthModal, setMonthModal] = useState('');
  const [yearModal, setYearModal] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Estados para meses y años disponibles en el modal de eliminación
  const [listMonths, setListMonths] = useState([]);
  const [listYears, setListYears] = useState([]);
  const [monthsByYear, setMonthsByYear] = useState({});
  const [filteredMonthsModal, setFilteredMonthsModal] = useState([]); // Meses filtrados según el año seleccionado

  // Opciones para categorías
  const categoryOptions = [
    { value: 'REM A', label: 'REM A' },
    { value: 'REM P', label: 'REM P' },
    { value: 'ETC', label: 'ETC' },
    // Puedes agregar más categorías si es necesario
  ];

  // Opciones para los meses
  const monthOptions = [
    { value: 'Enero', label: 'Enero' },
    { value: 'Febrero', label: 'Febrero' },
    { value: 'Marzo', label: 'Marzo' },
    { value: 'Abril', label: 'Abril' },
    { value: 'Mayo', label: 'Mayo' },
    { value: 'Junio', label: 'Junio' },
    { value: 'Julio', label: 'Julio' },
    { value: 'Agosto', label: 'Agosto' },
    { value: 'Septiembre', label: 'Septiembre' },
    { value: 'Octubre', label: 'Octubre' },
    { value: 'Noviembre', label: 'Noviembre' },
    { value: 'Diciembre', label: 'Diciembre' },
  ];

  const monthToNumber = {
    "Enero": 1,
    "Febrero": 2,
    "Marzo": 3,
    "Abril": 4,
    "Mayo": 5,
    "Junio": 6,
    "Julio": 7,
    "Agosto": 8,
    "Septiembre": 9,
    "Octubre": 10,
    "Noviembre": 11,
    "Diciembre": 12
  };

  // Generar dinámicamente los años desde un año inicial hasta el año actual + 5
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2; 
    const endYear = currentYear + 1; 
    const years = [];

    for (let year = startYear; year <= endYear; year++) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showModal]);

  // Definir función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const fetchHistoricalDates = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/dates");
      const data = await response.json();
      if (response.ok) {
        // Suponiendo que `data` es una lista de objetos con `month` y `year`
        const months = data.map((m) => capitalizeFirstLetter(m.month));
        const uniqueMonths = [...new Set(months)].sort((a, b) => monthToNumber[a] - monthToNumber[b]);
        setListMonths(uniqueMonths);

        const years = data.map((y) => y.year);
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
        setListYears(uniqueYears);

        // Crear mapping de años a meses
        const mapping = {};
        data.forEach(({ month, year }) => {
          const capMonth = capitalizeFirstLetter(month);
          if (!mapping[year]) {
            mapping[year] = new Set();
          }
          mapping[year].add(capMonth);
        });

        // Convertir sets a arrays y ordenar
        const sortedMapping = {};
        Object.keys(mapping).forEach(year => {
          sortedMapping[year] = Array.from(mapping[year]).sort((a, b) => monthToNumber[a] - monthToNumber[b]);
        });

        setMonthsByYear(sortedMapping);

        // Opcional: Puedes verificar las fechas cargadas
        console.log("Meses únicos:", uniqueMonths);
        console.log("Años únicos:", uniqueYears);
        console.log("Mapping de meses por año:", sortedMapping);
      } else {
        toast.error(data.error || "Error al obtener fechas históricas.");
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHistoricalDates(); // Llamar a la función para obtener fechas al montar el componente
  }, []);

  // useEffect para actualizar los meses filtrados en el modal cuando cambia el año seleccionado
  useEffect(() => {
    if (yearModal) {
      setFilteredMonthsModal(monthsByYear[yearModal] || []);
      // Si el mes seleccionado no está en los meses disponibles, resetearlo
      if (!monthsByYear[yearModal]?.includes(monthModal)) {
        setMonthModal('');
      }
    } else {
      setFilteredMonthsModal([]);
    }
  }, [yearModal, monthsByYear, monthModal]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
      ];
      if (!allowedExtensions.includes(file.type)) {
        setMessage(
          'Por favor, selecciona un archivo Excel (.xls, .xlsx, .xlsm).'
        );
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setMessage('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !category || !month || !year) {
      setMessage('Por favor, completa todos los campos antes de enviar.');
      return;
    }
    setIsLoading(true);
  
    // Preparar el FormData para la primera solicitud
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', category);
    formData.append('month', month);
    formData.append('year', year);
  
    try {
      // Primera solicitud: Subir archivo
      const fileUploadResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (fileUploadResponse.ok) {
        setMessage('Archivo subido con éxito.');
        toast.success('Archivo subido con éxito.');

        try {
          // Segunda solicitud: Actualizar fecha
          const dateUpdateResponse = await fetch('http://localhost:5000/api/date-add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', // Asegura que el backend interprete el JSON correctamente
            },
            body: JSON.stringify({
              year: year,
              month: month,
            }),
          });
      
          if (dateUpdateResponse.ok) {
            setMonth('');
            setCategory('');
            setYear('');
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } 
        } catch (error) {
          
          setMessage('Error al actualizar la fecha: ' + error.message);
          toast.error('Error al actualizar la fecha.');
        }
      } else {
        const result = await fileUploadResponse.json();
        setMessage('Error al subir el archivo.');
        toast.error(`Error: ${result.message}`);
       
        setIsLoading(false);
        return; // Detener si falla la primera solicitud
      }
    } catch (error) {
      console.error('Error en la subida del archivo:', error);
      setMessage('Error: ' + error.message);
      toast.error('Error al subir el archivo.', error.message);
      setIsLoading(false);
      return; // Detener si ocurre un error
    }
  
    setIsLoading(false);
  };

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
    if (confirmAction) confirmAction();
    closeConfirmModal();
  };

  const alertDelete = () => {
    if (!monthModal || !yearModal) {
      setMessage('Por favor, selecciona mes y año para eliminar.');
      return;
    }
    openConfirmModal(`¿Estás seguro de que deseas eliminar los datos del mes ${monthModal} y año ${yearModal}?`, () => handleDelete());
  };

  const handleDelete = async () => {
    if (!monthModal || !yearModal) {
      setMessage('Por favor, selecciona mes y año para eliminar.');
      return;
    }
    setIsLoading(true); 
    const calculation_date = `${monthModal} ${yearModal}`;
    try {
      const response = await fetch(`http://localhost:5000/whipe_database/${encodeURIComponent(calculation_date)}`,  // Decodifica la URL.  
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        toast.success('Datos eliminados con éxito.');

        try {
          const dateDeleteResponse = await fetch('http://localhost:5000/api/date-delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              year: yearModal,
              month: monthModal,
            }),
          });
          if (dateDeleteResponse.ok) {
            console.log('Fecha eliminada con éxito.');
            // Actualizar localmente listMonths y listYears si es necesario
            // Por ejemplo, eliminar el mes y año de listMonths y listYears si ya no existen
            // Esto depende de cómo manejes el estado después de eliminar
          } else {
            console.log('Error al eliminar la fecha.');
          }
        } catch (error) {
          console.error('Error al eliminar la fecha:', error);
          setMessage('Error al eliminar la fecha: ' + error.message);
          toast.error('Error al eliminar la fecha.');
        }

      } else {
        toast.error('Error al eliminar los datos.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: ' + error.message);
      toast.error('Error al eliminar los datos.');
    } 
    
    setIsLoading(false);
    setShowModal(false);
    setMonthModal('');
    setYearModal('');
  };

  const handleCancel = () => {
    setShowModal(false);
    setMonthModal('');
    setYearModal('');
  };

  return (
    <div className="form-container">
      <div className='upload-data-header'>
        <button className="form-button-delete-data" onClick={() => setShowModal(true)}>Eliminar</button>
      </div>

      {showModal && (
        <div className="modal-overlay-upload-data">
          <div className="modal-content-upload-data">
            <h3>Seleccionar mes y año para eliminar</h3>

            {/* Selección de año */}
            <div className="form-group-upload">
              <label>Año:</label>
              <select
                value={yearModal}
                onChange={(e) => setYearModal(e.target.value)}
                className="form-select-upload"
                required
              >
                <option value="">--- Selecciona un año ---</option>
                {listYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de mes con meses filtrados por año */}
            <div className="form-group-upload">
              <label>Mes:</label>
              <select
                value={monthModal}
                onChange={(e) => setMonthModal(e.target.value)}
                className="form-select-upload"
                required
              >
                <option value="">--- Selecciona un mes ---</option>
                {filteredMonthsModal.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Acciones del modal */}
            <div className="modal-content-upload-data-actions">
              <button onClick={alertDelete} className="form-button-delete-data">
                Eliminar
              </button>
              <button onClick={handleCancel} className="form-button-cancel-upload-data">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="form-title">Subir Documentos</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        {/* Selección de categoría */}
        <div className="form-group">
          <label>Categoría:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
            required
          >
            <option value="">--- Selecciona una categoría ---</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de mes */}
        <div className="form-group">
          <label>Mes del Archivo:</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="form-select"
            required
          >
            <option value="">--- Selecciona un mes ---</option>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de año */}
        <div className="form-group">
          <label>Año del Archivo:</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="form-select"
            required
          >
            <option value="">--- Selecciona un año ---</option>
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campo para seleccionar archivo */}
        <div className="form-group">
          <label>Seleccionar Archivo:</label>
          <input
            type="file"
            accept=".xls, .xlsx, .xlsm" // Solo acepta archivos Excel
            onChange={handleFileChange}
            className="form-input"
            ref={fileInputRef} // Vincular la referencia aquí

            required
          />
        </div>

        {/* Botón de subir */}
        <button type="submit" className="form-button-upload-document">
          Subir
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}

      {/* Modal de carga */}
      {isLoading && (
        <div className="loading-modal">
          <div className="loading-content">
            <div className="loader"></div>
            <p>Cargando...</p>
          </div>
        </div>
      )}
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

export default UploadDocuments;
