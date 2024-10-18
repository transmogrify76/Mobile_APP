import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  chargerId: string;
  onStartCharger: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, chargerId, onStartCharger }) => {
  if (!isOpen) return null; // Don't render anything if the modal is not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Charger ID</h2>
        <p className="text-gray-700 mb-4">{chargerId}</p>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          onClick={onStartCharger}
        >
          Start Charger
        </button>
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
