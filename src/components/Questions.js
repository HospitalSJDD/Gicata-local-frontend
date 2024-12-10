import React, { useState } from 'react';
import '../styles/Questions.css'; // Archivo CSS para estilizar la página
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const Questions = () => {
  const [activeIndex, setActiveIndex] = useState(null); // Estado para gestionar la pregunta activa

  // Ejemplo de preguntas y respuestas
  const faqData = [
    {
      question: '¿Cómo puedo registrar un nuevo usuario?',
      answer: 'Para registrar un nuevo usuario, dirígete a la sección de "Agregar nuevo usuario" en el menú principal y completa el formulario con los datos requeridos.',
    },
    {
      question: '¿Cómo puedo subir documentos?',
      answer: 'Para subir documentos, selecciona la opción "Subir documentos" en la barra lateral y elige los archivos que deseas cargar.',
    },
    {
      question: '¿Cómo puedo cerrar sesión?',
      answer: 'Puedes cerrar sesión haciendo clic en el botón "Cerrar Sesión" en la parte inferior de la barra lateral.',
    },
    {
      question: '¿Que es un indicador compuesto?',
      answer: 'Corresponde a los indicadores que cuentan con un porcentaje propio dentro de su componente.',
    },
    {
      question: '¿Como se sube un archivo?',
      answer: 'Debe dirigirse a la seccion "Gestion de datos" donde luego debe presionar "Subir documentos", en esta pestaña debera indicar la categoria del archivo que subira, el mes y año al que corresponden y luego seleccionar el archivo a ser cargado. Posteriormente, presionar "Subir" y esperar el tiempo correspondiente. \nLa idea de esto es subir los archivos mes a mes.',
    },
    {
      question: 'Por que los calculos no se realizan en automatico?',
      answer: 'Para asi evitar el calculo erroneo de sus indicadores en caso de recibir un Excel con errores.',
    },
    {
      question: '¿Como se realizan los calculos?',
      answer: 'Debe dirigirse a la seccion "Gestion de KPI", luego presionar "Historico" alli debera seleccionar "Realizar calculos" en la esquina superior izquierda, a continuacion elegir el mes y año que desea calcular finalizando con presionar Calcular.',
    },
    {
      question: '¿Como se borran los calculos?',
      answer: 'Debe dirigirse a la seccion "Gestion de KPI", luego presionar "Historico" alli debera seleccionar "Realizar calculos" en la esquina superior izquierda, a continuacion elegir el mes y año que desea eliminar finalizando con presionar Borrar.',
    },
    {
      question: '¿Como se borra un indicador?',
      answer: 'Debe dirigirse a la seccion "Gestion de KPI", luego presionar "Observar KPI" alli podra visualizar todos los indicadores, a continuación sea con filtrado o busqueda manual encontrar el indicador en cuestion, luego presionar "Eliminar" y confirmar su decision.',
    },
  ];

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // Alterna la pregunta activa
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Preguntas Frecuentes</h2>
      <div className="faq-content">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
            onClick={() => toggleAnswer(index)}
          >
            <div className="faq-header">
              <h3 className="faq-question">{faq.question}</h3>
              <FontAwesomeIcon
                icon={activeIndex === index ? faMinus : faPlus}
                className="faq-icon"
              />
            </div>
            {activeIndex === index && <p className="faq-answer">{faq.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Questions;
