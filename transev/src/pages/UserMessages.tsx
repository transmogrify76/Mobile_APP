import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Storage } from '@capacitor/storage';
import {jwtDecode} from 'jwt-decode';
import { useHistory } from 'react-router-dom';
interface DecodedToken {
  email: string;
}

const UserMessages: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>(''); // Store user email
  const [messages, setMessages] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
const history = useHistory();
const handleNavigation = (path: string) => {
    history.push(path);
   
};

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { value } = await Storage.get({ key: 'token' }); // Get token from storage
      if (value) {
        try {
          const decoded: DecodedToken = jwtDecode(value); // Decode the token
          setUserEmail(decoded.email); // Set the user email
        } catch (error) {
          console.error('Failed to decode token:', error);
          setErrorMessage('Failed to retrieve user email.'); // Handle decode error
        }
      } else {
        setErrorMessage('No token found.'); // Handle missing token
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.post('https://transev.site/admin/usspm', {
          useremail: userEmail,
        }, {
          headers: {
            'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
          },
        });
        setMessages(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data?.message || 'An error occurred while fetching messages.');
        } else {
          setErrorMessage('An error occurred while fetching messages.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserEmail().then(() => {
      if (userEmail) { // Fetch messages only if email is set
        fetchMessages();
      }
    });
  }, [userEmail]);

  // Function to handle the dispute raising action
  const handleRaiseDispute = () => {
    // You can implement a modal or navigation to a dispute form here
    alert("Raise a dispute functionality not implemented yet.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full max-w-lg bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">Your Messages</h2>

        {loading ? (
          <p className="text-gray-700 text-center">Loading messages...</p>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((message, index) => (
              <li key={index} className="p-4 border border-gray-300 rounded-lg bg-white shadow-md">
                <h3 className="font-semibold text-lg text-teal-800">{message.name}</h3>
                <p className="text-gray-500 text-sm">Message: {message.message}</p> {/* Show the message field */}
                <p className="text-gray-500 text-sm">Email: {message.email}</p>
                <p className="text-gray-500 text-sm">Phone: {message.phonenumber}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Raise a Dispute Button */}
        <div className="mt-6">
          <button 
            onClick={() => handleNavigation('/dispute')}
            className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 transition duration-200"
          >
            Raise a Dispute
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMessages;
