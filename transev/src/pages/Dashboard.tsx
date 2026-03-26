import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaFilter,
  FaHeart,
  FaWallet,
  FaUser,
  FaQrcode,
  FaBars,
  FaMapMarkerAlt,
  FaTimes,
  FaBolt,
  FaClock,
  FaPlug,
  FaBuilding,
} from 'react-icons/fa';
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
  total_capacity: string;
  charger_type: string;
}

const Dashboard = () => {
  const history = useHistory();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleScanner = () => setScannerOpen(!isScannerOpen);

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
            apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
          },
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
            isFavorite: false,
            total_capacity: charger.Total_Capacity,
            charger_type: charger.Chargertype,
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

  const handleFavoriteToggle = async (charger: Charger, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userid) {
      console.error('User ID not found');
      return;
    }
    try {
      const response = await fetch('https://be.cms.ocpp.transev.site/users/createfavorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
        },
        body: JSON.stringify({
          chargeruid: charger.uid,
          useruid: userid,
          isfavorite: !charger.isFavorite,
        }),
      });
      if (response.ok) {
        setChargers((prev) =>
          prev.map((ch) =>
            ch.uid === charger.uid ? { ...ch, isFavorite: !ch.isFavorite } : ch
          )
        );
      } else {
        console.error('Failed to update favorite');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const filteredChargers = chargers.filter((charger) =>
    charger.chargeridentity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-md p-4 flex">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={toggleSidebar} />
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} className="z-50" />
        </>
      )}

      {/* Header */}
      <div className="flex-none sticky top-0 z-20 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 transition">
            <FaBars className="text-gray-700 text-xl" />
          </button>
          <div className="relative flex-1 max-w-md mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition"
              placeholder="Search EV Chargers..."
            />
          </div>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <FaFilter className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* View Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 p-1 rounded-full shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-6 py-1.5 rounded-full text-sm font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Map View
              </button>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {viewMode === 'map' ? (
                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ height: '70vh' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.5341636237147!2d88.50827541536385!3d22.57175068517253!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a020afe3fa83dab%3A0xda5c16b563780319!2sShapoorji%20Pallonji%20Shukhobrishti%20Housing%20Complex!5e0!3m2!1sen!2sin!4v1718888888888!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Charger Map"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChargers.length === 0 ? (
                    <div className="text-center py-12">
                      <FaBolt className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500">No chargers found matching your search.</p>
                    </div>
                  ) : (
                    filteredChargers.map((charger) => (
                      <div
                        key={charger.uid}
                        onClick={() => setSelectedCharger(charger)}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100"
                      >
                        <div className="flex p-4">
                          <img
                            src={charger.image_url || 'https://transev.in/assets/DC04W-BZzo5Frn.png'}
                            alt={charger.name || 'Charger'}
                            className="w-20 h-20 rounded-lg object-cover mr-4 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://transev.in/assets/DC04W-BZzo5Frn.png';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-gray-800">{charger.chargeridentity}</h3>
                              <button
                                onClick={(e) => handleFavoriteToggle(charger, e)}
                                className="p-2 -mt-1 -mr-1"
                              >
                                <FaHeart
                                  className={`text-xl transition ${
                                    charger.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                                  }`}
                                />
                              </button>
                            </div>
                            <div className="flex items-center mt-1 mb-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                                  charger.available ? 'bg-green-500' : 'bg-red-500'
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  charger.available ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {charger.available ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="mr-1 text-gray-400 text-xs" />
                                <span>~{charger.distance} km</span>
                              </div>
                              <div className="flex items-center">
                                <FaBolt className="mr-1 text-gray-400 text-xs" />
                                <span>₹{charger.rate_kwh}/kWh</span>
                              </div>
                              <div className="flex items-center">
                                <FaPlug className="mr-1 text-gray-400 text-xs" />
                                <span>{charger.charger_type}</span>
                              </div>
                              <div className="flex items-center">
                                <FaClock className="mr-1 text-gray-400 text-xs" />
                                <span>{charger.timings}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation with teal color */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 py-2 px-4 flex justify-around shadow-lg z-10">
        <button
          onClick={() => history.push('/')}
          className="flex flex-col items-center transition group"
          style={{ color: '#0d9488' }}
        >
          <FaMapMarkerAlt className="text-xl" />
          <span className="text-xs mt-1">Find</span>
        </button>
        <button
          onClick={() => history.push('/wallet')}
          className="flex flex-col items-center transition group"
          style={{ color: '#0d9488' }}
        >
          <FaWallet className="text-xl" />
          <span className="text-xs mt-1">Wallet</span>
        </button>
        <button
          onClick={() => history.push('/userprofile')}
          className="flex flex-col items-center transition group"
          style={{ color: '#0d9488' }}
        >
          <FaUser className="text-xl" />
          <span className="text-xs mt-1">Profile</span>
        </button>
        <button
          onClick={toggleScanner}
          className="flex flex-col items-center transition group"
          style={{ color: '#0d9488' }}
        >
          <FaQrcode className="text-xl" />
          <span className="text-xs mt-1">QR Code</span>
        </button>
      </div>

      {/* Charger Details Modal */}
      {selectedCharger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-5 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{selectedCharger.chargeridentity}</h2>
              <button
                onClick={() => setSelectedCharger(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    selectedCharger.available ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span
                  className={`font-medium ${
                    selectedCharger.available ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {selectedCharger.available ? 'Available Now' : 'Currently Unavailable'}
                </span>
              </div>
              <div className="space-y-3">
                <InfoRow icon={<FaMapMarkerAlt />} label="Distance" value={`~${selectedCharger.distance} km`} />
                <InfoRow icon={<FaClock />} label="Timings" value={selectedCharger.timings} />
                <InfoRow icon={<FaBolt />} label="Capacity" value={selectedCharger.total_capacity} />
                <InfoRow icon={<FaPlug />} label="Type" value={selectedCharger.charger_type} />
                <InfoRow icon={<FaBuilding />} label="Hub" value={selectedCharger.hubinfo?.hubname || 'N/A'} />
                <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={selectedCharger.full_address || 'Address not available'} />
                <InfoRow icon={<FaBolt />} label="Rate" value={`₹${selectedCharger.rate_kwh}/kWh`} />
              </div>
            </div>
            <div className="border-t border-gray-100 p-5">
              <button
                onClick={() => {
                  if (selectedCharger.googlemapslink) {
                    window.open(selectedCharger.googlemapslink, '_blank');
                  }
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <FaMapMarkerAlt />
                <span>Get Directions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {isScannerOpen && <QRScannerComponent onClose={toggleScanner} />}
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 text-gray-600">
    <div className="mt-0.5">{icon}</div>
    <div>
      <span className="text-sm font-medium text-gray-500">{label}:</span>{' '}
      <span className="text-sm">{value}</span>
    </div>
  </div>
);

export default Dashboard;