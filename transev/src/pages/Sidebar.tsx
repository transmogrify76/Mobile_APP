import React from 'react';
import { IonIcon } from '@ionic/react';
import { person, bookmark, heart, car, time, call, logOut } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

// Define the props interface
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const history = useHistory(); // Use useHistory for navigation

  const handleNavigation = (path: string) => {
    history.push(path);
    toggleSidebar(); // Close the sidebar after navigation
  };

  const handleCall = () => {
    window.open('tel:8084281810'); // Make a call
  };

  return (
    <div className={`h-full bg-black text-white p-5 flex flex-col justify-between transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} absolute top-0 left-0 z-10`}>
      <div>
        <div className="text-center mb-6">
          <div className="bg-gray-600 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-2xl">C</span>
          </div>
          <h3 className="text-xl">Chitradeep Ghosh</h3>
          <p className="text-green-400 mt-1">₹ 0.00</p>
          <p className="text-gray-400 text-sm">Current Balance</p>
        </div>
        <div className="space-y-4">
          <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/host')}>
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
          <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={() => handleNavigation('/charging-history')}>
            <IonIcon icon={time} className="mr-3" /> Charging History
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <button className="flex items-center bg-blue-500 px-4 py-2 rounded-md w-full" onClick={handleCall}>
          <IonIcon icon={call} className="mr-3" /> Call Us
        </button>
        <button className="flex items-center bg-gray-600 px-4 py-2 rounded-md w-full" onClick={toggleSidebar}>
          <IonIcon icon={logOut} className="mr-3" /> Log Out
        </button>
        <p className="text-center text-gray-400">1.0.4v</p>
      </div>
    </div>
  );
};

export default Sidebar;
