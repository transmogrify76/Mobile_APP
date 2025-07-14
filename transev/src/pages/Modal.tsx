import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  chargerId: string;
  connectors: string[];
  userid: string | null;
}  

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, chargerId, connectors, userid }) => {
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connectors.length > 0) {
      setSelectedConnector(connectors[0]);
    }
  }, [connectors]);

  const handleChargerAction = async (accept: boolean) => {
    if (!userid || !selectedConnector) {
      alert("User ID or Connector not selected");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://be.cms.ocpp.transev.site/users/chargerstart', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apiauthkey": "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
        },
        body: JSON.stringify({
          chargerid: chargerId,
          userid,
          useraccept: accept.toString(),
          connectorid: selectedConnector,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Charger ${accept ? 'started' : 'stopped'} successfully`);
      } else {
        throw new Error(data.error || "Charger action failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-200">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Charger Control Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Connector</label>
          <select
  className="w-full bg-white text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  value={selectedConnector}
  onChange={(e) => setSelectedConnector(e.target.value)}
>
  <option value="" disabled hidden>-- Select Connector --</option>
  {connectors.map((c) => (
    <option key={c} value={c}>
      Connector {parseInt(c) + 1}
    </option>
  ))}
</select>

        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => handleChargerAction(true)}
            disabled={loading || !selectedConnector}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded shadow-sm transition disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start"}
          </button>
          <button
            onClick={() => handleChargerAction(false)}
            disabled={loading || !selectedConnector}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded shadow-sm transition disabled:opacity-50"
          >
            {loading ? "Stopping..." : "Stop"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
