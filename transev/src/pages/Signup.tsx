import React, { useState } from 'react';
import { signupUser } from '../services/api';
import axios from 'axios';

const Signup: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSignup = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await signupUser(username, email, password);
      setSuccessMessage(result.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message as string || 'Something went wrong!');
      } else {
        setErrorMessage('Something went wrong!');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Sign Up</h2>
        
        <form onSubmit={e => { e.preventDefault(); handleSignup(); }} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-red-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white rounded-md py-2 hover:bg-red-700 transition duration-200"
            disabled={!username || !email || !password}
          >
            Sign Up
          </button>
        </form>

        {errorMessage && <p className="text-red-600 text-center mt-2">{errorMessage}</p>}
        {successMessage && <p className="text-green-600 text-center mt-2">{successMessage}</p>}

        <div className="mt-4 text-center">
          <p className="text-gray-600">Already have an account? <a href="/login" className="text-red-600 hover:underline">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
