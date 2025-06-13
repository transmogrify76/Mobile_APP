import React, { useState } from 'react';
import QrReader from 'react-qr-barcode-scanner';
import Modal from './Modal';

const QRScannerComponent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOperative, setIsOperative] = useState(true);

  const EXTERNAL_URI = "http://hal.ocpp.transev.site";
  const OCPP_API_KEY = "J9YtyNYdbLD8N4qMwU2WQrr9XV2SJn4Q3qrCLEcHa8wwaZC34xhAd3RotuYdHwiB";

  const handleUpdate = (result: any) => {
    if (result?.text) {
      setScannedData(result.text);
      setModalOpen(true);
    }
  };

  const handleError = (err: any) => {
    setError(err?.message || "Scanning failed");
  };

  const toggleStatus = async () => {
    if (!scannedData) return;
    setLoading(true);
    const newStatus = !isOperative;
    try {
      const response = await fetch(`${EXTERNAL_URI}/api/change_availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": OCPP_API_KEY,
        },
        body: JSON.stringify({
          uid: scannedData,
          connector_id: "1",
          type: newStatus ? "Operative" : "Inoperative",
        }),
      });

      const result = await response.json();
      if (response.ok && result.status === "Accepted") {
        setIsOperative(newStatus);
        alert(`Status changed to ${newStatus ? 'Operative' : 'Inoperative'}`);
      } else {
        throw new Error(result.error || "Failed to change status");
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#8EAE3E] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Charger Scanner</h2>
            <p className="text-sm text-gray-500 mt-1">Scan QR to manage charger status</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-3 rounded">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Scanner */}
        <div className="relative mb-6">
          <div className="rounded-xl overflow-hidden border-4 border-gray-100 shadow-lg">
            <QrReader
              delay={300}
              onError={handleError}
              onUpdate={(_, result) => result && handleUpdate(result)}
            />
          </div>
          <div className="mt-3 text-center text-gray-700 text-sm">
            Align QR code within the frame
          </div>
        </div>

        {/* Scanned Info */}
        {scannedData && (
          <div className="bg-green-50 rounded-lg p-3 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 truncate">Scanned ID: {scannedData}</p>
          </div>
        )}

        {/* Manual Input */}
        <div className="mt-4 flex justify-center">
          <button
            className="flex items-center text-gray-500 hover:text-gray-800 text-sm"
            onClick={() => document.getElementById('manual-input')?.focus()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M8 13h4M8 9h4M8 5h1" />
            </svg>
            Enter ID manually
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        chargerId={scannedData || ''}
        onToggle={toggleStatus}
        loading={loading}
        isOperative={isOperative}
      />
    </div>
  );
};

export default QRScannerComponent;
