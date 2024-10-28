import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IonIcon } from '@ionic/react'; // Import IonIcon for the home icon
import { home } from 'ionicons/icons'; // Import the home icon
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation

interface UserData {
  name: string;
  email: string;
  phone: string | null; // null allowed since phone number can be null
  profilePicture?: string | null; // Added profile picture field
}

const UserProfile: React.FC = () => {
  const history = useHistory(); // Initialize useHistory
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    profilePicture: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserData>(userData);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null); // State to hold the uploaded file

  useEffect(() => {
    const fetchProfileDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorMessage('User is not logged in or token is missing.');
          return;
        }

        const userid = JSON.parse(atob(token.split('.')[1])).userid; // Assuming userid is in the payload of the token

        const response = await axios.post(
          'https://transev.site/users/puprofile',
          { userid: userid },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apiauthkey': 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
            },
          }
        );

        if (response.data && response.data.data) {
          const { username, phonenumber, email, profilepicture } = response.data.data;
          const { pfimage } = response.data; // Get pfimage from the response

          setUserData({
            name: username || '', // Map username to name
            email: email || '',
            phone: phonenumber || null, // Map phonenumber to phone
            profilePicture: pfimage || null, // Map pfimage to profile picture
          });
          setFormData({
            name: username || '',
            email: email || '',
            phone: phonenumber || null,
            profilePicture: pfimage || null, // Map pfimage to form data
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
  
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('User is not logged in or token is missing.');
      return;
    }
  
    // Extract user ID from the token
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userid = decodedToken.userid; // Assuming userid is in the payload of the token
    console.log('User ID:', userid); // Log the extracted user ID
  
    // Check if userid is defined
    if (!userid) {
      setErrorMessage('User ID is undefined.');
      return;
    }
  
    // Create the payload object
    const payload = {
      uid: userid,
      username: formData.name,
      email: formData.email,
      phonenumber: formData.phone || '',
      userprofilepicture: file ? await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }) : null, // Convert file to base64 if it exists
    };
  
    try {
      console.log('Submitting form data:', payload); // Log form data
      const response = await axios.post('https://transev.site/users/updateprofile', JSON.stringify(payload), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', // Set content type to application/json
          'apiauthkey': 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
        },
      });
  
      if (response.data) {
        // Update local state with the response data
        setUserData((prevState) => ({
          ...prevState,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profilePicture: file ? URL.createObjectURL(file) : prevState.profilePicture,
        }));
        setEditMode(false);
        setSuccessMessage('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile.');
      }
    } catch (error) {
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
    setFile(null); // Reset file input
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full max-w-md h-full bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col justify-center relative">
          {/* Home Icon Button */}
          <button
            className="absolute top-4 left-4 p-2 rounded-full bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition duration-300"
            onClick={() => history.push('/dashboard')}
          >
            <IonIcon icon={home} />
          </button>

          <div className="flex justify-center mb-6">
            <img
              src={userData.profilePicture || 'https://via.placeholder.com/100'}
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

              <div>
                <label className="block text-lg font-medium text-gray-700">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!editMode}
                  className={`mt-2 block w-full text-sm text-gray-500 cursor-pointer ${editMode ? '' : 'bg-gray-100 cursor-not-allowed'}`}
                />
              </div>

              {successMessage && <p className="text-green-600">{successMessage}</p>}
              {errorMessage && <p className="text-red-600">{errorMessage}</p>}

              <div className="flex justify-between">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition duration-300"
                    >
                      Update
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition duration-300"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
