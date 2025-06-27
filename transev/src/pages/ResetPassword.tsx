import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom'; 

const ResetPassword: React.FC = () => {
  const history = useHistory(); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill('')); 
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); 
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

    
  const handleOtpRequest = async () => {
    if (!email) {
      setMessage('Please enter your email');
      return;
    }
          
    try {
      setIsLoading(true);
      const response = await axios.post('https://be.cms.ocpp.transev.site/userauth/userpasswordreset', { email }, {
        headers: { 'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru" }
      });

      if (response.status === 201) {
        setMessage('OTP has been sent to your email.');
        setStep(2); // Move to Step 2: OTP Verification and Password Reset
      }
    } catch (error) {
      const err = error as Error;  // Type assertion to `Error`
      console.error(err.message);
      setMessage('Failed to send OTP. Please try again.'); // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async () => {
    if (otp.some(digit => !digit) || !newPassword) {
      setMessage('Please complete the OTP and new password.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('https://be.cms.ocpp.transev.site/userauth/userpasswordreset', {
        email,
        otp: otp.join(''),
        newPassword
      }, {
        headers: { 'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru" }
      });

      if (response.status === 200) {
        setMessage('Password reset successfully. You can now log in.');
        // Navigate to the login page
        setTimeout(() => {
          history.push('/login'); // Redirect after a short delay
        }, 2000); // Wait 2 seconds before redirecting
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      const err = error as Error;  // Type assertion to `Error`
      console.error(err.message);
      setMessage('Failed to reset password. Please try again.'); // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Allow only one digit per input
    setOtp(newOtp);

    // Automatically move to the next input if available
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    } else if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full max-w-md bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-teal-800 mb-6">Reset Password</h2>
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}
        {step === 1 ? (
          <>
            {/* Request OTP */}
            <div>
              <label className="block text-lg font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                placeholder="Enter your email"
              />
            </div>
            <button
              className="w-full mt-6 bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 ease-in-out"
              onClick={handleOtpRequest}
              disabled={isLoading}
            >
              {isLoading ? 'Sending OTP...' : 'Request OTP'}
            </button>
          </>
        ) : (
          <>
            {/* Verify OTP and Reset Password */}
            <div className="mb-6 flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={e => handleOtpChange(e.target.value, index)}
                  maxLength={1}
                  className="w-12 h-12 p-2 text-center text-xl font-bold text-gray-800 bg-white border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                />
              ))}
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                placeholder="Enter new password"
              />
            </div>
            <button
              className="w-full mt-6 bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 ease-in-out"
              onClick={handlePasswordReset}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
