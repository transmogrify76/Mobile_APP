import React from 'react';
import { IonIcon } from '@ionic/react';
import { person, bookmark, heart, car, time, call, logOut } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Import jwtDecode

// Define the props interface
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const history = useHistory(); // Use useHistory for navigation
  const token = localStorage.getItem('token'); // Get the token from localStorage
  let username = ''; // Initialize username

  // Decode the token to get the username
  if (token) {
    try {
      const decodedToken: DecodedToken = jwtDecode(token); // Decode the token
      username = decodedToken.username; // Extract username
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  const handleNavigation = (path: string) => {
    history.push(path);
    toggleSidebar(); // Close the sidebar after navigation
  };

  const handleCall = () => {
    window.open('tel:8084281810'); // Make a call
  };

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    localStorage.removeItem('token'); // Remove the token from local storage
    // Add any other cleanup logic if necessary (e.g., clearing user data)

    // Redirect to the login page
    history.push('/login'); // Adjust the path as per your routing structure
  };

  return (
    <div className={`h-full bg-black text-white p-5 flex flex-col justify-between transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} absolute top-0 left-0 z-10`}>
      <div>
        <div className="text-center mb-6">
          <div className="bg-gray-600 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-2xl">C</span>
          </div>
          <h3 className="text-xl">{username || 'Guest'}</h3> {/* Display username or 'Guest' */}
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
  );
};

export default Sidebar;
