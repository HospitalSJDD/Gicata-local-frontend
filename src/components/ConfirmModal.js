// ConfirmModal.jsx
import React from 'react';
import Modal from 'react-modal';
import '../styles/ConfirmModal.css';

const ConfirmModal = ({ isOpen, onRequestClose, onConfirm, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Confirmación"
      className="confirm-modal"
      overlayClassName="confirm-overlay"
    >
      <div className="confirm-content">
        <h2>Confirmar Acción</h2>
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-button" onClick={onConfirm}>Sí</button>
          <button className="cancel-button" onClick={onRequestClose}>No</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
