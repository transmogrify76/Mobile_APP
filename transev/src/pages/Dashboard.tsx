import React, { useState } from 'react';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaWallet, FaUser, FaQrcode, FaBars } from 'react-icons/fa';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import Sidebar from './Sidebar';
import QRScannerComponent from './QRScanner'; 

const Dashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isScannerOpen, setScannerOpen] = useState(false); 

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleScanner = () => {
        setScannerOpen(!isScannerOpen);
    };

    return (
        <IonPage>
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Overlay for the sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black opacity-50 z-5" onClick={toggleSidebar}></div>
            )}

            {/* Header */}
            <IonHeader className="bg-white shadow-md">
                <IonToolbar>
                    <div className="flex items-center justify-between px-4 py-2">
                        {/* Hamburger Menu Icon */}
                        <div className="cursor-pointer" onClick={toggleSidebar}>
                            <FaBars className="text-gray-600 text-xl" />
                        </div>

                        {/* Search Bar with Icon */}
                        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-md">
                            <FaSearch className="text-gray-500 text-lg mr-2" />
                            <input
                                type="text"
                                className="w-full bg-transparent focus:outline-none text-gray-700"
                                placeholder="Search EV Chargers nearby..."
                            />
                        </div>

                        {/* Filter Icon with Added Padding */}
                        <div className="ml-4 bg-gray-200 rounded-full shadow-lg p-3 cursor-pointer hover:bg-gray-300 transition"> {/* Increased padding here */}
                            <FaFilter className="text-gray-600" />
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>

            {/* Main Content */}
            <IonContent className="px-4 py-2 bg-gray-50">
                {/* Toggle Buttons for Map/List View */}
                <div className="flex justify-center my-4">
                    <div className="mx-2 bg-blue-600 text-white rounded-full px-6 py-1 shadow-md text-center cursor-pointer">Map View</div>
                    <div className="mx-2 bg-gray-200 text-black rounded-full border border-gray-300 px-6 py-1 shadow-md text-center cursor-pointer">List View</div>
                </div>

                {/* Map Placeholder */}
                <div className="h-72 bg-gray-300 rounded-lg shadow-lg mb-4 flex items-center justify-center">
                    <p className="text-center text-gray-500">Map Placeholder</p>
                </div>

                {/* Charger Info Card */}
                <div className="flex items-center bg-white rounded-lg shadow-md p-4 mb-6">
                    <img
                        src="charger_image_placeholder.jpg"
                        alt="Charger"
                        className="w-16 h-16 rounded-lg object-cover mr-4 shadow"
                    />
                    <div className="flex flex-col flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800">Transmogrify 1st</h3>
                        <p className="text-green-600 text-sm font-medium">Available</p>
                        <p className="text-gray-600 text-sm">Distance: ~0.02 km</p>
                        <p className="text-gray-600 text-sm">Timings: Open 24/7</p>
                        <p className="text-gray-600 text-sm">Rate: ₹1 fixed, ₹5/kWh</p>
                    </div>
                    <div className="ml-auto bg-white text-green-500 rounded-full border border-green-500 shadow-md p-2 flex items-center justify-center cursor-pointer hover:bg-green-100 transition" onClick={toggleScanner}>
                        <FaMapMarkerAlt className="text-xl" />
                    </div>
                </div>
            </IonContent>

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
        </IonPage>
    );
};

export default Dashboard;
