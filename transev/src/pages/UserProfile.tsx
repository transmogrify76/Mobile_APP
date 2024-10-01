import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserData {
  name: string;
  email: string;
  phone: string | null; // null allowed since phone number can be null
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserData>(userData);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorMessage('User is not logged in or token is missing.');
          return;
        }

        const userId = JSON.parse(atob(token.split('.')[1])).userid; // Assuming userid is in the payload of the token

        const response = await axios.post(
          'http://localhost:3000/users/puprofile',
          { userid: userId },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apiauthkey': 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
            },
          }
        );

        if (response.data && response.data.data) {
          const { username, phonenumber, email } = response.data.data;
          setUserData({
            name: username || '', // Map username to name
            email: email || '',
            phone: phonenumber || null, // Map phonenumber to phone
          });
          setFormData({
            name: username || '',
            email: email || '',
            phone: phonenumber || null,
          });
          setSuccessMessage('Profile details fetched successfully!');
        } else {
          throw new Error('Invalid response structure.');
        }
      } catch (error: unknown) {
        console.error('Error fetching profile:', error);
        if (error instanceof Error) {
          setErrorMessage('Error fetching profile details. ' + error.message);
        } else {
          setErrorMessage('Error fetching profile details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/users/puprofile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUserData(formData);
        setEditMode(false);
        setSuccessMessage('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile.');
      }
    } catch (error: unknown) {
      console.error('Failed to update profile:', error);
      if (error instanceof Error) {
        setErrorMessage('Failed to update profile. ' + error.message);
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setFormData(userData);
    setEditMode(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full max-w-md h-full bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col justify-center">
          <div className="flex justify-center mb-6">
            <img
              src="https://via.placeholder.com/100"
              alt="Profile Avatar"
              className="h-24 w-24 rounded-full shadow-md"
            />
          </div>

          <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">User Profile</h2>

          {loading ? (
            <p className="text-teal-500 text-center">Loading...</p>
          ) : (
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
                  value={formData.phone || ''}
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
          )}

          {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;