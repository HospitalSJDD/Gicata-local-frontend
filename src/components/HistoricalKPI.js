// PreviewHistorical.jsx
import React, { useState, useEffect } from "react";
import "../styles/HistoricalKPI.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "./ConfirmModal"; // Importar el nuevo componente si es necesario

Modal.setAppElement("#root"); // Para accesibilidad

const HistoricalKPI = () => {
  // Estados principales
  const [historicalList, setHistoricalList] = useState([]);
  const [filteredHistoricalList, setFilteredHistoricalList] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCategoryHistorical, setSelectedCategoryHistorical] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComponentHistorical, setSelectedComponentHistorical] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [calculateMonth, setCalculateMonth] = useState(null);
  const [calculateYear, setCalculateYear] = useState(null);
  const [listComponents, setListComponents] = useState([]);
  const [listPrograms, setListPrograms] = useState([]);
  const [program, setProgram] = useState("");
  const [programID, setProgramID] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Nuevas variables de estado para fechas históricas
  const [listMonths, setListMonths] = useState([]);
  const [listYears, setListYears] = useState([]);
  const [monthsByYear, setMonthsByYear] = useState({});

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
  const typeOptions = [
    "REM A",
    "REM P"
   ] 

  const monthOptions = [
    { value: "Enero", label: "Enero" },
    { value: "Febrero", label: "Febrero" },
    { value: "Marzo", label: "Marzo" },
    { value: "Abril", label: "Abril" },
    { value: "Mayo", label: "Mayo" },
    { value: "Junio", label: "Junio" },
    { value: "Julio", label: "Julio" },
    { value: "Agosto", label: "Agosto" },
    { value: "Septiembre", label: "Septiembre" },
    { value: "Octubre", label: "Octubre" },
    { value: "Noviembre", label: "Noviembre" },
    { value: "Diciembre", label: "Diciembre" },
  ];

  const yearsOption = [
    "2023",
    "2024",
    "2025",
    "2026",
    "2027",
    "2028",
    "2029",
    "2030",
  ];

  const [isHistoricalModalOpen, setIsHistoricalModalOpen] = useState(false);

  const openHistoricalModal = () => {
    setIsHistoricalModalOpen(true);
  };

  const closeHistoricalModal = () => {
    setIsHistoricalModalOpen(false);
  };

  const openConfirmModal = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
    setConfirmMessage("");
  };

  const handleConfirm = () => {
    console.log("Confirmación recibida, ejecutando acción.");
    if (confirmAction) confirmAction();
    closeConfirmModal();
  };

  const alertDelete = () => {
    openConfirmModal(
      `¿Estás seguro de que deseas eliminar los resultados de "${calculateMonth} ${calculateYear}"?`,
      () => borrarHistorical()
    );
  };

  const alertConfirmCalculateHistorical = () => {
    openConfirmModal(
      `¿Está seguro de realizar los cálculos de "${calculateMonth} ${calculateYear}"?`,
      () => calculateHistorical()
    );
  };

  const applyFilters = (category, component, month, year) => {
    const filtered = historicalList.filter((historical) => {
      const matchesCategory = category
        ? historical.category === category
        : true;
      const matchesComponent = component
        ? historical.component === component
        : true;
      const matchesMonth = month
        ? historical.calculation_date.split(" ")[0] === month
        : true;
      const matchesYear = year
        ? historical.calculation_date.split(" ")[1] === year
        : true;
      return matchesCategory && matchesComponent && matchesMonth && matchesYear;
    });
    setFilteredHistoricalList(filtered);
  };

  const renderField = (field) => {
    if (typeof field === "object" && field !== null) {
      return JSON.stringify(field);
    }
    return field != null ? field : "N/A";
  };

  useEffect(() => {
    fetchHistoricals();
    fetchPrograms();
    fetchComponents();
    fetchHistoricalDates(); // Añadido para obtener las fechas históricas
  }, []);

  const clearData = () => {
    setMonth("");
    setYear("");
    setCalculateMonth("");
    setCalculateYear("");
    setSelectedCategoryHistorical("");
    setSelectedComponentHistorical("");
  };

  const fetchHistoricals = async () => {
    try {
      console.log("Intentando conseguir los Historical...");
      const response = await fetch("http://localhost:5000/api/results"); // Ruta actualizada
      const data = await response.json();
      console.log("Respuesta del backend:", data);
      if (response.ok) {
        setHistoricalList(data); // Asumiendo que el backend devuelve una lista
        setFilteredHistoricalList(data);
      } else {
        setError(data.error || "Error al obtener los Historicals.");
      }
    } catch (err) {
      setError("Error en la conexión con el servidor.");
      console.error("Error al fetch Historicals:", err);
    } finally {
      setIsLoading(false);
    }
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

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const calculateHistorical = async () => {
    if (!calculateMonth || !calculateYear) {
      toast.error("Por favor, selecciona el mes y el año.");
      return;
    }

    const calculation_date = `${calculateMonth} ${calculateYear}-${type}`;
    try {
      const response = await fetch(
        `http://localhost:5000/calculate/${encodeURIComponent(
          calculation_date
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("Respuesta del backend:", data);
      if (response.ok) {
        console.log(response);
        toast.success('Calculos realizados con exito');
        fetchHistoricals(); // Actualizar la lista después de calcular
        setFilteredHistoricalList(historicalList);
        closeHistoricalModal();
        clearData();
      } else {
        console.log(response);
        toast.error(data.error || data.message);
      }
    } catch (err) {
      toast.error("Error en la conexión con el servidor.");
      console.error("Error al calcular Historicals:", err);
    }
  };

  const borrarHistorical = async () => {
    if (!calculateMonth || !calculateYear) {
      toast.error("Por favor, selecciona el mes y el año.");
      return;
    }
    const calculation_date = `${calculateMonth} ${calculateYear}`;
    console.log(calculation_date);
    console.log(`http://localhost:5000/whipe_results/${calculation_date}`);
    try {
      const response = await fetch(
        `http://localhost:5000/whipe_results/${calculation_date}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("Respuesta del backend:", data);
      if (response.ok) {
        toast.success(data.message);

        fetchHistoricals(); // Actualizar la lista después de borrar
        setFilteredHistoricalList(historicalList);
        clearData();

        closeHistoricalModal();
      } else {
        toast.error(data.error || data.message);
      }
    } catch (err) {
      toast.error("Error en la conexión con el servidor.");
      console.error("Error al borrar Historicals:", err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/programs");
      const data = await response.json();
      if (response.ok) {
        setListPrograms(data);
      } else {
        toast.error(`Error al obtener programas: ${data.error}`);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/components");
      const data = await response.json();
      if (response.ok) {
        setListComponents(data);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedProgramName = e.target.value;
    setProgram(selectedProgramName);
    setSelectedCategoryHistorical(selectedProgramName);
    applyFilters(e.target.value, selectedComponentHistorical, month, year);
    const selectedProgram = listPrograms.find(
      (program) => program.name === selectedProgramName
    );
    if (selectedProgram) {
      setProgramID(selectedProgram.id);
    } else {
      setProgramID("");
    }
  };

  const handleComponentChange = (e) => {
    setSelectedComponentHistorical(e.target.value);
    applyFilters(selectedCategoryHistorical, e.target.value, month, year);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    applyFilters(
      selectedCategoryHistorical,
      selectedComponentHistorical,
      e.target.value,
      year
    );
  };

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setYear(selectedYear);
    // Limpiar el mes si el año cambia
    setMonth("");
    applyFilters(
      selectedCategoryHistorical,
      selectedComponentHistorical,
      "", // Mes limpio
      selectedYear
    );
  };

  return (
    <div className="preview-historical-container">
      <button className="calculate-kpis" onClick={openHistoricalModal}>
        Realizar Cálculos
      </button>
      <h2 className="preview-historical-title">Calculos Historicos</h2>

      <div className="filter-container">
        <div className="form-group">
          <label>Seleccionar Programa:</label>
          <select
            value={selectedCategoryHistorical}
            onChange={handleCategoryChange}
            className="form-select"
          >
            <option value="">--- Selecciona un Programa ---</option>
            {listPrograms.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Seleccionar Componente:</label>
          <select
            value={selectedComponentHistorical}
            onChange={handleComponentChange}
            className="form-select"
          >
            <option value="">--- Selecciona un Componente ---</option>
            {listComponents
              .filter((component) => component.program_id === programID)
              .map((component) => (
                <option key={component.id} value={component.name}>
                  {component.name}
                </option>
              ))}
          </select>
        </div>
        <div className="form-group">
          <label>Mes del cálculo:</label>
          <select
            value={month}
            onChange={handleMonthChange}
            className="form-select"
            required
            disabled={!year} // Deshabilitar si no hay año seleccionado
          >
            <option value="">--- Selecciona un mes ---</option>
            {(monthsByYear[year] || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Seleccionar Año:</label>
          <select
            value={year}
            onChange={handleYearChange}
            className="form-select"
          >
            <option value="">--- Selecciona un Año ---</option>
            {listYears.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="loading-text">Cargando Historicals...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <table className="historical-table">
          <thead>
            <tr>
              <th>Nombre del Indicador</th>
              <th>Meta</th>
              <th>Conseguido</th>
              <th>Programa</th>
              <th>Componente</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistoricalList.map((historical) => (
              <tr key={historical.id}>
                <td data-label="Nombre del Indicador">
                  {renderField(historical.name)}
                </td>
                <td data-label="Meta">{renderField(historical.goal)}%</td>

                <td data-label="Conseguido">
                  {renderField(historical.achieved_result)}%
                </td>
                <td data-label="Programa">
                  {renderField(historical.category)}
                </td>
                <td data-label="Componente">
                  {renderField(historical.component)}
                </td>
                <td data-label="Fecha">
                  {renderField(historical.calculation_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para Ingresar Mes y Año */}
      <Modal
        isOpen={isHistoricalModalOpen}
        onRequestClose={closeHistoricalModal}
        contentLabel="Historical Modal"
        className="historical-overlay-modal"
      >
        <form
          className="preview-historical-modal"
          onSubmit={(e) => {
            e.preventDefault();
            calculateHistorical();
          }}
        >
          <h2>Realizar Cálculos</h2>
          
          <div className="form-group">
            <label>Seleccionar Tipo:</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
              }}
              className="form-select"
              required
            >
              <option value="">--- Selecciona un Tipo ---</option>
              {typeOptions.map((typeOption) => (
                <option key={typeOption} value={typeOption}>
                  {typeOption}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Seleccionar Año:</label>
            <select
              value={calculateYear}
              onChange={(e) => {
                setCalculateYear(e.target.value);
                setCalculateMonth(""); // Resetear mes cuando cambia el año
              }}
              className="form-select"
              required
            >
              <option value="">--- Selecciona un Año ---</option>
              {listYears.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Seleccionar Mes:</label>
            <select
              value={calculateMonth}
              onChange={(e) => setCalculateMonth(e.target.value)}
              className="form-select"
              required
              disabled={!calculateYear} // Deshabilitar si no hay año seleccionado
            >
              <option value="">--- Selecciona un mes ---</option>
              {(monthsByYear[calculateYear] || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="historical-modal-buttons">
            <button
              type="button"
              className="historical-modal-button cancel-button-historical"
              onClick={closeHistoricalModal}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="historical-modal-button cancel-button-historical"
              onClick={alertDelete}
            >
              Borrar
            </button>
            <button
              type="button"
              className="historical-modal-button submit-button-historical"
              onClick={alertConfirmCalculateHistorical}
            >
              Calcular
            </button>
          </div>
        </form>

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onRequestClose={closeConfirmModal}
          onConfirm={handleConfirm}
          message={confirmMessage}
        />
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default HistoricalKPI;
