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

const Wallet: React.FC = () => {
  const history = useHistory();
  const [balance, setBalance] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [isVerified, setIsVerified] = useState(true); // Assuming auth already done

  const rooturi = "https://be.cms.ocpp.transev.site";
  const apikey = "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru";
  const razorpayKey = "rzp_test_nzmqxQYhvCH9rD";

  const token = localStorage.getItem('token');
  const decoded: DecodedToken | null = token ? jwtDecode(token) : null;
  const userid = decoded?.userid || '';
  const walletid = decoded?.userwalletid || '';

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!userid) return;

    try {
      const res = await fetch(`${rooturi}/users/getwalletbyuserid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiauthkey': apikey
        },
        body: JSON.stringify({ userid })
      });

      const responseData = await res.json();
      if (res.ok && responseData?.data?.balance) {
        setBalance(parseFloat(responseData.data.balance));
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
      toast.error('Failed to load balance');
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userid]);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedAmount) {
      toast.warning('Please select an amount');
      return;
    }

    setLoading(true);

    try {
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      const initRes = await fetch(`${rooturi}/admin/initwalletrecharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiauthkey': apikey,
        },
        body: JSON.stringify({
          userid,
          walletid,
          price: selectedAmount.toString()
        })
      });

      if (!initRes.ok) throw new Error('Payment initialization failed');
      const { orderId, actualprice } = await initRes.json();

      const options = {
        key: razorpayKey,
        amount: actualprice * 100,
        currency: 'INR',
        name: 'TransEV',
        description: 'Wallet Recharge',
        image: "https://cdn.statically.io/img/transmogriffy.com/wp-content/uploads/2022/03/TWLD5456.jpg?w=1280&quality=100&f=auto",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${rooturi}/admin/verifypayment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apiauthkey': apikey,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                userid,
                walletid,
                price: actualprice.toString(),
                ipAddress
              })
            });

            if (!verifyRes.ok) throw new Error('Payment verification failed');

            toast.success('✅ Wallet recharged successfully!');
            await fetchBalance(); // ✅ Refresh updated balance
          } catch (error: any) {
            console.error("Verify error:", error);
            toast.error(`❌ ${error.message}`);
          }
        },
        prefill: {
          email: '',
          contact: ''
        },
        theme: { color: '#008080' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(`⚠️ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative">

        {isVerified && (
          <button
            className="absolute top-4 left-4 p-2 rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600"
            onClick={() => history.push('/dashboard')}
          >
            <IonIcon icon={home} />
          </button>
        )}

        <div className="text-center mb-4">
          <h2 className="text-4xl font-bold text-teal-800">Wallet</h2>
        </div>

        <div className="mb-6">
          <label className="block text-xl font-medium text-gray-700">Current Balance</label>
          <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-white text-gray-900 font-bold shadow">
            ₹ {balance.toFixed(2)}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">Add Money</label>
          <div className="flex justify-center space-x-2">
            {[100, 200, 500, 1000].map(amount => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`w-24 h-12 rounded-full font-bold shadow-lg transition ${
                  selectedAmount === amount
                    ? 'bg-teal-700 text-white'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
          <button
            onClick={handlePayment}
            disabled={!selectedAmount || loading}
            className="w-full py-3 rounded-full font-bold text-white shadow-lg transition bg-teal-500 hover:bg-teal-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ₹${selectedAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
