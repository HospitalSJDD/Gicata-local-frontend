import React, { useEffect, useState } from "react";
import "../styles/SidebarMenu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks, // Para Gestión de KPI.
  faDatabase, // Para Subida de Datos.
  faFileUpload, // Para Subir Documentos.
  faFolderOpen, // Para Histórico.
  faChartBar, // Para Visualizar Dashboard.
  faGaugeHigh, // Como alternativa para Dashboard.
  faArrowRightFromBracket, // Como alternativa para Cerrar Sesión.
  faHome,
  faChartLine,
  faQuestionCircle,
  faHospitalUser,
} from "@fortawesome/free-solid-svg-icons";
import logo_coquimbo from "../assets/images/salud_coquimbo.png";
const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app";
const SidebarMenu = ({
  onHomeClick,
  onUploadClick,
  onAdminUser,
  onLogout,
  onQuestions,
  onDashboard,
  onUploadKPIClick,
  onPreviewKPI,
  onHistorical,
  onUploadData,
  onPreviewData,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState("home");
  const [isKPIDropdownOpen, setIsKPIDropdownOpen] = useState(false);
  const [isDataDropdownOpen, setIsDataDropdownOpen] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/user`, {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          console.error("Error al obtener la información del usuario");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <div>No se ha autenticado ningún usuario</div>;
  }

  const hasAdminOrSupervisorPermission =
    user.permissions.includes("Administrador");

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2 className="title">GICATA</h2>
        <img src={logo_coquimbo} alt="logo" className="logo-image" />
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li
            className={activeItem === "home" ? "active" : ""}
            onClick={() => {
              onHomeClick();
              setActiveItem("home");
            }}
          >
            <FontAwesomeIcon icon={faHome} style={{ marginRight: "10px" }} />{" "}
            Home
          </li>
          <li
            className={activeItem === "dashboard" ? "active" : ""}
            onClick={() => {
              onDashboard();
              setActiveItem("dashboard");
            }}
          >
            <FontAwesomeIcon
              icon={faChartBar}
              style={{ marginRight: "10px" }}
            />{" "}
            Visualizar Dashboard
          </li>

          {hasAdminOrSupervisorPermission && (
            <>
              {/* Menú desplegable para KPI */}
              <li
                className={`dropdown ${isKPIDropdownOpen ? "open" : ""}`}
                onClick={() => setIsKPIDropdownOpen(!isKPIDropdownOpen)}
              >
                <div className="dropdown-header">
                  <FontAwesomeIcon
                    icon={faTasks}
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Gestión de KPI
                  <span className="dropdown-icon">
                    {isKPIDropdownOpen ? "▲" : "▼"}
                  </span>
                </div>
              </li>

              {isKPIDropdownOpen && (
                <ul className="nested-menu">
                  <li
                    className={activeItem === "uploadKPI" ? "active" : ""}
                    onClick={() => {
                      onUploadKPIClick();
                      setActiveItem("uploadKPI");
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faChartLine}
                      style={{ marginRight: "10px" }}
                    />{" "}
                    Registrar KPI
                  </li>
                  <li
                    className={activeItem === "previewKPI" ? "active" : ""}
                    onClick={() => {
                      onPreviewKPI();
                      setActiveItem("previewKPI");
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faChartLine}
                      style={{ marginRight: "10px" }}
                    />{" "}
                    Observar KPI
                  </li>
                  <li
                    className={activeItem === "historical" ? "active" : ""}
                    onClick={() => {
                      onHistorical();
                      setActiveItem("historical");
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFolderOpen}
                      style={{ marginRight: "10px" }}
                    />{" "}
                    Histórico
                  </li>
                </ul>
              )}
            </>
          )}

          {hasAdminOrSupervisorPermission && (
            <>
              <li
                className={`dropdown ${isDataDropdownOpen ? "open" : ""}`}
                onClick={() => setIsDataDropdownOpen(!isDataDropdownOpen)}
              >
                <div className="dropdown-header">
                  <FontAwesomeIcon
                    icon={faDatabase}
                    style={{ marginRight: "10px" }}
                  />{" "}
                  Gestion de Datos
                  <span className="dropdown-icon">
                    {isDataDropdownOpen ? "▲" : "▼"}
                  </span>
                </div>
              </li>          

              {isDataDropdownOpen && (
                <ul className="nested-menu">
                  <li
                    className={activeItem === "upload" ? "active" : ""}
                    onClick={() => {
                      onUploadClick();
                      setActiveItem("upload");
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFileUpload}
                      style={{ marginRight: "10px" }}
                    />{" "}
                    Subir documentos
                  </li>

                  <li
                    className={activeItem === "uploadData" ? "active" : ""}
                    onClick={() => {
                      onUploadData();
                      setActiveItem("uploadData");
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFileUpload}
                      style={{ marginRight: "10px" }}
                    />{" "}
                    Subir Programa/Componente
                  </li>

                  <li
                    className={activeItem === "previewData" ? "active" : ""}
                    onClick={() => {
                      onPreviewData();
                      setActiveItem("previewData");
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFileUpload}
                      style={{ marginRight: "10px" }}
                    />{" "}
                    Ver Programas
                  </li>
                </ul>
              )}
            </>
          )}

          {hasAdminOrSupervisorPermission && (
            <li
              className={activeItem === "admin" ? "active" : ""}
              onClick={() => {
                onAdminUser();
                setActiveItem("admin");
              }}
            >
              <FontAwesomeIcon
                icon={faHospitalUser}
                style={{ marginRight: "10px" }}
              />{" "}
              Administrar Usuarios
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div
          className={`footer-button ${
            activeItem === "questions" ? "active" : ""
          }`}
          onClick={() => {
            onQuestions();
            setActiveItem("questions");
          }}
        >
          <FontAwesomeIcon
            icon={faQuestionCircle}
            style={{ marginRight: "10px" }}
          />{" "}
          Preguntas Frecuentes
        </div>
        <div
          className={`footer-button ${activeItem === "logout" ? "active" : ""}`}
          onClick={() => {
            onLogout();
            setActiveItem("logout");
          }}
        >
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            style={{ marginRight: "10px" }}
          />{" "}
          Cerrar Sesión
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;
