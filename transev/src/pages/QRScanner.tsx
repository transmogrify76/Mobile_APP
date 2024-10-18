import React, { useState } from 'react';
import QrReader from 'react-qr-barcode-scanner';

const QRScannerComponent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (result: any) => { // Use 'any' for flexible access
    if (result && result.text) { // Access the correct property
      setScannedData(result.text); // Use the text property
      alert(`Scanned data: ${result.text}`);
      onClose(); // Close the scanner after scanning
    }
  };

  const handleError = (err: string | DOMException) => {
    setError(err instanceof DOMException ? err.message : err);
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
    </div>
  );
};

export default QRScannerComponent;
