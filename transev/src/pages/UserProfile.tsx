import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { FaHome, FaUserEdit, FaCamera, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

interface UserData {
  name: string;
  email: string;
  phone: string | null;
  profilePicture?: string | null;
}

const UserProfile: React.FC = () => {
  const history = useHistory();
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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch profile details on mount
  useEffect(() => {
    const fetchProfileDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorMessage('User is not logged in.');
          return;
        }
        const decoded: any = jwtDecode(token);
        const userid = decoded.userid;

        const response = await axios.post(
          'https://be.cms.ocpp.transev.site/users/puprofile',
          { userid },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
            },
          }
        );

        if (response.data?.data) {
          const { username, phonenumber, email, profilepicture } = response.data.data;
          const { pfimage } = response.data;
          setUserData({
            name: username || '',
            email: email || '',
            phone: phonenumber || null,
            profilePicture: pfimage || null,
          });
          setFormData({
            name: username || '',
            email: email || '',
            phone: phonenumber || null,
            profilePicture: pfimage || null,
          });
          setSuccessMessage('Profile loaded successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setErrorMessage(error.message || 'Failed to load profile.');
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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('User not authenticated.');
      setIsSubmitting(false);
      return;
    }

    const decoded: any = jwtDecode(token);
    const userid = decoded.userid;
    if (!userid) {
      setErrorMessage('User ID not found.');
      setIsSubmitting(false);
      return;
    }

    // Convert image to base64 if selected
    let profilePictureBase64 = null;
    if (file) {
      try {
        const reader = new FileReader();
        profilePictureBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.error('Error converting image:', err);
        setErrorMessage('Failed to process image.');
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      uid: userid,
      username: formData.name,
      email: formData.email,
      phonenumber: formData.phone || '',
      userprofilepicture: profilePictureBase64,
    };

    try {
      const response = await axios.post(
        'https://be.cms.ocpp.transev.site/users/updateprofile',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru',
          },
        }
      );

      if (response.data) {
        // Update local state
        setUserData({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profilePicture: profilePictureBase64 || userData.profilePicture,
        });
        setEditMode(false);
        setFile(null);
        setPreviewUrl(null);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Update failed.');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setFormData(userData);
    setPreviewUrl(null);
    setFile(null);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setFormData(userData);
    setFile(null);
    setPreviewUrl(null);
    setErrorMessage('');
  };

  // Helper to get initials for avatar fallback
  const getInitials = () => {
    return userData.name
      ? userData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="ml-3 text-teal-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Home button */}
        <button
          onClick={() => history.push('/dashboard')}
          className="absolute -top-2 left-0 p-3 bg-teal-600 rounded-full shadow-lg hover:bg-teal-700 transition-all duration-200 z-10"
        >
          <FaHome className="text-white text-lg" />
        </button>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8 text-center">
            <div className="relative inline-block">
              <div className="w-28 h-28 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                {previewUrl || userData.profilePicture ? (
                  <img
                    src={previewUrl || userData.profilePicture || ''}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-700 text-3xl font-bold">
                    {getInitials()}
                  </div>
                )}
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 p-1.5 bg-teal-600 rounded-full cursor-pointer shadow-md hover:bg-teal-700 transition">
                  <FaCamera className="text-white text-xs" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">My Profile</h2>
            <p className="text-teal-100 text-sm">Manage your account details</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition ${
                    editMode
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition ${
                    editMode
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-300 transition ${
                    editMode
                      ? 'bg-white border-gray-300 text-gray-900'
                      : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Messages */}
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSave />
                      )}
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="w-full py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2"
                  >
                    <FaUserEdit /> Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;