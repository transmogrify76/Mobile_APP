import React, { useState } from 'react';
import { signupUser } from '../services/api';
import axios from 'axios';

const Signup: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!isOtpSent) {
        const result = await signupUser(username, email, password);
        setSuccessMessage(result.message);
        setIsOtpSent(true);
      } else {
        const otpString = otp.join('');
        const result = await signupUser('', email, '', otpString);
        setSuccessMessage(result.message);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message as string || 'Something went wrong!');
      } else {
        setErrorMessage('Something went wrong!');
      }
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full h-screen flex items-center justify-center">
        {/* Form Container */}
        <div className="w-full max-w-md h-full bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col justify-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="https://transev.in/wp-content/uploads/2023/07/logo-160x57.png"
              alt="Logo"
              className="h-14 w-auto"
            />
          </div>

          <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">Sign Up</h2>
          
          {/* Signup Form */}
          <form onSubmit={handleSignup} noValidate className="space-y-4">
            {!isOtpSent && (
              <>
                {/* Username Input */}
                <div>
                  <label className="block text-lg font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                    placeholder="Enter your username"
                  />
                </div>

                {/* Email Input */}
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

                {/* Password Input */}
                <div>
                  <label className="block text-lg font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                    placeholder="Create a password"
                  />
                </div>
              </>
            )}

            {isOtpSent && (
              <div className="mb-6 flex justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value.slice(-1), index)}
                    maxLength={1}
                    className="w-12 h-12 p-2 text-center text-xl font-bold text-gray-800 bg-white border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                  />
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 ease-in-out"
              disabled={!isOtpSent ? !username || !email || !password : otp.some(d => !d)}
            >
              {isOtpSent ? 'Verify OTP' : 'Send OTP'}
            </button>
          </form>

          {/* Error and Success Messages */}
          {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-700">
              Already have an account?{' '}
              <a href="/login" className="text-teal-600 font-bold hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
