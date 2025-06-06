import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation
import { FaHome } from 'react-icons/fa'; // Import the home icon from react-icons

interface Transaction {
  uid: string;
  userid: string;
  name: string;
  username: string;
  walletid: string;
  lasttransaction: string;
  balancededuct: string;
  energyconsumption: string;
  chargerid: string;
  location: string;
  chargingtime: string;
}

const TransactionHistory: React.FC = () => {
  const history = useHistory(); // Create history object
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.post<{ data: Transaction[] }>(
          'https://be.cms.ocpp.transev.site/admin/transactionhistory',
          { userid: 'qal0' }, // Replace with dynamic user ID
          { headers: { apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru' } }
        );
        setTransactions(response.data.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data.message);
        } else {
          setError('Error fetching transactions');
        }
      }
    };
    fetchTransactions();
  }, []);

  // Function to generate PDF
  const handleDownloadPDF = (transaction: Transaction) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Transaction Receipt', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`User: ${transaction.username}`, 20, 40);
    doc.text(`Last Transaction: ${transaction.lasttransaction}`, 20, 50);
    doc.text(`Balance Deducted: ${transaction.balancededuct}`, 20, 60);
    doc.text(`Energy Consumption: ${transaction.energyconsumption}`, 20, 70);
    doc.text(`Location: ${transaction.location}`, 20, 80);
    doc.text(`Charging Time: ${transaction.chargingtime}`, 20, 90);
    doc.text(`Charger ID: ${transaction.chargerid}`, 20, 100);
    doc.text(`Wallet ID: ${transaction.walletid}`, 20, 110);
    
    // Save the PDF
    doc.save(`transaction_${transaction.uid}.pdf`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="container mx-auto p-4">
        <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">Transaction History</h2>

        {/* Home Icon and Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => history.push('/')} // Navigate to home on click
            className="flex items-center text-teal-500 hover:text-teal-600 transition duration-300 ease-in-out"
          >
            <FaHome className="mr-2" /> Home
          </button>
        </div>

        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white bg-opacity-80 backdrop-blur-xl border border-gray-300 rounded-md shadow-md">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="px-4 py-2 text-sm md:text-base">User</th>
                  <th className="px-4 py-2 text-sm md:text-base">Last Transaction</th>
                  <th className="px-4 py-2 text-sm md:text-base">Balance Deducted</th>
                  <th className="px-4 py-2 text-sm md:text-base">Energy Consumption</th>
                  <th className="px-4 py-2 text-sm md:text-base">Location</th>
                  <th className="px-4 py-2 text-sm md:text-base">Charging Time</th>
                  <th className="px-4 py-2 text-sm md:text-base">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.uid}
                    className="text-center hover:bg-teal-50 transition-all duration-200"
                  >
                    <td className="px-4 py-2 border-b text-gray-700">{transaction.username}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{transaction.lasttransaction}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{transaction.balancededuct}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{transaction.energyconsumption}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{transaction.location}</td>
                    <td className="px-4 py-2 border-b text-gray-700">{transaction.chargingtime}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDownloadPDF(transaction)}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs md:text-sm px-3 py-1 rounded-full shadow-md"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-700">No transaction history available for this user.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
