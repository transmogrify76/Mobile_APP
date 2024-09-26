// QRScanner.tsx
import React, { useState } from 'react';
import QRScanner from 'react-qr-scanner';

const QRScannerComponent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<string | null>(null);

  const handleScan = (data: string | null) => {
    if (data) {
      setData(data);
      // You can also add any action you want to perform with the scanned data here
      alert(`Scanned data: ${data}`);
      onClose(); // Close the scanner after scanning
    }
  };

  const handleError = (err: Error) => {
    console.error(err);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Scan QR Code</h2>
        <QRScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%', height: 'auto' }}
        />
        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default QRScannerComponent;
