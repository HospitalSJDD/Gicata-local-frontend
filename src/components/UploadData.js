import React, { useState, useEffect } from "react";
import "../styles/UploadData.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "./ConfirmModal"; // Importar el nuevo componente

const UploadData = () => {
  const [selectedType, setSelectedType] = useState("");
  const [name, setName] = useState("");
  const [program, setProgram] = useState("");
  const [component, setComponent] = useState("");
  const [programID, setProgramID] = useState("");
  const [relativeImportance, setRelativeImportance] = useState("");
  const [error, setError] = useState("");
  const [listPrograms, setListPrograms] = useState([]);
  const [componentID, setComponentID] = useState("");
  const [listComponents, setListComponents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTypeModal, setSelectedTypeModal] = useState("");
  const [low_alert_threshold, setLow_alert_threshold] = useState("");
  const [medium_alert_threshold, setMedium_alert_threshold] = useState("");
  const [high_alert_threshold, setHigh_alert_threshold] = useState("");
  const [critical_alert_threshold, setCritical_alert_threshold] = useState(0.0);
  const [is_Additive, setIs_Additive] = useState(false);
  const [monthRange, setMonthRange] = useState("");
  const [wholeYear, setWholeYear] = useState('');
  const [monthStart, setMonthStart] = useState("");
  const [monthEnd, setMonthEnd] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  // Fetch para obtener los programas

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

  useEffect(() => {
    fetchPrograms();
    fetchComponents();
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  useEffect(() => {
    if (!wholeYear && monthStart && monthEnd) {
      setMonthRange(`${monthStart.trim()}-${monthEnd.trim()}`);
    }
  }, [wholeYear, monthStart, monthEnd]);
  

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

  const clear = () => {
    setSelectedTypeModal("");
    setRelativeImportance("");
    setSelectedType("");
    setName("");
    setProgram("");
    setProgramID("");
    setComponent("");
    setComponentID("");
    setLow_alert_threshold("");
    setMedium_alert_threshold("");
    setHigh_alert_threshold("");
    setMonthStart("");
    setMonthEnd("");
  };

  const handleDelete = async () => {
    try {
      if (selectedTypeModal === "Programa") {
        const response = await fetch(
          `http://localhost:5000/api/program-delete/${programID}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();
        if (response.ok) {
          toast.success("Programa eliminado con éxito.");
          fetchPrograms(); // Actualizar lista de programas
          fetchComponents();
          setShowModal(false);
          clear();
        } else {
          toast.error(`Error: ${result.error}`);
        }
      } else if (selectedTypeModal === "Componente") {
        const response = await fetch(
          `http://localhost:5000/api/component-delete/${componentID}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();
        if (response.ok) {
          toast.success("Componente eliminado con éxito.");
          fetchComponents(); // Actualizar lista de componentes
          setShowModal(false);
          clear();
        } else {
          toast.error(`Error: ${result.error}`);
        }
      } else {
        toast.error("No existe!");
      }
    } catch (error) {
      toast.error("Error en la conexión al eliminar.");
      console.error(error);
    }
    fetchPrograms(); // Actualizar lista de programas
    fetchComponents(); // Actualizar lista de componentes
  };
  // Manejar el cambio del programa seleccionado
  const handleProgramChange = (event) => {
    const selectedProgramName = event.target.value;
    setProgram(selectedProgramName);
    console.log(program);
    // Buscar la ID del programa seleccionado por su nombre
    const selectedProgram = listPrograms.find(
      (program) => program.name === selectedProgramName
    );
    if (selectedProgram) {
      setProgramID(selectedProgram.id);
    } else {
      setProgramID("");
    }
  };

  const handleComponentChange = (event) => {
    const selectedComponentName = event.target.value;
    setComponent(selectedComponentName);

    const selectedComponent = listComponents.find(
      (component) => component.name === selectedComponentName
    );
    if (selectedComponent) {
      setComponentID(selectedComponent.id);
    } else {
      setComponentID("");
    }
  };


  // Manejar el envío del formulario
  const handleSubmit = async (event) => {
    if (!selectedType || !name) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }
    setError("");

    try {
      if (selectedType === "Programa") {
        const response = await fetch("http://localhost:5000/api/program-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            low_alert_threshold,
            medium_alert_threshold,
            high_alert_threshold,
            critical_alert_threshold,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          toast.success("Programa guardado con éxito.");
          setListPrograms([...listPrograms, result]); // Actualizar lista de programas
        } else {
          toast.error(`Error: ${result.error}`);
        }
      } else if (selectedType === "Componente") {
        /*
        if (is_Additive) {
          setWholeYear(false);
          const rangeMonths = `${monthStart.trim()}-${monthEnd.trim()}`;
          console.log(rangeMonths);
          setMonthRange(rangeMonths);
          console.log("Whole Year is:" +wholeYear)
        } else {
          setWholeYear(true);
            console.log('aqui no entra porque deberia ser anual')
        }
        */

        if (!wholeYear){
          
          

          console.log('Whole year is',wholeYear);
          console.log(monthRange);
        }
        const response = await fetch(
          "http://localhost:5000/api/component-add",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              program_id: programID, // Enviar la ID del programa
              relative_weight: Number(relativeImportance),
              low_alert_threshold,
              medium_alert_threshold,
              high_alert_threshold,
              critical_alert_threshold,
              wholeYear,
              monthRange,
            }),
          }
        );

        const result = await response.json();
        if (response.ok) {
          toast.success("Componente guardado con éxito.");
        } else {
          toast.error(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      toast.error("Error en la conexión.");
      console.error(error);
    }
    fetchPrograms(); // Actualizar lista de programas
    // Resetear formulario
    clear();
  };

  const handleCancel = () => {
    setShowModal(false);
    clear(); 
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
      `¿Estás seguro de que deseas eliminar el ${
        selectedTypeModal || selectedType
      }: ${component || program || name}?`,
      () => handleDelete()
    );
  };

  const alertConfirmUploadData = () => {
    openConfirmModal(
      `¿Esta seguro de subir el ${selectedTypeModal || selectedType}: ${name}?`,
      () => handleSubmit()
    );
  };



  return (
    <div className="upload-data-container">
      <div className="upload-data-header">
        <button
          className="form-button-delete-data"
          onClick={() => setShowModal(true)}
        >
          Eliminar
        </button>
      </div>
      {}
      {showModal && (
        <div className="modal-overlay-upload-data">
          <div className="modal-content-upload-data">
            <h3>Seleccionar elemento para eliminar</h3>

            {/* Selección de tipo en el modal */}
            <div className="form-group-upload">
              <label>Seleccione el tipo:</label>
              <select
                value={selectedTypeModal}
                onChange={(e) => setSelectedTypeModal(e.target.value)}
                className="form-select-upload"
              >
                <option value="">--- Seleccione una opción ---</option>
                <option value="Programa">Programa</option>
                <option value="Componente">Componente</option>
              </select>
            </div>

            {/* Selección de Programa */}
            {selectedTypeModal === "Programa" && (
              <div className="form-group-upload">
                <label>Seleccione un Programa:</label>
                <select
                  value={program}
                  onChange={handleProgramChange}
                  className="form-select-upload"
                >
                  <option value="">--- Seleccione un programa ---</option>
                  {listPrograms.map((program) => (
                    <option key={program.id} value={program.name}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selección de Componente */}
            {selectedTypeModal === "Componente" && (
              <div className="form-group-upload">
                <label>Seleccione un Componente:</label>
                <select
                  value={component}
                  onChange={handleComponentChange}
                  className="form-select-upload"
                >
                  <option value="">--- Seleccione un componente ---</option>
                  {listComponents.map((component) => (
                    <option key={component.id} value={component.name}>
                      {component.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Acciones del modal */}
            <div className="modal-content-upload-data-actions">
              <button onClick={alertDelete} className="form-button-delete-data">
                Eliminar
              </button>
              <button
                onClick={handleCancel}
                className="form-button-cancel-upload-data"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="upload-data-form">
        <h2>Cargar Componente o Programa</h2>

        {/* Selección del tipo */}
        <div className="form-group-upload">
          <label>Seleccione el tipo:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-select-upload"
            required
          >
            <option value="">--- Seleccione una opción ---</option>
            <option value="Programa">Programa</option>
            <option value="Componente">Componente</option>
          </select>
        </div>

        {/* Nombre */}
        <div className="form-group-upload">
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input-upload"
            placeholder="Ingrese el nombre"
            required
          />
        </div>

        {/* Programa de origen e importancia (solo para componente) */}
        {selectedType === "Componente" && (
          <>
            <div className="form-group-upload">
              <label>Programa de Origen:</label>
              <select
                value={program}
                onChange={handleProgramChange}
                className="form-select-upload"
                required
              >
                <option value="">--- Seleccione un programa ---</option>
                {listPrograms.map((program) => (
                  <option key={program.id} value={program.name}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-upload">
              <label>Importancia Relativa:</label>
              <input
                type="number"
                value={relativeImportance}
                onChange={(e) => setRelativeImportance(e.target.value)}
                className="form-input-upload-small"
                placeholder="Ingrese la importancia relativa"
                required
                min="0"
              />
            </div>
            <div className="form-group-upload">
              <label>Es Anual:</label>

              <div className="radio-group">
              <label>
  <input
    type="radio"
    value="no"
    checked={is_Additive === false}
    onChange={() => {
      setIs_Additive(false);
      setWholeYear(true);
    }}
  />
  Si
</label>

<label>
  <input
    type="radio"
    value="yes"
    checked={is_Additive === true}
    onChange={() => {
      setIs_Additive(true);
      setWholeYear(false);
    }}
  />
  No
</label>
 
              </div>
            </div>
            {is_Additive && (
              <>
                {/* Selección de mes inicio*/}
                <div className="form-group-upload">
                  <label>Mes Inicio: </label>
                  <select
                    value={monthStart}
                    onChange={(e) => setMonthStart(e.target.value)}
                    className="form-select-upload"
                  >
                    <option value="">--- Selecciona un mes ---</option>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de mes fin*/}
                <div className="form-group-upload">
                  <label>Mes Final:</label>
                  <select
                    value={monthEnd}
                    onChange={(e) => setMonthEnd(e.target.value)}
                    className="form-select-upload"
                  >
                    <option value="">--- Selecciona un mes ---</option>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </>
        )}

        {/* low_alert_threshold */}
        <div className="form-group-upload">
          <label>Alerta Baja:</label>
          <input
            type="number"
            value={low_alert_threshold}
            onChange={(e) => setLow_alert_threshold(e.target.value)}
            className="form-input-upload"
            placeholder="Ingrese la alerta baja"
            required
          />
        </div>

        {/* medium_alert_threshold */}
        <div className="form-group-upload">
          <label>Alerta Media:</label>
          <input
            type="number"
            value={medium_alert_threshold}
            onChange={(e) => setMedium_alert_threshold(e.target.value)}
            className="form-input-upload"
            placeholder="Ingrese la alerta media"
            required
          />
        </div>

        {/* high_alert_threshold */}
        <div className="form-group-upload">
          <label>Alerta Alta:</label>
          <input
            type="number"
            value={high_alert_threshold}
            onChange={(e) => setHigh_alert_threshold(e.target.value)}
            className="form-input-upload"
            placeholder="Ingrese la alerta alta"
            required
          />
        </div>

        {/* Errores */}
        {error && <div className="error-message">{error}</div>}

        {/* Botón de envío */}
        <button
          type="button"
          className="form-button-upload-data"
          onClick={alertConfirmUploadData}
        >
          Cargar
        </button>
      </div>

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

export default UploadData;
