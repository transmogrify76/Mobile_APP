import React, { useState, useEffect, ReactNode } from 'react';
import { FaSearch, FaFilter, FaHeart, FaWallet, FaUser, FaQrcode, FaBars, FaMapMarkerAlt, FaTimes } from 'react-icons/fa'; 
import { useHistory } from 'react-router-dom';
import Sidebar from './Sidebar';
import QRScannerComponent from './QRScanner'; 
import { jwtDecode } from 'jwt-decode'; 


interface Charger {
    uid: string;
    chargeridentity: string;
    id: string;
    image_url?: string;
    name: string;
    available: boolean;
    distance: number;
    timings: string;
    rate_fixed: number;
    rate_kwh: number;
    isFavorite?: boolean;
    googlemapslink?: string;
    hubinfo?: {
        hubtariff: string;
        hubname: string;
        hublocation: string;
    };
    twenty_four_seven_open_status?: string;
    full_address?: string;
}

const Dashboard = () => {
    const history = useHistory();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [chargers, setChargers] = useState<Charger[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);

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
                const response = await fetch('https://be.cms.ocpp.transev.site/admin/listofcharges', {
                    headers: {
                        apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    
                   
                    const mappedChargers = data.data.map((charger: any) => ({
                        uid: charger.uid,
                        chargeridentity: charger.chargeridentity,
                        id: charger.id,
                        name: charger.ChargerName,
                        image_url: charger.charger_image,
                        available: true, 
                        distance: Math.floor(Math.random() * 10) + 1, 
                        timings: charger.twenty_four_seven_open_status === 'yes' ? '24/7' : 'Specific hours',
                        rate_fixed: 0,
                        rate_kwh: charger.hubinfo ? parseFloat(charger.hubinfo.hubtariff) : 0,
                        googlemapslink: charger.googlemapslink,
                        hubinfo: charger.hubinfo,
                        full_address: charger.full_address,
                        twenty_four_seven_open_status: charger.twenty_four_seven_open_status,
                        isFavorite: false 
                    }));
                    
                    setChargers(mappedChargers);  
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

        
        event?.stopPropagation();

        try {
            const response = await fetch('https://be.cms.ocpp.transev.site/users/createfavorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru'
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
                        ch.uid === charger.uid ? { ...ch, isFavorite: !ch.isFavorite } : ch
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
            {/* Charger Details Popup */}
            {selectedCharger && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {selectedCharger.chargeridentity}
                            </h2>
                            <button 
                                onClick={() => setSelectedCharger(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="p-5">
                            <div className="flex items-center mb-4">
                                <span 
                                    className={`inline-block w-3 h-3 rounded-full mr-2 ${selectedCharger.available ? 'bg-green-500' : 'bg-red-500'}`}
                                ></span>
                                <span className={selectedCharger.available ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                    {selectedCharger.available ? 'Available Now' : 'Currently Unavailable'}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                <p className="flex items-center text-gray-600">
                                    <FaMapMarkerAlt className="mr-3 text-gray-400" />
                                    <span>Distance: ~{selectedCharger.distance} km</span>
                                </p>
                                
                                <p className="flex items-start text-gray-600">
                                    <span className="mr-3">⏱️</span>
                                    <span>Timings: {selectedCharger.timings}</span>
                                </p>
                                
                                <p className="flex items-start text-gray-600">
                                    <span className="mr-3">📍</span>
                                    <span>{selectedCharger.full_address || 'Address not available'}</span>
                                </p>
                                
                                <p className="flex items-start text-gray-600">
                                    <span className="mr-3">🏢</span>
                                    <span>Hub: {selectedCharger.hubinfo?.hubname || 'N/A'}</span>
                                </p>
                                
                                <p className="flex items-start text-gray-600">
                                    <span className="mr-3">💰</span>
                                    <span>Rate: ₹{selectedCharger.rate_kwh}/kWh</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-5 border-t">
                            <button
                                onClick={() => {
                                    if (selectedCharger.googlemapslink) {
                                        window.open(selectedCharger.googlemapslink, '_blank');
                                    }
                                }}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-300"
                            >
                                <FaMapMarkerAlt className="mr-3" />
                                Get Directions
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={toggleSidebar}></div>
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
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500">Loading chargers...</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        {chargers.map((charger) => (
                            <div 
                                key={charger.uid} 
                                className="flex items-center bg-white rounded-lg shadow-md p-4 mb-6 cursor-pointer hover:shadow-lg transition duration-300"
                                onClick={() => setSelectedCharger(charger)}
                            >
                                <img
                                    src={charger.image_url || 'https://transev.in/wp-content/uploads/elementor/thumbs/Asian-DC-24KW-qg3zamgu8te4ak3xj8wizdb96mbcsqdsr05l5u2qao.png'}
                                    alt={charger.name || 'Charger'}
                                    className="w-16 h-16 rounded-lg object-cover mr-4 shadow"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://transev.in/wp-content/uploads/elementor/thumbs/Asian-DC-24KW-qg3zamgu8te4ak3xj8wizdb96mbcsqdsr05l5u2qao.png';
                                    }}
                                />
                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800">{charger.chargeridentity}</h3>
                                    <p className={charger.available ? 'text-green-600 text-sm font-medium' : 'text-red-600 text-sm font-medium'}>
                                        {charger.available ? 'Available' : 'Not Available'}
                                    </p>
                                    <p className="text-gray-600 text-sm">Distance: ~{charger.distance} km</p>
                                    <p className="text-gray-600 text-sm">Timings: {charger.timings}</p>
                                    <p className="text-gray-600 text-sm">Rate: ₹{charger.rate_kwh}/kWh</p>
                                    <p className="text-gray-600 text-sm">Hub: {charger.hubinfo?.hubname || 'N/A'}</p>
                                </div>
                                <div
                                    className={`ml-auto p-2 flex items-center justify-center cursor-pointer hover:bg-red-100 transition ${charger.isFavorite ? 'text-red-500' : 'text-gray-500'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFavoriteToggle(charger);
                                    }}
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
                    <FaMapMarkerAlt className="text-2xl" style={{ color: '#8EAE3E' }} />
                    <p className="text-xs">Find Charger</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition" onClick={() => history.push('/wallet')}>
                    <FaWallet className="text-2xl" style={{ color: '#8EAE3E' }} />
                    <p className="text-xs">Wallet</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition" onClick={() => history.push('/userprofile')}>
                    <FaUser className="text-2xl" style={{ color: '#8EAE3E' }} />
                    <p className="text-xs">Profile</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition" onClick={toggleScanner}>
                    <FaQrcode className="text-2xl" style={{ color: '#8EAE3E' }} />
                    <p className="text-xs">QR Code</p>
                </div>
            </div>

            {isScannerOpen && (
                <QRScannerComponent onClose={toggleScanner} />
            )}
        </div>
    );
};

export default Dashboard; 