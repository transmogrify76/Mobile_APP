import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { home } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

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

          toast.success('Recharged!');
          fetchBalance();
          fetchRechargeHistory();
        },
        theme: { color: '#0f766e' },
      });

      rzp.open();
    } catch (err: any) {
      toast.error('Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafa] p-4 text-sm">
      <div className="max-w-md mx-auto space-y-4">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-teal-700">My Wallet</h1>
          <button
            className="text-white bg-teal-600 p-2 rounded-full"
            onClick={() => history.push('/dashboard')}
          >
            <IonIcon icon={home} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl px-6 py-4 shadow text-center">
          <p className="text-gray-500 text-xs mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-teal-800">₹ {balance.toFixed(2)}</p>
        </div>

        {/* Recharge Amount Buttons */}
        <div>
          <p className="mb-2 text-gray-600 font-medium">Recharge</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[100, 200, 500, 1000].map(amount => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`py-2 rounded-full text-xs font-semibold ${
                  selectedAmount === amount
                    ? 'bg-teal-700 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
          <button
            onClick={handlePayment}
            disabled={!selectedAmount || loading}
            className="w-full bg-teal-600 text-white py-3 rounded-full font-semibold shadow-sm hover:bg-teal-700 disabled:opacity-40"
          >
            {loading ? 'Processing...' : `Pay ₹${selectedAmount}`}
          </button>
        </div>

        {/* Recharge History */}
        <div className="mt-6">
          <h2 className="text-teal-700 font-semibold mb-2">Recharge History</h2>
          {rechargeHistory.length === 0 ? (
            <p className="text-gray-400 text-center text-xs">No history yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {rechargeHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white px-4 py-3 rounded-xl shadow flex justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-gray-800 text-sm font-medium">
                      +₹{rec.addedbalance}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Prev: ₹{rec.previousbalance} → ₹{rec.balanceleft}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(rec.createdAt).toLocaleDateString()}<br />
                    {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
