import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const DisputeForm: React.FC = () => {
  const history = useHistory();
  const [customerName, setCustomerName] = useState<string>('');
  const [relatedToEv, setRelatedToEv] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [moreThanOneCharge, setMoreThanOneCharge] = useState<boolean>(false);
  const [wrongCharged, setWrongCharged] = useState<boolean>(false);
  const [didNotReceiveRefund, setDidNotReceiveRefund] = useState<boolean>(false);
  const [paidForOtherMeans, setPaidForOtherMeans] = useState<boolean>(false);
  const [disputeTransaction, setDisputeTransaction] = useState<string>('');
  const [chargedRegularly, setChargedRegularly] = useState<boolean>(false);
  const [notListedAbove, setNotListedAbove] = useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] = useState<string>('');
  const [disputeDetails, setDisputeDetails] = useState<string>('');
  const [associatedAdminId, setAssociatedAdminId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post('https://transev.site/admin/dspf', {
        customername: customerName,
        relatedtoev: relatedToEv,
        reason,
        morethanonecharge: moreThanOneCharge,
        wrongcharged: wrongCharged,
        didnotreceiverefund: didNotReceiveRefund,
        paidforothermeans: paidForOtherMeans,
        disputtransaction: disputeTransaction,
        chargedregularly: chargedRegularly,
        notlistedabove: notListedAbove,
        transactiondetails: transactionDetails,
        disputedetails: disputeDetails,
        associatedadminid: associatedAdminId,
        userid: userId,
      }, {
        headers: {
          'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
        },
      });

      setSuccessMessage(response.data.message);
      // Clear form fields
      setCustomerName('');
      setRelatedToEv('');
      setReason('');
      setMoreThanOneCharge(false);
      setWrongCharged(false);
      setDidNotReceiveRefund(false);
      setPaidForOtherMeans(false);
      setDisputeTransaction('');
      setChargedRegularly(false);
      setNotListedAbove(false);
      setTransactionDetails('');
      setDisputeDetails('');
      setAssociatedAdminId('');
      setUserId('');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full max-w-md bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 h-[100vh] overflow-y-auto">
        <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">Dispute Form</h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Customer Name Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Enter your name"
            />
          </div>

          {/* Related To EV Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Related to EV</label>
            <input
              type="text"
              value={relatedToEv}
              onChange={e => setRelatedToEv(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Enter related EV"
            />
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Enter the reason for dispute"
            />
          </div>

          {/* More than one charge Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={moreThanOneCharge}
              onChange={e => setMoreThanOneCharge(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg font-medium text-gray-700">More than one charge?</label>
          </div>

          {/* Wrong Charged Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={wrongCharged}
              onChange={e => setWrongCharged(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg font-medium text-gray-700">Wrong charged?</label>
          </div>

          {/* Did Not Receive Refund Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={didNotReceiveRefund}
              onChange={e => setDidNotReceiveRefund(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg font-medium text-gray-700">Did not receive refund?</label>
          </div>

          {/* Paid for Other Means Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={paidForOtherMeans}
              onChange={e => setPaidForOtherMeans(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg font-medium text-gray-700">Paid for other means?</label>
          </div>

          {/* Dispute Transaction Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Dispute Transaction</label>
            <input
              type="text"
              value={disputeTransaction}
              onChange={e => setDisputeTransaction(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Enter dispute transaction details"
            />
          </div>

          {/* Charged Regularly Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={chargedRegularly}
              onChange={e => setChargedRegularly(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg font-medium text-gray-700">Charged regularly?</label>
          </div>

          {/* Not Listed Above Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={notListedAbove}
              onChange={e => setNotListedAbove(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg font-medium text-gray-700">Not listed above?</label>
          </div>

          {/* Transaction Details Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Transaction Details</label>
            <textarea
              value={transactionDetails}
              onChange={e => setTransactionDetails(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Provide transaction details"
              rows={4}
            />
          </div>

          {/* Dispute Details Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Dispute Details</label>
            <textarea
              value={disputeDetails}
              onChange={e => setDisputeDetails(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Provide additional details regarding the dispute"
              rows={4}
            />
          </div>

          {/* Associated Admin ID Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">Associated Admin ID</label>
            <input
              type="text"
              value={associatedAdminId}
              onChange={e => setAssociatedAdminId(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Enter associated admin ID"
            />
          </div>

          {/* User ID Input */}
          <div>
            <label className="block text-lg font-medium text-gray-700">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
              className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
              placeholder="Enter your user ID"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 p-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Submit Dispute
          </button>

          {/* Success and Error Messages */}
          {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default DisputeForm;
