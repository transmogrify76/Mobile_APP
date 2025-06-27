import React, { useState } from 'react';
import QrReader from 'react-qr-barcode-scanner';
import Modal from './Modal';
import { jwtDecode } from 'jwt-decode';

const QRScannerComponent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [scannedData, setScannedData] = useState<any>(null);
  const [availableConnectors, setAvailableConnectors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const STATUS_API = "https://api.ocpphal.transev.site/api/status";
  const OCPP_API_KEY = "J9YtyNYdbLD8N4qMwU2WQrr9XV2SJn4Q3qrCLEcHa8wwaZC34xhAd3RotuYdHwiB";

  const getUserId = (): string | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded?.userid || null;
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  const handleError = (err: any) => {
    setError(err?.message || "Scanning failed");
  };

  const fetchChargerStatus = async (uid: string) => {
    const response = await fetch(STATUS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": OCPP_API_KEY,
      },
      body: JSON.stringify({ uid }),
    });

    const result = await response.json();
    if (!response.ok || !result.connectors) {
      throw new Error(result?.error || "Charger status fetch failed");
    }

    const connectors = Object.entries(result.connectors)
      .filter(([_, conn]: any) => conn.status === "Available")
      .map(([key]) => key);

    return {
      isOperative: result.status === "Active",
      connectors,
    };
  };

  const handleUpdate = async (_: any, result: any) => {
    if (!result?.text) return;
    try {
      const parsed = JSON.parse(result.text);
      const uid = parsed.uid;

      const { isOperative, connectors } = await fetchChargerStatus(uid);
      setScannedData(parsed);
      setAvailableConnectors(connectors);
      setModalOpen(true);
    } catch (err: any) {
      setError(`QR Parse/Status Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-100 via-teal-200 to-blue-100 flex items-center justify-center z-50">
      <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-teal-800">Scan Charger QR</h2>
            <p className="text-sm text-gray-700 mt-1">Authenticate to manage charger actions</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-3 rounded">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
       
        <div className="relative mb-6">
          <div className="rounded-xl overflow-hidden border-4 border-gray-200 shadow-md">
            <QrReader delay={300} onError={handleError} onUpdate={handleUpdate} />
          </div>
          <div className="mt-3 text-center text-gray-600 text-sm">Align QR code within the frame</div>
        </div>

        {scannedData && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4 text-sm text-green-800 shadow">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>

            
              <span><strong>Charger Found:</strong> {scannedData?.ChargerName} ({scannedData?.uid})</span>
            </div>
            <ul className="list-disc pl-6 text-gray-800">
              {scannedData?.Chargertype && (
                <li><strong>Type:</strong> {scannedData.Chargertype}</li>
              )}
              {scannedData?.Total_Capacity && (
                <li><strong>Total Capacity:</strong> {scannedData.Total_Capacity}</li>
              )}
              {scannedData?.Connector_type && (
                <li><strong>Connector Type:</strong> {scannedData.Connector_type}</li>
              )}
              {scannedData?.charger_use_type && (
                <li><strong>Usage:</strong> {scannedData.charger_use_type}</li>
              )}
              {scannedData?.full_address && (
                <li><strong>Address:</strong> {scannedData.full_address}</li>
              )}
            </ul>
          </div>
        )}
      </div>
 
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        chargerId={scannedData?.uid}
        connectors={availableConnectors}
        userid={getUserId()}
      />
    </div>
  );
};

export default QRScannerComponent;
