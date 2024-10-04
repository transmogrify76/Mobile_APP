import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Define the token structure interface
interface DecodedToken {
    username: string;
    email: string;
    userid: string;
    userType: string;
    adminuid: string;
    iat: number;
    exp: number;
}

const FavoriteChargers: React.FC = () => {
    const [favoriteChargers, setFavoriteChargers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Function to decode the token and get the user ID
    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

        if (token) {
            try {
                const decodedToken: DecodedToken = jwtDecode(token);
                return decodedToken.userid; // Extract userid from the decoded token
            } catch (error) {
                console.error('Error decoding token:', error);
                return null;
            }
        }

        return null;
    };

    useEffect(() => {
        const fetchFavoriteChargers = async () => {
            const userId = getUserIdFromToken(); // Get the userid from the token

            if (!userId) {
                setError('User ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.post(
                    'https://evchargercmsbackend-ttnm.onrender.com/users/loffchargers',
                    { userid: userId },
                    {
                        headers: {
                            'apiauthkey': 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru', // Use the correct API key
                        },
                    }
                );

                if (response.status === 200) {
                    setFavoriteChargers(response.data.chargerdata); // Assuming charger details are in chargerdata
                } else {
                    setError('No favorite chargers found.');
                }
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'Error fetching favorite chargers.');
                } else {
                    setError('An unexpected error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteChargers();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
            <div className="container mx-auto p-4">
                <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">My Favorite Chargers</h2>

                {loading ? (
                    <p>Loading favorite chargers...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <ul className="space-y-4">
                        {favoriteChargers.length > 0 ? (
                            favoriteChargers.map((charger, index) => (
                                <li key={index} className="bg-white bg-opacity-80 backdrop-blur-xl p-4 shadow-md rounded-3xl">
                                    <h3 className="text-gray-700"><strong>Charger ID:</strong> {charger.uid}</h3>
                                    <p className="text-gray-700"><strong>Charger Location:</strong> {charger.full_address}</p>
                                    <p className="text-gray-700"><strong>Added On:</strong> {new Date(charger.createdAt).toLocaleDateString()}</p>
                                </li>
                            ))
                        ) : (
                            <p className="text-center">No favorite chargers added yet.</p>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FavoriteChargers;
