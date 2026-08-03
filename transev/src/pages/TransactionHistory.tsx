import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import {
  FaHome,
  FaWallet,
  FaRupeeSign,
  FaBolt,
  FaReceipt,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';

// ---------- TypeScript contracts (updated for new bill structure) ----------
export type MoneyHistoryFilter = 'all' | 'wallet_recharge' | 'charging_debit';
export type MoneyTransactionType = 'WALLET_RECHARGE' | 'CHARGING_DEBIT';
export type MoneyTransactionDirection = 'CREDIT' | 'DEBIT';

export interface BillingParty {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface BillingIssuer extends BillingParty {
  designation: string | null;
  gstin: string | null;
}

export interface BillingCharger {
  id: string | null;
  name: string | null;
  serial_number: string | null;
  address: string | null;
  connector_type: string | null;
  protocol: string | null;
}

export interface BillingChargingDetails {
  session_id: string | null;
  started_at: string | null;
  stopped_at: string | null;
  duration_ms: string | null;
  meter_start_wh: string | null;
  meter_stop_wh: string | null;
  energy_consumed_kwh: string | null;
}

export interface BillingPayment {
  reference: string | null;
  wallet_id: string | null;
}

export interface BillingAmounts {
  taxable: string | null;
  gst: string | null;
  total: string | null;
  balance_deducted: string | null;
  last_transaction: string | null;
}

export interface ChargingBillData {
  id: string | null;
  source: 'USER_BILLING' | 'DERIVED_FROM_TRANSACTION';
  title: 'Customer Bill';
  invoice_number: string;
  issued_at: string;
  updated_at: string;
  currency: 'INR';
  customer: BillingParty;
  issuer: BillingIssuer | null;
  charger: BillingCharger;
  charging: BillingChargingDetails;
  payment: BillingPayment;
  amounts: BillingAmounts;
}

export interface WalletSummary {
  id: string | null;
  current_balance: string | null;
  currency: 'INR';
}

export interface ChargingSessionSummary {
  session_id: string;
  charger_id: string | null;
  started_at: string | null;
  stopped_at: string | null;
  meter_start_wh: string | null;
  meter_stop_wh: string | null;
  consumed_kwh: string | null;
  total_cost: string | null;
}

// The bill field in MoneyTransactionEntry is now ChargingBillData
export interface MoneyTransactionEntry {
  id: string;
  type: MoneyTransactionType;
  direction: MoneyTransactionDirection;
  amount: string | null;
  currency: 'INR';
  payment_id: string | null;
  wallet_id: string | null;
  charger_id: string | null;
  taxable_amount: string | null;
  gst_amount: string | null;
  created_at: string;
  updated_at: string;
  charging_session: ChargingSessionSummary | null;
  bill: ChargingBillData | null; // <-- updated
}

export interface MoneyHistoryPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

export interface MoneyHistoryResponse {
  message: string;
  wallet: WalletSummary | null;
  data: MoneyTransactionEntry[];
  pagination: MoneyHistoryPagination;
  filter: {
    type: MoneyHistoryFilter;
  };
}

class MoneyHistoryAPIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'MoneyHistoryAPIError';
    this.status = status;
  }
}

// ---------- API client (unchanged) ----------
const CMS_BASE_URL = 'https://be.cms.ocpp.transev.site';

