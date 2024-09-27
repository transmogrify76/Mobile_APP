import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch user profile details on component mount
  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
         
          const decodedToken: any = jwtDecode(token);
          const userId = decodedToken?.userId;

          // Call the backend API to fetch profile details
          const response = await axios.post(
            'http://localhost:3000/users/puprofile',
            { userid: userId },
            {
              headers: {
                'apiauthkey': 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
              },
            }
          );

          // Set the fetched data in state
          if (response.data) {
            const { firstname, phonenumber } = response.data.data; // Destructure from the response

            setUserData({
              name: firstname, // Use firstname for name
              email: response.data.data.email || '', // Email might need to be fetched in another way
              phone: phonenumber || '', // Use phonenumber for phone
            });

            setFormData({
              name: firstname,
              email: response.data.data.email || '', // Ensure the email is set
              phone: phonenumber || '',
            });

            setSuccessMessage('Profile details fetched successfully!');
          }
        } else {
          setErrorMessage('User is not logged in or token is missing.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrorMessage('Error fetching profile details.');
      }
    };

    fetchProfileDetails();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Update User Info)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Assuming there's an API for updating user profile
      await axios.post('http://localhost:3000/users/puprofile', formData); // Replace with your actual update API route

      // Simulate successful update
      setUserData(formData);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    }
  };

  // Enable edit mode
  const handleEditClick = () => {
    setEditMode(true);
  };

  // Cancel edit mode
  const handleCancelClick = () => {
    setFormData(userData);
    setEditMode(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full h-screen flex items-center justify-center">
        {/* Profile Card */}
        <div className="w-full max-w-md h-full bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col justify-center">
          
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <img
              src="https://via.placeholder.com/100"
              alt="Profile Avatar"
              className="h-24 w-24 rounded-full shadow-md"
            />
          </div>

          <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">User Profile</h2>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none ${editMode ? 'focus:ring-4 focus:ring-teal-300' : 'bg-gray-100 cursor-not-allowed'}`}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none ${editMode ? 'focus:ring-4 focus:ring-teal-300' : 'bg-gray-100 cursor-not-allowed'}`}
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none ${editMode ? 'focus:ring-4 focus:ring-teal-300' : 'bg-gray-100 cursor-not-allowed'}`}
              />
            </div>

            {editMode ? (
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="w-1/2 mr-2 bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 ease-in-out"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="w-1/2 ml-2 bg-gray-400 text-white font-bold py-3 rounded-full shadow-lg hover:bg-gray-500 transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 ease-in-out"
              >
                Edit Profile
              </button>
            )}
          </form>

          {/* Error and Success Messages */}
          {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
