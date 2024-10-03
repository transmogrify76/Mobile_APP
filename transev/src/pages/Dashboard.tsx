import React, { useState, useEffect, ReactNode } from 'react';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaWallet, FaUser, FaQrcode, FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import QRScannerComponent from './QRScanner'; 

// Define the Charger interface
interface Charger {
    chargeridentity: ReactNode;
    id: string; // or number depending on your API
    image_url?: string;
    name: string;
    available: boolean;
    distance: number; // Assuming distance is in km
    timings: string; // You can adjust the type as necessary
    rate_fixed: number;
    rate_kwh: number;
}

const Dashboard = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [chargers, setChargers] = useState<Charger[]>([]);  // State to hold charger data
    const [loading, setLoading] = useState(true);  // Loading state

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleScanner = () => {
        setScannerOpen(!isScannerOpen);
    };

    // Fetch charger data from the API
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
                    setChargers(data.data);  // Update state with fetched data
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

    return (
        <div>
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Overlay for the sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black opacity-50 z-5" onClick={toggleSidebar}></div>
            )}

            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="flex items-center justify-between px-4 py-2">
                    {/* Hamburger Menu Icon */}
                    <div className="cursor-pointer" onClick={toggleSidebar}>
                        <FaBars className="text-gray-600 text-xl" />
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-md">
                        <FaSearch className="text-gray-500 text-lg mr-2" />
                        <input
                            type="text"
                            className="w-full bg-transparent focus:outline-none text-gray-700"
                            placeholder="Search EV Chargers nearby..."
                        />
                    </div>

                    {/* Filter Icon */}
                    <div className="ml-4 bg-gray-200 rounded-full shadow-lg p-3 cursor-pointer hover:bg-gray-300 transition">
                        <FaFilter className="text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-2 bg-gray-50">
    {/* Map/List View Toggle */}
    <div className="flex justify-center my-4">
        <div className="mx-2 bg-blue-600 text-white rounded-full px-6 py-1 shadow-md text-center cursor-pointer">List View</div>
        <div className="mx-2 bg-gray-200 text-black rounded-full border border-gray-300 px-6 py-1 shadow-md text-center cursor-pointer">Map View</div>
    </div>

    {/* Loading State */}
    {loading ? (
        <p>Loading chargers...</p>
    ) : (
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}> {/* Set maxHeight as needed */}
            {chargers.map((charger) => (
                <div key={charger.id} className="flex items-center bg-white rounded-lg shadow-md p-4 mb-6">
                    <img
                        src={charger.image_url || 'default_image_placeholder.jpg'}  // Adjust the image URL based on the API response
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
                    <div className="ml-auto bg-white text-green-500 rounded-full border border-green-500 shadow-md p-2 flex items-center justify-center cursor-pointer hover:bg-green-100 transition" onClick={toggleScanner}>
                        <FaMapMarkerAlt className="text-xl" />
                    </div>
                </div>
            ))}
        </div>
    )}
</div>


            {/* Bottom Navigation */}
            <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-3 flex justify-around shadow-lg">
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition">
                    <FaMapMarkerAlt className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">Map</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition" onClick={toggleScanner}>
                    <FaQrcode className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">Scan</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition">
                    <FaWallet className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">Wallet</p>
                </div>
                <div className="flex flex-col items-center p-1 cursor-pointer hover:bg-gray-100 transition">
                    <FaUser className="text-2xl" style={{ color: '#2E8B57' }} />
                    <p className="text-xs">Profile</p>
                </div>
            </div>

            {/* QR Scanner Popup */}
            {isScannerOpen && <QRScannerComponent onClose={toggleScanner} />}
        </div>
    );
};

export default Dashboard;