async function getMoneyTransactionHistory({
  token,
  page = 1,
  limit = 20,
  type = 'all',
  signal,
}: {
  token: string;
  page?: number;
  limit?: number;
  type?: MoneyHistoryFilter;
  signal?: AbortSignal;
}): Promise<MoneyHistoryResponse> {
  if (!token) {
    throw new Error('App-user token is required');
  }
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type,
  });
  const response = await fetch(
    `${CMS_BASE_URL}/users/moneytransactionhistory?${query.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  );
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message
        : 'Unable to load transaction history';
    throw new MoneyHistoryAPIError(response.status, message);
  }
  return body as MoneyHistoryResponse;
}

// ---------- Helpers ----------
const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded?.userid || null;
  } catch {
    return null;
  }
};

const formatINR = (amount: string | null): string => {
  if (amount === null || amount.trim() === '') return '₹—';
  const normalized = amount.trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return `₹${normalized}`;
  const [whole, fraction = ''] = normalized.split('.');
  const groupedWhole = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(BigInt(whole));
  const paise = fraction.padEnd(2, '0').slice(0, 2);
  return `₹${groupedWhole}.${paise}`;
};

const transactionTitle = (tx: MoneyTransactionEntry): string => {
  return tx.type === 'WALLET_RECHARGE' ? 'Wallet Recharge' : 'EV Charging';
};

const transactionSign = (tx: MoneyTransactionEntry): '+' | '−' => {
  return tx.direction === 'CREDIT' ? '+' : '−';
};

const transactionStatusText = (tx: MoneyTransactionEntry): string => {
  return tx.type === 'WALLET_RECHARGE' ? 'Recharge successful' : 'Charging completed';
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

// ---------- PDF generation helpers ----------
function text(value: string | null | undefined): string {
  return value?.trim() || 'Not available';
}

function money(value: string | null | undefined, currency = 'INR'): string {
  if (!value) return 'Not available';
  return currency === 'INR' ? `₹${value}` : `${currency} ${value}`;
}

function dateTime(value: string | null | undefined): string {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

function duration(milliseconds: string | null | undefined): string {
  if (!milliseconds) return 'Not available';
  const totalMilliseconds = Number(milliseconds);
  if (!isFinite(totalMilliseconds) || totalMilliseconds < 0) {
    return milliseconds;
  }
  const totalMinutes = Math.floor(totalMilliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function safeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// ---------- PDF generator (from spec) ----------
function generateChargingBillPDF(bill: ChargingBillData): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const left = 18;
  const right = 192;
  let y = 20;

  const line = (label: string, value: string | null | undefined) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${label}:`, left, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(text(value), 65, y);
    y += 7;
  };

  const section = (title: string) => {
    y += 4;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(title, left, y);
    y += 3;
    pdf.line(left, y, right, y);
    y += 7;
    pdf.setFontSize(10);
  };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(bill.title || 'Customer Bill', 105, y, { align: 'center' });
  y += 12;
  pdf.setFontSize(10);

  line('Invoice Number', bill.invoice_number);
  line('Issue Date', dateTime(bill.issued_at));
  line('Currency', bill.currency);
  line('Billing Source', bill.source);

  section('Customer');
  line('Customer Name', bill.customer.name);
  line('Customer ID', bill.customer.id);
  line('Email', bill.customer.email);
  line('Phone', bill.customer.phone);
  if (bill.customer.address) {
    line('Address', bill.customer.address);
  }

  if (bill.issuer) {
    section('Charging Operator');
    line('Operator Name', bill.issuer.name);
    line('Email', bill.issuer.email);
    line('Phone', bill.issuer.phone);
    line('Address', bill.issuer.address);
    if (bill.issuer.gstin) {
      line('GSTIN', bill.issuer.gstin);
    }
  }

  section('Charging Details');
  line('Session ID', bill.charging.session_id);
  line('Charger', bill.charger.name);
  line('Charger ID', bill.charger.id);
  line('Serial Number', bill.charger.serial_number);
  line('Location', bill.charger.address);
  line('Connector Type', bill.charger.connector_type);
  line('Protocol', bill.charger.protocol);
  line('Charging Started', dateTime(bill.charging.started_at));
  line('Charging Stopped', dateTime(bill.charging.stopped_at));
  line('Duration', duration(bill.charging.duration_ms));
  line(
    'Meter Start',
    bill.charging.meter_start_wh ? `${bill.charging.meter_start_wh} Wh` : null,
  );
  line(
    'Meter Stop',
    bill.charging.meter_stop_wh ? `${bill.charging.meter_stop_wh} Wh` : null,
  );
  line(
    'Energy Consumed',
    bill.charging.energy_consumed_kwh
      ? `${bill.charging.energy_consumed_kwh} kWh`
      : null,
  );

  section('Payment');
  line('Reference', bill.payment.reference);
  line('Wallet ID', bill.payment.wallet_id);

  section('Amount Breakdown');
  line('Taxable Amount', money(bill.amounts.taxable, bill.currency));
  line('GST', money(bill.amounts.gst, bill.currency));
  line('Total Amount', money(bill.amounts.total, bill.currency));
  line('Wallet Deduction', money(bill.amounts.balance_deducted, bill.currency));

  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(
    'This document was generated electronically from the charging transaction record.',
    105,
    y,
    { align: 'center' },
  );

  const filename = safeFilename(`bill_${bill.invoice_number}.pdf`);
  pdf.save(filename);
}

