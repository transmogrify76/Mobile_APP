import React from 'react';
import { IonIcon } from '@ionic/react';
import { person, bookmark, heart, car, time, call, logOut } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  className?: string; 
}

interface DecodedToken {
  username: string;
  email: string;
  userid: string;
  userType: string;
  adminuid: string;
  iat: number;
  exp: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const history = useHistory();
  const token = localStorage.getItem('token');
  let username = '';

  if (token) {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      username = decodedToken.username;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  const handleNavigation = (path: string) => {
    history.push(path);
    toggleSidebar();
  };

  const handleCall = () => {
    window.open('tel:8084281810');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  return (
    <>
      {/* Fixed: Added higher z-index and fixed positioning */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="text-center mb-6">
            <div className="bg-gray-600 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white text-2xl">C</span>
            </div>
            <h3 className="text-xl">{username || 'Guest'}</h3>
            <p className="text-green-400 mt-1">₹ 0.00</p>
            <p className="text-gray-400 text-sm">Current Balance</p>
          </div>
          <div className="space-y-4">
            <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/login')}>
              <IonIcon icon={person} className="mr-3" /> I am Host
            </button>
            <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/bookings')}>
              <IonIcon icon={bookmark} className="mr-3" /> My Bookings
            </button>
            <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/favourites')}>
              <IonIcon icon={heart} className="mr-3" /> Favorites
            </button>
            <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/add-vehicle')}>
              <IonIcon icon={car} className="mr-3" /> My Vehicles
            </button>
            <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/transaction')}>
              <IonIcon icon={time} className="mr-3" /> Transaction History
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/help')}>
            <IonIcon icon={call} className="mr-3" /> Help & Support
          </button>
          <button className="flex items-center bg-gray-600 px-4 py-2 rounded-md w-full" onClick={handleLogout}>
            <IonIcon icon={logOut} className="mr-3" /> Log Out
          </button>
          <p className="text-center text-gray-400">1.0.4v</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;