import React, { useState } from 'react';
import QrReader from 'react-qr-barcode-scanner';
import Modal from './Modal'; // Import the Modal component

const QRScannerComponent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false); // State for modal visibility
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading status

  const handleUpdate = (result: any) => { // Use 'any' for flexible access
    if (result && result.text) { // Access the correct property
      setScannedData(result.text); // Use the text property
      setModalOpen(true); // Open the modal after scanning
    }
  };

  const handleError = (err: string | DOMException) => {
    setError(err instanceof DOMException ? err.message : err);
  };

  const handleStartCharger = async () => {
    setLoading(true); // Set loading to true while making the API call
    const url = "https://transmogrify.in/users/startcharge";

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiauthkey': 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
        },
        body: JSON.stringify({ chargerid: scannedData }), // Payload with the charger ID
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`); // Handle errors
      }

      const data = await response.json(); // Get the response data
      console.log(data); // Log the response data for debugging
      alert("Charger started!"); // Show success message after API call
      setModalOpen(false); // Close the modal
      onClose(); // Optionally close the scanner after starting the charger
    } catch (error) {
      alert(`Failed to start charger: ${error}`); // Show error message
    } finally {
      setLoading(false); // Reset loading status
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Scan QR Code</h2>
        {error && <p className="text-red-500">{error}</p>}
        <QrReader
          delay={300}
          onError={handleError}
          onUpdate={(error, result) => {
            if (result) {
              handleUpdate(result); // Pass the entire result object
            }
          }}
        />
        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
          Close
        </button>
        {scannedData && <p>{`Scanned data: ${scannedData}`}</p>}
      </div>
      
      {/* Modal for displaying charger ID and button */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        chargerId={scannedData || ''} 
        onStartCharger={handleStartCharger} 
      />
    </div>
  );
};

export default QRScannerComponent;
