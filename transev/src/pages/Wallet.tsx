import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { FaHome, FaWallet, FaRupeeSign, FaHistory, FaArrowUp, FaSpinner } from 'react-icons/fa';

declare global {
  interface Window {
    Razorpay: any;
  }
}
 
interface DecodedToken {
  userid: string;
  userwalletid: string;
}

interface RechargeRecord {
  id: string;
  addedbalance: string;
  previousbalance: string;
  balanceleft: string;
  createdAt: string;
}

const Wallet: React.FC = () => {
  const history = useHistory();
  const [balance, setBalance] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  const rooturi = "https://be.cms.ocpp.transev.site";
  const apikey = "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru";
  const razorpayKey = "rzp_test_nzmqxQYhvCH9rD";

  const token = localStorage.getItem('token');
  const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
  const userid = decoded?.userid || '';
  const walletid = decoded?.userwalletid || '';

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${rooturi}/users/getwalletbyuserid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apiauthkey: apikey,
        },
        body: JSON.stringify({ userid }),
      });
      const data = await res.json();
      if (res.ok) setBalance(parseFloat(data.data.balance));
    } catch {
      toast.error('Failed to fetch balance');
    }
  };

  const fetchRechargeHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const res = await fetch(`${rooturi}/users/userwalletrechargehistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apiauthkey: apikey,
        },
        body: JSON.stringify({ userid }),
      });
      const data = await res.json();
      if (res.ok) setRechargeHistory(data.data);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchRechargeHistory();
  }, []);

  const loadRazorpayScript = () =>
    new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (!selectedAmount) return toast.warn('Select amount');
    setLoading(true);

    try {
      await loadRazorpayScript();

      const res = await fetch(`${rooturi}/admin/initwalletrecharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apiauthkey: apikey,
        },
        body: JSON.stringify({ userid, walletid, price: selectedAmount.toString() }),
      });

      const { orderId, actualprice } = await res.json();

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: actualprice * 100,
        currency: 'INR',
        name: 'TransEV',
        description: 'Wallet Recharge',
        image: 'https://transev.in/assets/up-B0GM0qzi.png',
        order_id: orderId,
        handler: async (response: any) => {
          await fetch(`${rooturi}/admin/verifypayment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apiauthkey: apikey,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              userid,
              walletid,
              price: actualprice.toString(),
            }),
          });

          toast.success('Recharge successful!');
          fetchBalance();
          fetchRechargeHistory();
        },
        theme: { color: '#0f766e' },
      });

      rzp.open();
    } catch (err: any) {
      toast.error('Recharge failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalRecharged = rechargeHistory.reduce(
    (sum, rec) => sum + parseFloat(rec.addedbalance),
    0
  );

  return (
    // Force scrollable container: full viewport height, vertical scroll
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4">
      <div className="max-w-md mx-auto pb-4">
        {/* Home Button */}
        <div className="mb-4">
          <button
            onClick={() => history.push('/dashboard')}
            className="p-3 bg-teal-600 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-200"
          >
            <FaHome className="text-white text-xl" />
          </button>
        </div>

        {/* Main Wallet Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-teal-100 text-sm">Your Balance</p>
                <p className="text-4xl font-bold tracking-tight">₹{balance.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaWallet className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Recharge Section */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                <FaRupeeSign className="text-teal-600" />
                Recharge Amount
              </h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[100, 200, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      selectedAmount === amount
                        ? 'bg-teal-600 text-white shadow-md scale-95'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePayment}
                disabled={!selectedAmount || loading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaArrowUp />
                    Pay ₹{selectedAmount}
                  </>
                )}
              </button>
            </div>

            {/* Recharge History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-700 font-semibold flex items-center gap-2">
                  <FaHistory className="text-teal-600" />
                  Recharge History
                </h2>
                {totalRecharged > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Total ₹{totalRecharged.toFixed(2)}
                  </span>
                )}
              </div>

              {isFetchingHistory ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-teal-600 text-2xl" />
                </div>
              ) : rechargeHistory.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <FaHistory className="mx-auto text-gray-300 text-3xl mb-2" />
                  <p className="text-gray-400 text-sm">No recharge history yet</p>
                  <p className="text-gray-400 text-xs mt-1">Your transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 pr-1">
                  {rechargeHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-green-600 font-bold text-lg">+ ₹{rec.addedbalance}</p>
                          <div className="flex gap-2 mt-1 text-xs text-gray-400">
                            <span>Prev: ₹{rec.previousbalance}</span>
                            <span>→</span>
                            <span>New: ₹{rec.balanceleft}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDate(rec.createdAt)}</p>
                          <p className="text-xs text-gray-400">{formatTime(rec.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;