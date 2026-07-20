import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { FaArrowLeft, FaBolt, FaClock, FaPlug, FaTimes, FaSync } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

// ---------- TypeScript models ----------
type TransactionId = string;
type ChargingTransactionStatus =
  | 'ACTIVE'
  | 'STOP_PROCESSING'
  | 'STOP_REQUESTED'
  | 'STOP_RETRYING'
  | 'STOP_FAILED'
  | 'RECONCILE_REQUIRED';

interface CurrentChargingTransaction {
  uid: string | null;
  chargerid: string;
  userid: string;
  transactionid: TransactionId;
  connectorid: string | null;
  max_kwh: string | null;
  status: ChargingTransactionStatus;
  stopattempts: number;
  stoprequestedat: string | null;
  laststoperror: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CurrentTransactionsResponse {
  ongoing: true;
  can_request_stop: boolean;
  stale: boolean;
  age_minutes: number;
  stale_after_minutes: number;
  ambiguous: boolean;
  transaction: CurrentChargingTransaction;
  transaction_count: number;
  ongoing_transactions: CurrentChargingTransaction[];
}

interface NoCurrentTransactionResponse {
  ongoing: false;
  message: string;
  checked_recent_transactions: number;
}

interface StopResponse {
  message: string;
  status?: string;
  transactionid?: string;
  already_processed?: boolean;
  retry_scheduled?: boolean;
  detail?: string;
}

// ---------- API helpers ----------
const BASE_URL = 'https://be.cms.ocpp.transev.site';

class CmsApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: any,
  ) {
    super(body?.message || `CMS request failed with ${statusCode}`);
  }
}

async function postCms<T>(
  path: string,
  token: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let result: any = {};
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = { message: text };
  }
  if (!response.ok) {
    throw new CmsApiError(response.status, result);
  }
  return result as T;
}

async function getCurrentTransactions(
  token: string,
  userid: string,
): Promise<CurrentTransactionsResponse | NoCurrentTransactionResponse> {
  try {
    return await postCms<CurrentTransactionsResponse>(
      '/users/getongoingtransaction',
      token,
      { userid },
    );
  } catch (error) {
    if (error instanceof CmsApiError && error.statusCode === 404) {
      return error.body as NoCurrentTransactionResponse;
    }
    throw error;
  }
}

async function requestStop(
  token: string,
  transaction: CurrentChargingTransaction,
): Promise<StopResponse> {
  try {
    return await postCms<StopResponse>(
      '/users/chargerstop',
      token,
      {
        chargerid: transaction.chargerid,
        userid: transaction.userid,
        transactionid: transaction.transactionid,
      },
    );
  } catch (error) {
    if (
      error instanceof CmsApiError &&
      error.statusCode === 400 &&
      error.body?.retry_scheduled === true
    ) {
      return error.body as StopResponse;
    }
    throw error;
  }
}

// ---------- Component ----------
const ActiveSession: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<
    CurrentTransactionsResponse | NoCurrentTransactionResponse | null
  >(null);
  const [stopping, setStopping] = useState<TransactionId | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.userid;
      } catch {
        return null;
      }
    }
    return null;
  };

  const token = localStorage.getItem('token') || '';
  const userid = getUserIdFromToken();

  const fetchData = async () => {
    if (!userid) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await getCurrentTransactions(token, userid);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey, userid]);

  const handleStop = async (transaction: CurrentChargingTransaction) => {
    if (stopping) return;
    setStopping(transaction.transactionid);
    try {
      const stopResult = await requestStop(token, transaction);
      // After stop, refresh the list
      setRefreshKey((prev) => prev + 1);
      // If stop resulted in completed, we could show a toast but refresh will remove it.
    } catch (err: any) {
      setError(err.message || 'Stop request failed');
    } finally {
      setStopping(null);
    }
  };

  const renderTransaction = (tx: CurrentChargingTransaction) => {
    const isStopping = stopping === tx.transactionid;
    const status = tx.status;
    let statusColor = 'text-green-600';
    let statusLabel = status;
    let canStop = status === 'ACTIVE' && data?.ongoing && (data as CurrentTransactionsResponse).can_request_stop;

    if (status === 'STOP_PROCESSING' || status === 'STOP_REQUESTED' || status === 'STOP_RETRYING') {
      statusColor = 'text-yellow-600';
      canStop = false;
    } else if (status === 'STOP_FAILED' || status === 'RECONCILE_REQUIRED') {
      statusColor = 'text-red-600';
      canStop = false;
    }

    return (
      <div key={tx.transactionid} className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">Transaction #{tx.transactionid}</h3>
              <span className={`text-sm font-medium ${statusColor}`}>
                ● {statusLabel}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Charger:</span> {tx.chargerid}</p>
              <p><span className="font-medium">Connector:</span> {tx.connectorid || 'N/A'}</p>
              <p><span className="font-medium">Max kWh:</span> {tx.max_kwh || 'N/A'}</p>
              <p><span className="font-medium">Started:</span> {new Date(tx.createdAt).toLocaleString()}</p>
              {tx.stoprequestedat && (
                <p><span className="font-medium">Stop requested:</span> {new Date(tx.stoprequestedat).toLocaleString()}</p>
              )}
              {tx.laststoperror && (
                <p className="text-red-500"><span className="font-medium">Last error:</span> {tx.laststoperror}</p>
              )}
            </div>
          </div>
          {canStop && (
            <button
              onClick={() => handleStop(tx)}
              disabled={isStopping}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isStopping ? 'Stopping...' : 'Stop Charging'}
            </button>
          )}
          {!canStop && status !== 'ACTIVE' && (
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Stop in progress</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p>Error: {error}</p>
          <button onClick={() => setRefreshKey((k) => k + 1)} className="mt-2 text-sm underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isOngoing = data?.ongoing === true;
  const ongoingData = data as CurrentTransactionsResponse;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg shadow-sm px-4 py-3 flex items-center">
        <button onClick={() => history.push('/')} className="p-2 rounded-full hover:bg-gray-100 transition mr-3">
          <FaArrowLeft className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaBolt className="text-teal-600" />
          Active Sessions
        </h1>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="ml-auto p-2 rounded-full hover:bg-gray-100 transition"
          title="Refresh"
        >
          <FaSync className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {!isOngoing ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 text-gray-300">⚡</div>
            <h2 className="text-2xl font-semibold text-gray-700">No Active Charging Session</h2>
            <p className="text-gray-500 mt-2">You are not currently charging any vehicle.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {ongoingData.transaction_count} session{ongoingData.transaction_count > 1 ? 's' : ''} active
              </span>
              {ongoingData.ambiguous && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Multiple sessions – please stop individually
                </span>
              )}
              {!ongoingData.ambiguous && ongoingData.can_request_stop && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Stop available
                </span>
              )}
              {ongoingData.stale && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                  Session is stale (age {ongoingData.age_minutes} min)
                </span>
              )}
            </div>

            {ongoingData.ongoing_transactions.map((tx) => renderTransaction(tx))}
          </>
        )}
      </div>
    </div>
  );
};

export default ActiveSession;