// ---------- Component ----------
const TransactionHistory: React.FC = () => {
  const history = useHistory();
  const token = localStorage.getItem('token') || '';
  const userid = getUserIdFromToken();

  // State
  const [response, setResponse] = useState<MoneyHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Pagination & filter
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filter, setFilter] = useState<MoneyHistoryFilter>('all');

  // For bill download loading (only for UI feedback)
  const [downloadingBillId, setDownloadingBillId] = useState<string | null>(null);

  // Fetch function
  const fetchData = useCallback(
    async (abortSignal?: AbortSignal) => {
      if (!token) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      try {
        const result = await getMoneyTransactionHistory({
          token,
          page,
          limit,
          type: filter,
          signal: abortSignal,
        });
        setResponse(result);
      } catch (err: any) {
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
        if (err instanceof MoneyHistoryAPIError && err.status === 401) {
          setUnauthorized(true);
          setResponse(null);
          toast.error('Session expired. Please login again.');
        } else {
          setError(err.message || 'Failed to load transactions');
        }
      } finally {
        setLoading(false);
      }
    },
    [token, page, limit, filter],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  // Handle filter change (reset to page 1)
  const handleFilterChange = (newFilter: MoneyHistoryFilter) => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      setPage(1);
    }
  };

  // Pagination controls
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && response?.pagination && newPage <= response.pagination.total_pages) {
      setPage(newPage);
    }
  };

  // Updated download function – uses local PDF generation
  const downloadBill = (bill: ChargingBillData) => {
    setDownloadingBillId(bill.id);
    try {
      generateChargingBillPDF(bill);
      toast.success('Bill generated and downloaded');
    } catch (err) {
      toast.error('Could not generate bill');
    } finally {
      setDownloadingBillId(null);
    }
  };

  // If unauthorized, redirect to login
  useEffect(() => {
    if (unauthorized) {
      localStorage.removeItem('token');
      history.push('/login');
    }
  }, [unauthorized, history]);

  // ----- Render -----
  const renderTransactionCard = (tx: MoneyTransactionEntry) => {
    const sign = transactionSign(tx);
    const amount = formatINR(tx.amount);
    const title = transactionTitle(tx);
    const status = transactionStatusText(tx);
    const date = formatDate(tx.created_at);
    const isCredit = tx.direction === 'CREDIT';

    return (
      <div
        key={tx.id}
        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 mb-4"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-800">{title}</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isCredit ? 'Credit' : 'Debit'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{status}</p>
            {tx.type === 'CHARGING_DEBIT' && tx.charging_session && (
              <div className="mt-1 text-sm text-gray-500">
                <p>
                  <span className="font-medium">Charger:</span>{' '}
                  {tx.charging_session.charger_id || tx.charger_id || 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">Energy:</span>{' '}
                  {tx.charging_session.consumed_kwh
                    ? `${tx.charging_session.consumed_kwh} kWh`
                    : '—'}
                </p>
              </div>
            )}
            {tx.type === 'WALLET_RECHARGE' && tx.payment_id && (
              <p className="text-xs text-gray-400 mt-1">Payment: {tx.payment_id}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{date}</p>
          </div>
          <div className="flex flex-col items-end">
            <p
              className={`text-lg font-bold ${
                isCredit ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {sign} {amount}
            </p>
            {tx.type === 'CHARGING_DEBIT' && (
              <div className="text-xs text-gray-400 mt-1">
                {tx.taxable_amount && (
                  <span>Taxable: {formatINR(tx.taxable_amount)}</span>
                )}
                {tx.gst_amount && (
                  <span className="ml-2">GST: {formatINR(tx.gst_amount)}</span>
                )}
              </div>
            )}
            {/* Bill download button – now uses local generation */}
            {tx.type === 'CHARGING_DEBIT' && tx.bill && (
              <button
                onClick={() => downloadBill(tx.bill!)}
                disabled={downloadingBillId === tx.bill.id}
                className="mt-2 text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-full flex items-center gap-1 transition disabled:opacity-50"
              >
                {downloadingBillId === tx.bill.id ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaDownload />
                )}
                {downloadingBillId === tx.bill.id ? 'Generating...' : 'Download Bill'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !response) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <FaSpinner className="animate-spin text-teal-600 text-4xl" />
      </div>
    );
  }

  if (error && !response) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const walletBalance = response?.wallet?.current_balance
    ? formatINR(response.wallet.current_balance)
    : '₹—';
  const transactions = response?.data || [];
  const pagination = response?.pagination;

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4">
      <div className="max-w-md mx-auto pb-4">
        {/* Home button */}
        <div className="mb-4">
          <button
            onClick={() => history.push('/dashboard')}
            className="p-3 bg-teal-600 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-200"
          >
            <FaHome className="text-white text-xl" />
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
          {/* Header – Balance */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-teal-100 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold tracking-tight">{walletBalance}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaWallet className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Filter tabs */}
            <div className="flex bg-gray-100 rounded-full p-1 mb-6">
              {(['all', 'wallet_recharge', 'charging_debit'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition ${
                    filter === type
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'wallet_recharge' ? 'Recharges' : 'Charging'}
                </button>
              ))}
            </div>

            {/* Transactions list */}
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <FaRupeeSign className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-gray-400 text-sm">Your financial history will appear here</p>
              </div>
            ) : (
              <>
                {transactions.map((tx) => renderTransactionCard(tx))}

                {/* Pagination controls */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={!pagination.has_previous || loading}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      <FaArrowLeft className="text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={!pagination.has_next || loading}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      <FaArrowRight className="text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;