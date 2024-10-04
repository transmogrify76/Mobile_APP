import React, { useState, useEffect, ReactNode } from 'react';
import { FaSearch, FaFilter, FaHeart, FaWallet, FaUser, FaQrcode, FaBars, FaMapMarkerAlt } from 'react-icons/fa'; 
import { useHistory } from 'react-router-dom'; // Change here
import Sidebar from './Sidebar';
import QRScannerComponent from './QRScanner'; 
import { jwtDecode } from 'jwt-decode'; 

// Define the Charger interface
interface Charger {
    uid: any;
    chargeridentity: ReactNode;
    id: string; 
    image_url?: string;
    name: string;
    available: boolean;
    distance: number; 
    timings: string; 
    rate_fixed: number;
    rate_kwh: number;
    isFavorite?: boolean; 
}

const Dashboard = () => {
    const history = useHistory(); // Use history instead of navigate
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [chargers, setChargers] = useState<Charger[]>([]);
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleScanner = () => {
        setScannerOpen(!isScannerOpen);
    };

    const getUserIdFromToken = (): string | null => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken: any = jwtDecode(token); 
                return decodedToken.userid; 
            } catch (error) {
                console.error('Error decoding token:', error);
                return null;
            }
        }
        return null;
    };

    const userid = getUserIdFromToken();

    useEffect(() => {
        const fetchChargerData = async () => {
            try {
                const response = await fetch('http://localhost:3000/admin/listofcharges', {
                    headers: {
                        apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setChargers(data.data);  
                } else {
                    console.error('Failed to fetch charger data');
                }
            } catch (error) {
                console.error('Error fetching charger data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChargerData();
    }, []);

    const handleFavoriteToggle = async (charger: Charger) => {
        if (!userid) {
            console.error('User ID not found in token');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users/createfavorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouro'
                },
                body: JSON.stringify({
                    chargeruid: charger.uid, 
                    useruid: userid, 
                    isfavorite: !charger.isFavorite 
                })
            });

            if (response.ok) {
                const data = await response.json();
                setChargers((prevChargers) => 
                    prevChargers.map((ch) => 
                        ch.id === charger.uid ? { ...ch, isFavorite: !ch.isFavorite } : ch
                    )
                );
            } else {
                console.error('Failed to update favorite status');
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    return (
        <div>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black opacity-50 z-5" onClick={toggleSidebar}></div>
            )}

            <div className="bg-white shadow-md">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="cursor-pointer" onClick={toggleSidebar}>
                        <FaBars className="text-gray-600 text-xl" />
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-md">
                        <FaSearch className="text-gray-500 text-lg mr-2" />
                        <input
                            type="text"
                            className="w-full bg-transparent focus:outline-none text-gray-700"
                            placeholder="Search EV Chargers nearby..."
                        />
                    </div>
                    <div className="ml-4 bg-gray-200 rounded-full shadow-lg p-3 cursor-pointer hover:bg-gray-300 transition">
                        <FaFilter className="text-gray-600" />
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 bg-gray-50">
                <div className="flex justify-center my-4">
                    <div className="mx-2 bg-blue-600 text-white rounded-full px-6 py-1 shadow-md text-center cursor-pointer">List View</div>
                    <div className="mx-2 bg-gray-200 text-black rounded-full border border-gray-300 px-6 py-1 shadow-md text-center cursor-pointer">Map View</div>
                </div>

                {loading ? (
                    <p>Loading chargers...</p>
                ) : (
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        {chargers.map((charger) => (
                            <div key={charger.uid} className="flex items-center bg-white rounded-lg shadow-md p-4 mb-6">
                                <img
                                    src={charger.image_url || 'default_image_placeholder.jpg'}
                                    alt="Charger"
                                    className="w-16 h-16 rounded-lg object-cover mr-4 shadow"
                                />
                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800">{charger.chargeridentity}</h3>
                                    <p className={charger.available ? 'text-green-600 text-sm font-medium' : 'text-red-600 text-sm font-medium'}>
                                        {charger.available ? 'Available' : 'Not Available'}
                                    </p>
                                    <p className="text-gray-600 text-sm">Distance: ~{charger.distance} km</p>
                                    <p className="text-gray-600 text-sm">Timings: {charger.timings}</p>
                                    <p className="text-gray-600 text-sm">Rate: ₹{charger.rate_fixed} fixed, ₹{charger.rate_kwh}/kWh</p>
                                </div>
                                <div
                                    className={`ml-auto p-2 flex items-center justify-center cursor-pointer hover:bg-red-100 transition ${charger.isFavorite ? 'text-red-500' : 'text-gray-500'}`}
                                    onClick={() => handleFavoriteToggle(charger)}
                                >
                                    <FaHeart className="text-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-3 flex justify-around shadow-lg">
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition">
                    <FaMapMarkerAlt className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">Find Charger</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition" onClick={() => history.push('/wallet')}>
                    <FaWallet className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">Wallet</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition" onClick={() => history.push('/userprofile')}>
                    <FaUser className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">Profile</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition" onClick={toggleScanner}>
                    <FaQrcode className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">QR Scan</p>
                </div>
            </div>

            {isScannerOpen && <QRScannerComponent onClose={toggleScanner} />}
        </div>
    );
};

export default Dashboard;
