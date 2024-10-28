import React, { useState } from 'react';
import { IonIcon } from '@ionic/react'; // Import IonIcon for the home icon
import { home } from 'ionicons/icons'; // Import the home icon
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation

declare var Razorpay: any; // Declare Razorpay

const Wallet: React.FC = () => {
  const history = useHistory(); // Initialize useHistory
  const [balance, setBalance] = useState<number>(0); // Initial balance set to 0
  const [selectedAmount, setSelectedAmount] = useState<number>(0); // To track selected amount

  const addMoney = (amount: number): void => {
    setSelectedAmount(amount); // Set the selected amount
  };

  const payNow = (): void => {
    const paymentAmount = selectedAmount * 100; // Convert amount to paise

    const options = {
      key: 'rzp_test_ySKlMUoDlIHU1z', // Your Razorpay key
      amount: paymentAmount, // Amount in paise
      currency: 'INR',
      name: 'Your Company Name', // Your company name
      description: 'Add money to wallet',
      image: 'https://transev.in/wp-content/uploads/2023/07/logo-160x57.png', // Your logo
      handler: function (response: any) {
        alert('Payment successful. Payment ID: ' + response.razorpay_payment_id);
        setBalance(balance + selectedAmount); // Update balance
        setSelectedAmount(0); // Reset selected amount after successful payment
      },
      prefill: {
        name: 'Customer Name', // Customize with user’s name
        email: 'customer@example.com', // Prefill user email
        contact: '9999999999', // Prefill user contact number
      },
      theme: {
        color: '#F37254', // Customize the color
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open(); // Open the Razorpay modal
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100 relative">
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col justify-between h-full">
          {/* Home Icon Button */}
          <button
            className="absolute top-4 left-4 p-2 rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition duration-300"
            onClick={() => history.push('/dashboard')}
          >
            <IonIcon icon={home} />
          </button>

          <div className="flex justify-center mb-6">
            <img
              src="https://transev.in/wp-content/uploads/2023/07/logo-160x57.png"
              alt="Logo"
              className="h-14 w-auto"
            />
          </div>
          <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">Wallet</h2>
          <div className="mb-6">
            <label className="block text-xl font-medium text-gray-700">Current Balance</label>
            <div className="mt-2 p-4 text-center border border-gray-300 rounded-lg bg-white text-gray-900 font-bold shadow-md">
              ₹ {balance}
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-700">Add Money</label>
            <div className="flex space-x-2 justify-center">
              {[100, 200, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => addMoney(amount)}
                  className={`w-24 h-12 bg-teal-500 text-white font-bold rounded-full shadow-lg transition duration-300 ${
                    selectedAmount === amount ? 'bg-teal-700' : 'hover:bg-teal-600'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <button
              onClick={payNow}
              className="w-full bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300"
              disabled={selectedAmount === 0}
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
