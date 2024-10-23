import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom'; // Import useHistory

const Login: React.FC = () => {
    const history = useHistory(); // Initialize useHistory hook
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState<string[]>(Array(6).fill('')); // 6 OTP inputs
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const apiUrl = 'https://transev.site/userauth/login'; // Replace with your API URL
        const payload = { email, password, otp: isOtpSent ? otp.join('') : undefined }; // Join OTP digits

        try {
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru"
                }
            });

            setMessage(response.data.message);

            if (response.status === 201) {
                setIsOtpSent(true); // If OTP is sent, prompt user for OTP input
            } else if (response.status === 200) {
                const { token } = response.data;
                localStorage.setItem('token', token); // Save the JWT token
                history.push('/dashboard'); // Redirect to the user dashboard
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
            } else {
                setMessage('An unexpected error occurred. Please try again.');
            }
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take the last character
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            nextInput?.focus();
        } else if (!value && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleOtpVerification = async () => {
        const apiUrl = 'https://transev.site/userauth/login'; // Use the same endpoint
        const payload = { email, password, otp: otp.join('') }; // Join OTP digits

        try {
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru"
                }
            });

            setMessage(response.data.message);

            if (response.status === 200) {
                const { token } = response.data;
                localStorage.setItem('token', token);
                history.push('/dashboard'); // Redirect to the user dashboard
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Invalid OTP or credentials. Please try again.');
            } else {
                setMessage('An unexpected error occurred. Please try again.');
            }
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

                    <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">Login</h2>
                    
                    {/* Login Form */}
                    <form onSubmit={handleLogin} noValidate className="space-y-4">
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
                                placeholder="Enter your password"
                            />
                        </div>

                        {isOtpSent && (
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
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 ease-in-out"
                            disabled={!email || !password || (isOtpSent && otp.some(d => !d))}
                        >
                            {isOtpSent ? 'Verify OTP' : 'Login'}
                        </button>
                    </form>

                    {/* Message Display */}
                    {message && <p className="text-red-500 text-center mt-4">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;
