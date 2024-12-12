// Dashboard.js

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faUsers,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { BarChart } from "@mui/x-charts/BarChart";
import { toast } from "react-toastify";
import { LineChart } from "@mui/x-charts/LineChart";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import { axisClasses } from "@mui/x-charts/ChartsAxis";

import "../styles/Dashboard.css"; // Importar el archivo CSS para estilizar el dashboard

const Dashboard = () => {
  // Mapeo de Meses a Números
  const monthToNumber = {
    Enero: 1,
    Febrero: 2,
    Marzo: 3,
    Abril: 4,
    Mayo: 5,
    Junio: 6,
    Julio: 7,
    Agosto: 8,
    Septiembre: 9,
    Octubre: 10,
    Noviembre: 11,
    Diciembre: 12,
  };

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const BACKEND_URL = "https://gicata-backend-847472302122.southamerica-west1.run.app";

  // Función para obtener el mes anterior en español
  const getPreviousMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const previousMonth = date.toLocaleString("es-ES", { month: "long" });
    return capitalizeFirstLetter(previousMonth);
  };

  const currentYear = new Date().getFullYear();

  const [listPrograms, setListPrograms] = useState([]);
  const [listComponents, setListComponents] = useState([]);
  const [listHistoricalPrograms, setListHistoricalPrograms] = useState([]);
  const [listHistoricalComponents, setListHistoricalComponents] = useState([]);

  const [listMonths, setListMonths] = useState([]);
  const [listYears, setListYears] = useState([]);
  const [monthsByYear, setMonthsByYear] = useState({}); // Mapeo de años a meses
  const [listResults, setListResults] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("selecp"); // Almacena ID del programa
  const [selectedComponent, setSelectedComponent] = useState("selecc");
  const [selectedType, setSelectedType] = useState("Normal");
  const [selectedMonths, setSelectedMonths] = useState([]); // Inicializado vacío
  const [selectedYears, setSelectedYears] = useState([]); // Inicializado vacío
  const [selectedHistoricalProgram, setSelectedHistoricalProgram] = useState(
    []
  );
  const [showAlertTable, setShowAlertTable] = useState(false);

  const [filteredMonths, setFilteredMonths] = useState([]); // Meses filtrados para "Normal"

  const [chartData, setChartData] = useState({
    xAxis: [{ scaleType: "band", data: [] }],
    series: [],
  });
  const [alertsData, setAlertsData] = useState({
    programs: [],
    components: [],
  });

  const [programID, setProgramID] = useState(""); // Añadido para filtrar componentes

  useEffect(() => {
    // Cargar todos los datos al montar el componente
    fetchAllData();
  }, []);

  useEffect(() => {
    // Recalcular los datos del gráfico cada vez que cambien las selecciones o los datos
    const updatedChartData = getChartData();
    setChartData(updatedChartData);
  }, [
    selectedProgram,
    selectedComponent,
    selectedType,
    selectedMonths,
    selectedYears,
    listPrograms,
    listComponents,
    listHistoricalPrograms,
    listHistoricalComponents,
    listResults,
  ]);

  // useEffect para establecer el último mes disponible según la lógica requerida
  useEffect(() => {
    if (selectedType === "Normal") {
      if (
        listHistoricalPrograms.length > 0 ||
        listHistoricalComponents.length > 0
      ) {
        // Combinar programas y componentes históricos
        const combinedHistorical = [
          ...listHistoricalPrograms,
          ...listHistoricalComponents,
        ];

        // Extraer pares de mes y año
        const monthYearPairs = combinedHistorical
          .filter((item) => item.month && item.year)
          .map((item) => ({
            month: capitalizeFirstLetter(item.month),
            year: parseInt(item.year, 10),
          }));

        if (monthYearPairs.length === 0) {
          console.warn(
            "No hay pares mes-año disponibles en los datos históricos."
          );
          return;
        }

        // Filtrar pares para el año actual
        const currentYearPairs = monthYearPairs.filter(
          (pair) => pair.year === currentYear
        );

        let targetYear;
        let targetMonth;

        if (currentYearPairs.length > 0) {
          // Si hay datos para el año actual, encontrar el último mes
          targetYear = currentYear;
          targetMonth = currentYearPairs.reduce((latest, current) => {
            return monthToNumber[current.month] > monthToNumber[latest.month]
              ? current
              : latest;
          }, currentYearPairs[0]).month;
        } else {
          // Si no hay datos para el año actual, encontrar el último año disponible
          const latestYear = Math.max(
            ...monthYearPairs.map((pair) => pair.year)
          );
          const latestYearPairs = monthYearPairs.filter(
            (pair) => pair.year === latestYear
          );
          targetYear = latestYear;
          targetMonth = latestYearPairs.reduce((latest, current) => {
            return monthToNumber[current.month] > monthToNumber[latest.month]
              ? current
              : latest;
          }, latestYearPairs[0]).month;
        }

        // Actualizar los estados seleccionados
        setSelectedMonths([targetMonth]);
        setSelectedYears([targetYear.toString()]);
      }
    }
  }, [
    selectedType, // Añadido selectedType a las dependencias
    listHistoricalPrograms,
    listHistoricalComponents,
    listMonths,
    listYears,
    currentYear,
  ]);

  // useEffect para actualizar los meses filtrados cuando cambie el año seleccionado
  useEffect(() => {
    if (selectedType === "Normal") {
      if (selectedYears.length > 0) {
        const selectedYear = selectedYears[0];
        const availableMonths = monthsByYear[selectedYear] || [];
        setFilteredMonths(availableMonths);

        // Si el mes seleccionado no está en los meses disponibles, actualizarlo
        if (!availableMonths.includes(selectedMonths[0])) {
          setSelectedMonths(
            availableMonths.length > 0
              ? [availableMonths[availableMonths.length - 1]]
              : []
          );
        }
      } else {
        // Si no hay año seleccionado, mostrar todos los meses o un mensaje adecuado
        setFilteredMonths([]);
      }
    }
  }, [selectedType, selectedYears, monthsByYear, selectedMonths]);

  const toggleAlertTable = () => {
    setShowAlertTable((prev) => !prev);
  };

  const getFilteredAlertsData = () => {
    console.log(alertsData);
    if (selectedProgram !== "selecp") {
      console.log("Filtrando alertas para ProgramID:", selectedProgram);
      
      const components_to_filter = getComponentsByProgram(selectedProgram);
      console.log("Componentes a filtrar:", components_to_filter);
      const alertComponents = alertsData.components

      let showComponents = alertComponents.filter((hc) =>
        components_to_filter.some((c) => c.name === hc.component_name))
      
      console.log("Componentes filtrados para alertas:", showComponents);
      return showComponents;
    }
    console.log("Mostrando todas las alertas de programas");
    return alertsData.programs;
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/programs`);
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

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/alerts`)
      .then((response) => response.json())
      .then((data) => {
        setAlertsData(data); // Asegúrate de que data contenga 'programs' y 'components'
      })
      .catch((error) => console.error("Error fetching alerts:", error));
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/components`);
      const data = await response.json();
      if (response.ok) {
        setListComponents(data);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  const fetchHistoricalPrograms = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/historical-programs`
      );
      const data = await response.json();
      if (response.ok) {
        setListHistoricalPrograms(data);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  const fetchHistoricalComponents = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/historical-components`
      );
      const data = await response.json();
      if (response.ok) {
        setListHistoricalComponents(data);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  const fetchHistoricalDates = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dates`);
      const data = await response.json();
      if (response.ok) {
        // Supongo que `data` es una lista de objetos con `month` y `year`
        const months = data.map((m) => capitalizeFirstLetter(m.month));
        const uniqueMonths = [...new Set(months)].sort(
          (a, b) => monthToNumber[a] - monthToNumber[b]
        );
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
        Object.keys(mapping).forEach((year) => {
          sortedMapping[year] = Array.from(mapping[year]).sort(
            (a, b) => monthToNumber[a] - monthToNumber[b]
          );
        });

        setMonthsByYear(sortedMapping);

        // Opcional: Puedes verificar las fechas cargadas
        console.log("Meses únicos:", uniqueMonths);
        console.log("Años únicos:", uniqueYears);
        console.log("Mapping de meses por año:", sortedMapping);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  const fetchResultados = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/results`);
      const data = await response.json();
      if (response.ok) {
        setListResults(data);
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error(error);
    }
  };

  const fetchAllData = async () => {
    await fetchPrograms();
    await fetchComponents();
    await fetchHistoricalPrograms();
    await fetchHistoricalComponents();
    await fetchHistoricalDates();
    await fetchResultados();
    console.log(listHistoricalComponents);
  };

  const chartSetting = {
    yAxis: [
      {
        label: "%",
        min: 0,
        max: 109,

        tickInterval: 20,
        showGridLines: true,
        gridLineStyle: {
          stroke: "#e0e0e0",
          strokeDasharray: "5,5",
        },
      },
    ],
    width: 1200,
    height: 600,
    borderRadius: 15,
    margin: { top: 40, right: 30, bottom: 80, left: 70 },
    responsive: true,
    maintainAspectRatio: false,
    sx: {
      ".MuiChart-root": {
        margin: "0 auto",
        padding: "30px",
        backgroundColor: "#f4f6f8",
        borderRadius: "15px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
      },
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: "translate(-25px, 0)",
        fontWeight: "600",
        fontSize: "16px",
        color: "#333",
      },
      [`.${axisClasses.bottom} .${axisClasses.label}`]: {
        transform: "translate(0, 10px)",
        fontWeight: "600",
        fontSize: "14px",
        color: "#333",
      },
      ".MuiChart-gridLine": {
        stroke: "#d3d3d3",
        strokeWidth: 1,
      },
    },
    legend: {
      position: {
        vertical: "top",
        horizontal: "right",
      },

      align: "center",
      // Añade espacio extra para que la leyenda no quede pegada al gráfico.
      itemStyle: {
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
  };

  const handleHistoricalProgramChange = (event) => {
    setSelectedHistoricalProgram([...event.target.value]);
  };

  const handleComponentChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    // Reiniciar selecciones al cambiar el tipo
    setSelectedProgram("selecp");
    setSelectedComponent("selecc");
    setSelectedHistoricalProgram([]);
    setSelectedMonths([]);
    setSelectedYears([]);
  };

  const handleMonthsChange = (event) => {
    setSelectedMonths([...event.target.value]);
  };

  const handleYearsChange = (event) => {
    setSelectedYears([...event.target.value]);
  };

  const handleProgramChange = (event) => {
    setSelectedProgram(event.target.value);
    setSelectedComponent("selecc"); // Resetear la selección del componente
  };

  const handleSingularMonthChange = (event) => {
    const listMonths = [];
    listMonths.push(event.target.value);
    setSelectedMonths(listMonths);
  };

  const handleSingularYearChange = (event) => {
    const listYears = [];
    listYears.push(event.target.value);

    setSelectedYears(listYears);
  };

  const filterDates = (listToFilter) => {
    if (!listToFilter || listToFilter.length === 0) {
      console.warn("No hay datos para filtrar.");
      return [];
    }

    // Establecer valores predeterminados sin mutar las listas originales
    const months =
      selectedMonths.length > 0 ? selectedMonths : [getPreviousMonth()];
    const years =
      selectedYears.length > 0 ? selectedYears : [currentYear.toString()];

    const filteredList = listToFilter.filter((item) => {
      if (item.calculation_date) {
        const [month, year] = item.calculation_date.split(" ");
        const passes =
          months.includes(capitalizeFirstLetter(month)) && years.includes(year);

        return passes;
      } else if (item.month && item.year) {
        const passes =
          months.includes(capitalizeFirstLetter(item.month)) &&
          years.includes(item.year);

        return passes;
      }

      return false;
    });

    return filteredList;
  };

  const cumulative = (dataList, viewList) => {
    let sum = 0;
    for (let i = 0; i < viewList.length; i++) {
      for (let j = 0; j < dataList.length; j++) {
        //needs to be added if the month is the same or minor the selected month and the years is the same that the selected year
        if (
          dataList[j].calculation_date.split(" ")[1] ===
            viewList[i].calculation_date.split(" ")[1] &&
          monthToNumber[dataList[j].calculation_date.split(" ")[0]] <=
            monthToNumber[viewList[i].calculation_date.split(" ")[0]]
        ) {
          if (
            viewList[i].id_component === dataList[j].id_component &&
            viewList[i].calculation_date === dataList[j].calculation_date
          ) {
            sum += dataList[j].achieved_result;
          }
          viewList[i].achieved_goal = sum;
        }
      }
    }

    return viewList;
  };

  const getComponentsByProgram = (programId) => {
    const components = listComponents.filter(
      (c) => Number(c.program_id) === Number(programId)
    );

    // Filtrar componentes históricos
    let historicalComponentsFiltered = listHistoricalComponents.filter((hc) =>
      components.some((c) => c.id === hc.id_component)
    );

    // Usa map para crear nuevos objetos en lugar de modificar los existentes
    historicalComponentsFiltered = historicalComponentsFiltered.map((hc) => {
      const component = components.find((c) => c.id === hc.id_component);
      return {
        ...hc,
        name: component ? component.name : "Sin nombre",
        relative_weight: component ? component.relative_weight : 0,
      };
    });

    return filterDates(historicalComponentsFiltered);
  };

  // Función para obtener los KPIs asociados a un componente
  const getKpisByComponent = (componentId) => {
    let kpis = listResults.filter((k) => k.component === componentId);
    kpis = filterDates(kpis);
    return kpis;
  };

  const getHistoricalProgramsFiltered = () => {
    if (selectedHistoricalProgram.length === 0) {
      return [];
    }

    const historicalProgramsFiltered = listHistoricalPrograms.filter((hp) =>
      selectedHistoricalProgram.includes(hp.program_id)
    );

    historicalProgramsFiltered.forEach((hp) => {
      const program = listPrograms.find((p) => p.id === hp.program_id);
      hp.nombre = program ? program.name : "Sin nombre";
    });

    return filterDates(historicalProgramsFiltered);
  };

  const getColorByAlert = (alertThreshold) => {
    if (alertThreshold == null || isNaN(alertThreshold)) {
      return "#000000"; // Color predeterminado (negro) si el umbral no es válido
    }
    if (alertThreshold === 2) {
      return "#00ff00"; // Verde
    } else if (alertThreshold === 1) {
      return "#ff9900"; // Naranja
    }
    return "#ff0000"; // Rojo
  };

  const getPrograms = () => {
    const programsDates = filterDates(listHistoricalPrograms);
    programsDates.forEach((p) => {
      const program = listPrograms.find((pr) => pr.id === p.program_id);
      p.name = program ? program.name : "Sin nombre";
    });
    return programsDates;
  };

  const getAlertColor = (item) => {
    console.log("Item para colo alertas " + item);
    switch (item) {
      case "Baja":
        return "#00c853";
      case "Media":
        return "#ff9800"; // Añadido '#' al color
      case "Alta":
        return "#f44336";
      case "Crítica":
        return "#b71c1c";
      case "Completado":
        return "#4caf50";
      default:
        return "gray";
    }
  };

  /**
  .alert-level[data-level="1"] {
  background-color: #00c853; 
}

.alert-level[data-level="2"] {
  background-color: #ff9800;
}

.alert-level[data-level="3"] {
  background-color: #f44336; 
}

.alert-level[data-level="4"] {
  background-color: #b71c1c; 
}
.alert-level[data-level="5"] {
  background-color: #4caf50; 
} 
   
   */

  const AlertTable = ({ data, type }) => (
    <TableContainer component={Paper} style={{ maxWidth: 600, margin: "20px auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{type}</TableCell>
            <TableCell align="right">Nivel de Alerta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.component_name || item.program_name}</TableCell>
              <TableCell align="right">
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px 10px",
                    backgroundColor: getAlertColor(item.alert_level),
                    color: "white",
                    borderRadius: "5px",
                  }}
                >
                  {item.alert_level}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const getChartData = () => {
    if (selectedType === "Normal") {
      if (selectedProgram === "selecp") {
        const programsDates = filterDates(listHistoricalPrograms);
        programsDates.forEach((p) => {
          const program = listPrograms.find((pr) => pr.id === p.program_id);
          p.name = program ? program.name : "Sin nombre";
        });

        const dataset = programsDates.map((p) => ({
          name: p.name,
          accumulated_goal: p.accumulated_goal || 0,
          goal: 100,
          alert_thresholds: p.alert_thresholds || 0,
          color: getAlertColor(p.alert_thresholds || 0), // Añadimos la propiedad color
        }));

        return {
          dataset,
          xAxis: [{ scaleType: "band", dataKey: "name" }],
          series: [
            { id: "goal", dataKey: "goal", label: "Meta" },
            {
              id: "accumulated_goal",
              dataKey: "accumulated_goal",
              label: "Meta Alcanzada",
              colorKey: "color", // Usamos colorKey para aplicar el color
            },
          ],
        };
      } else if (selectedComponent && selectedComponent !== "selecc") {
        const kpisForComponent = getKpisByComponent(selectedComponent);

        if (!kpisForComponent.length) {
          return {
            xAxis: [{ scaleType: "band", data: [] }],
            series: [],
          };
        }

        const dataset = kpisForComponent.map((kpi) => ({
          name: kpi.name,
          achieved_result: kpi.achieved_result || 0,
          goal: kpi.goal || 0,
          alert_thresholds: kpi.alert_thresholds || 0,
          color: getAlertColor(kpi.alert_thresholds || 0), // Añadimos la propiedad color
        }));

        return {
          dataset,
          xAxis: [{ scaleType: "band", dataKey: "name" }],
          series: [
            { id: "goal", dataKey: "goal", label: "Meta" },
            {
              id: "achieved_result",
              dataKey: "achieved_result",
              label: "Meta Alcanzada",
              colorKey: "color", // Usamos colorKey para aplicar el color
            },
          ],
        };
      } else if (selectedProgram !== "selecp") {
        const componentsForProgram = getComponentsByProgram(selectedProgram);

        const dataset = componentsForProgram.map((c) => ({
          name: c.name,
          accumulated_goal: c.accumulated_goal || 0,
          goal: c.relative_weight || 0,
          alert_thresholds: c.alert_thresholds || 0,
          color: getAlertColor(c.alert_thresholds || 0), // Añadimos la propiedad color
        }));

        return {
          dataset,
          xAxis: [{ scaleType: "band", dataKey: "name" }],
          series: [
            { id: "goal", dataKey: "goal", label: "Meta" },
            {
              id: "accumulated_goal",
              dataKey: "accumulated_goal",
              label: "Meta Alcanzada",
              colorKey: "color", // Usamos colorKey para aplicar el color
            },
          ],
        };
      }
    } else if (selectedType === "Historical") {
      // Lógica para tipo histórico
      return getLineData();
    }

    return {
      xAxis: [{ scaleType: "band", data: [] }],
      series: [],
    };
  };

  const getLineData = () => {
    // Ordena los meses seleccionados según su orden en `listMonths`
    const sortedMonths = [...selectedMonths].sort(
      (a, b) => monthToNumber[a] - monthToNumber[b]
    );

    const sortedYears = [...selectedYears].sort((a, b) => a - b);

    if (selectedHistoricalProgram.length === 0) {
      return {
        xAxis: [{ scaleType: "band", data: [] }],
        series: [],
      };
    }

    const filteredPrograms = getHistoricalProgramsFiltered();

    if (filteredPrograms.length === 0) {
      console.warn("No hay programas filtrados para mostrar.");
      return {
        xAxis: [{ scaleType: "band", data: [] }],
        series: [],
      };
    }

    // Combinar meses y años seleccionados
    const monthsYears = [];
    sortedYears.forEach((year) => {
      sortedMonths.forEach((month) => {
        monthsYears.push(`${month} ${year}`);
      });
    });

    // Agrupar los datos por programa
    const groupedPrograms = filteredPrograms.reduce((acc, program) => {
      if (!program.month || !program.year) {
        console.warn("Programa con fecha incompleta:", program);
        return acc; // Salta este programa si falta el mes o el año
      }

      const dateKey = `${capitalizeFirstLetter(program.month)} ${program.year}`; // Clave formada por mes y año

      if (!acc[program.nombre]) {
        acc[program.nombre] = {}; // Inicializar un objeto para el programa
      }

      acc[program.nombre][dateKey] = program.accumulated_goal || 0; // Asociar fecha con meta alcanzada
      return acc;
    }, {});

    // Crear las series para el gráfico
    const series = Object.keys(groupedPrograms).map((programName) => ({
      label: programName, // Nombre del programa
      data: monthsYears.map(
        (date) => groupedPrograms[programName][date] || 0 // Datos para cada fecha seleccionada
      ),
    }));

    return {
      xAxis: [{ scaleType: "band", data: monthsYears }], // Configuración del eje X
      series, // Configuración del eje Y
    };
  };

  const chartLineData = getLineData();

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard Principal</h2>

      {/* FILTERS */}
      <div className="filters-container">
        <Select
          value={selectedType}
          onChange={handleTypeChange}
          style={{ minWidth: 200, marginRight: 20 }}
        >
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Historical">Histórico</MenuItem>
        </Select>

        {selectedType === "Normal" ? (
          <>
            <Select
              labelId="select-program"
              id="select-program"
              value={selectedProgram}
              onChange={handleProgramChange}
              renderValue={(value) =>
                value === "selecp"
                  ? "Seleccionar programa"
                  : listPrograms.find((p) => p.id === value)?.name
              }
              style={{ minWidth: 300, marginRight: 20 }}
            >
              {/* Opción predeterminada visible siempre */}
              <MenuItem value="selecp">Seleccionar programa</MenuItem>
              {listPrograms.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.name}
                </MenuItem>
              ))}
            </Select>

            <Select
              labelId="select-component"
              id="select-component"
              value={selectedComponent}
              onChange={handleComponentChange}
              disabled={selectedProgram === "selecp"} // Deshabilitar si no hay programa seleccionado
              style={{ minWidth: 300, marginRight: 20 }}
            >
              <MenuItem value="selecc">Seleccionar componente</MenuItem>
              {selectedProgram !== "selecp" &&
                listComponents
                  .filter((component) => Number(component.program_id) === Number(selectedProgram))
                  .map((component) => (
                    <MenuItem key={component.id} value={component.name}>
                      {component.name}
                    </MenuItem>
                  ))}
            </Select>

            {/* Selector de Meses Filtrados en Modo "Normal" */}
            <Select
              value={selectedMonths}
              onChange={handleSingularMonthChange}
              style={{ minWidth: 200, marginRight: 20 }}
            >
              {filteredMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={selectedYears}
              onChange={handleSingularYearChange}
              style={{ minWidth: 200, marginRight: 20 }}
            >
              {listYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </>
        ) : (
          <>
            {/* Selección múltiple de programas */}
            <Select
              multiple
              value={selectedHistoricalProgram}
              onChange={handleHistoricalProgramChange}
              renderValue={(selected) =>
                selected
                  .map((id) => listPrograms.find((p) => p.id === id)?.name)
                  .join(", ")
              }
              style={{ minWidth: 300, marginRight: 20 }}
            >
              {listPrograms.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  <Checkbox
                    checked={selectedHistoricalProgram.includes(program.id)}
                  />
                  <ListItemText primary={program.name} />
                </MenuItem>
              ))}
            </Select>
            {/* Selección múltiple de meses */}
            <Select
              multiple
              value={selectedMonths}
              onChange={handleMonthsChange}
              renderValue={(selected) => selected.join(", ")}
              style={{ minWidth: 200, marginRight: 20 }}
            >
              {listMonths.map((mes) => (
                <MenuItem key={mes} value={mes}>
                  <Checkbox checked={selectedMonths.includes(mes)} />
                  <ListItemText primary={mes} />
                </MenuItem>
              ))}
            </Select>

            {/* Selección múltiple de años */}
            <Select
              multiple
              value={selectedYears}
              onChange={handleYearsChange}
              renderValue={(selected) => selected.join(", ")}
              style={{ minWidth: 200 }}
            >
              {listYears.map((año) => (
                <MenuItem key={año} value={año}>
                  <Checkbox checked={selectedYears.includes(año)} />
                  <ListItemText primary={año} />
                </MenuItem>
              ))}
            </Select>
          </>
        )}
      </div>
      <div className="stats-container">
        {/* Tarjeta de Programas */}
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Programas</h3>
            <p>{alertsData.programs.length}</p>
          </div>
          <div className="alert-container">
            <span className="alert-level" data-level="5">
              Completo:{" "}
              {
                alertsData.programs.filter(
                  (p) => p.alert_level === "Completado"
                ).length
              }
            </span>
            <span className="alert-level" data-level="1">
              Baja:{" "}
              {
                alertsData.programs.filter((p) => p.alert_level === "Baja")
                  .length
              }
            </span>
            <span className="alert-level" data-level="2">
              Media:{" "}
              {
                alertsData.programs.filter((p) => p.alert_level === "Media")
                  .length
              }
            </span>
            <span className="alert-level" data-level="3">
              Alta:{" "}
              {
                alertsData.programs.filter((p) => p.alert_level === "Alta")
                  .length
              }
            </span>
            <span className="alert-level" data-level="4">
              Crítica:{" "}
              {
                alertsData.programs.filter((p) => p.alert_level === "Crítica")
                  .length
              }
            </span>
          </div>
        </div>

        {/* Tarjeta de Componentes */}
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Componentes</h3>
            <p>{alertsData.components.length}</p>
          </div>
          <div className="alert-container">
            <span className="alert-level" data-level="4">
              Crítica:{" "}
              {
                alertsData.components.filter((c) => c.alert_level === "Crítica")
                  .length
              }
            </span>

            <span className="alert-level" data-level="3">
              Alta:{" "}
              {
                alertsData.components.filter((c) => c.alert_level === "Alta")
                  .length
              }
            </span>

            <span className="alert-level" data-level="2">
              Media:{" "}
              {
                alertsData.components.filter((c) => c.alert_level === "Media")
                  .length
              }
            </span>

            <span className="alert-level" data-level="1">
              Baja:{" "}
              {
                alertsData.components.filter((c) => c.alert_level === "Baja")
                  .length
              }
            </span>

            <span className="alert-level" data-level="5">
              Completo:{" "}
              {
                alertsData.components.filter(
                  (c) => c.alert_level === "Completado"
                ).length
              }
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor de gráficos */}
      <div className="charts-container">
        <div className="chart-box">
          <h3>Indicadores</h3>
          <div className="chart-placeholder">
            {selectedType === "Normal" ? (
              <BarChart {...chartData} {...chartSetting} />
            ) : (
              <LineChart {...chartLineData} {...chartSetting} />
            )}
          </div>
        </div>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={toggleAlertTable}
        style={{ margin: "20px auto", display: "block" }}
      >
        {showAlertTable ? "Ocultar Tabla" : "Mostrar Tabla"}
      </Button>

      {showAlertTable && (
        <div className="alert-table-container">
          <AlertTable
            data={getFilteredAlertsData()}
            type={selectedProgram !== "selecp" ? "Componente" : "Programa"}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
