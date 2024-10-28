import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useHistory } from 'react-router-dom';
import { FaHome } from 'react-icons/fa'; // Import the home icon from react-icons

interface Booking {
    uid: string;
    chargeruid: string;
    useruid: string;
    isbooked: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ChargerDetail {
    uid: string;
    // Add other charger properties as needed
}

const MyBookings: React.FC = () => {
    const history = useHistory();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [chargerDetails, setChargerDetails] = useState<ChargerDetail[]>([]);
    const [message, setMessage] = useState('');
    const [chargerUID, setChargerUID] = useState('');
    const [isBooked, setIsBooked] = useState(false);

    const fetchBookings = async () => {
        const apiUrl = 'https://transev.site/userauth/getlistofbookings';

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('User not authenticated.');
            return;
        }

        const decodedToken: { userid: string } = jwtDecode(token);
        const userId = decodedToken.userid;

        try {
            const response = await axios.post(apiUrl, { userid: userId }, {
                headers: {
                    'apiauthkey': process.env.REACT_APP_API_KEY // Your API Key
                }
            });

            setBookings(response.data.bookings);
            setChargerDetails(response.data.chargerDetails);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to fetch bookings.');
            } else {
                setMessage('An unexpected error occurred. Please try again.');
            }
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        const apiUrl = 'https://transev.site/userauth/chargerbookings';

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('User not authenticated.');
            return;
        }

        const decodedToken: { userid: string } = jwtDecode(token);
        const userId = decodedToken.userid;

        try {
            const response = await axios.post(apiUrl, {
                chargeruid: chargerUID,
                useruid: userId,
                isbooked: isBooked.toString(),
            }, {
                headers: {
                    'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru"
                }
            });

            setMessage(response.data.message);
            setChargerUID('');
            setIsBooked(false);
            await fetchBookings();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.message || 'Failed to create booking.');
            } else {
                setMessage('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
            <div className="w-full max-w-lg bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative">
                {/* Home Icon Button */}
                <button
                    onClick={() => history.push('/dashboard')}
                    className="absolute top-4 left-4 p-2 bg-teal-500 rounded-full shadow-md hover:bg-teal-600 transition duration-300"
                >
                    <FaHome className="text-white" />
                </button>

                <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">My Bookings</h2>

                {message && <p className="text-red-500 text-center mb-4">{message}</p>}

                {/* Create Booking Form */}
                <form onSubmit={handleCreateBooking} className="mb-6">
                    <div className="mb-4">
                        <label className="block text-teal-700 text-sm font-bold mb-2" htmlFor="chargerUID">
                            Charger UID
                        </label>
                        <input
                            type="text"
                            id="chargerUID"
                            value={chargerUID}
                            onChange={(e) => setChargerUID(e.target.value)}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-teal-700 text-sm font-bold mb-2" htmlFor="isBooked">
                            Is Booked
                        </label>
                        <select
                            id="isBooked"
                            value={isBooked ? 'true' : 'false'}
                            onChange={(e) => setIsBooked(e.target.value === 'true')}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-teal-500 text-white font-bold py-2 px-4 rounded-full hover:bg-teal-600 transition duration-300 ease-in-out"
                    >
                        Create Booking
                    </button>
                </form>

                {/* Display Bookings */}
                <div className="space-y-4">
                    {bookings.length > 0 ? (
                        bookings.map((booking) => {
                            const chargerDetail = chargerDetails.find(charger => charger.uid === booking.chargeruid);
                            return (
                                <div key={booking.uid} className="p-4 border border-gray-300 rounded-lg shadow-md">
                                    <h3 className="text-xl font-semibold">Charger ID: {booking.chargeruid}</h3>
                                    <p>User ID: {booking.useruid}</p>
                                    <p>Status: {booking.isbooked ? 'Booked' : 'Available'}</p>
                                    <p>Created At: {new Date(booking.createdAt).toLocaleString()}</p>
                                    <p>Updated At: {new Date(booking.updatedAt).toLocaleString()}</p>
                                    {chargerDetail && (
                                        <p>Charger Details: {/* Add specific charger details here */}</p>
                                    )}
                                    <button
                                        onClick={() => history.push(`/edit-booking/${booking.uid}`)}
                                        className="mt-2 bg-teal-500 text-white font-bold py-2 px-4 rounded-full hover:bg-teal-600 transition duration-300 ease-in-out"
                                    >
                                        Edit Booking
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-lg text-center">No bookings found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;
