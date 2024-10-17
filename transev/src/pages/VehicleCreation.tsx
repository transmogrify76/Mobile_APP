import React, { useState } from 'react';
import axios from 'axios';

const VehicleCreation: React.FC = () => {
  const [vehicleName, setVehicleName] = useState<string>('');
  const [vehicleModel, setVehicleModel] = useState<string>('');
  const [vehicleLicense, setVehicleLicense] = useState<string>('');
  const [vehicleOwner, setVehicleOwner] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('');
  const [vehicleCategory, setVehicleCategory] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    try {
      const apiKey = "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru";
      const adminuid = "yyyy"; // Hardcoded adminuid
      
      if (!apiKey) {
        alert('API key is not defined. Please check your environment variables.');
        return;
      }

      // Make the POST request to the backend
      const response = await axios.post('https://transmogrify.in/admin/createav', {
        vehiclename: vehicleName,
        vehiclemodel: vehicleModel,
        vehiclelicense: vehicleLicense,
        vehicleowner: vehicleOwner,
        vehicletype: vehicleType,
        vehiclecategory: vehicleCategory,
        adminuid: adminuid, // Pass hardcoded adminuid
      }, {
        headers: {
          'Content-Type': 'application/json',
          'apiauthkey': apiKey,
        },
      });

      setSuccessMessage(response.data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message as string || 'Something went wrong!');
      } else {
        setErrorMessage('Something went wrong!');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-100 via-teal-200 to-blue-100">
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-full max-w-md h-[100vh] bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col justify-center overflow-hidden">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="https://transev.in/wp-content/uploads/2023/07/logo-160x57.png"
              alt="Logo"
              className="h-14 w-auto"
            />
          </div>

          <h2 className="text-4xl font-bold text-center text-teal-800 mb-6">Create Vehicle</h2>

          <div className="overflow-y-auto h-full">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-gray-700">Vehicle Name</label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={e => setVehicleName(e.target.value)}
                  required
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                  placeholder="Enter vehicle name"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Vehicle Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  required
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                  placeholder="Enter vehicle model"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Vehicle License</label>
                <input
                  type="text"
                  value={vehicleLicense}
                  onChange={e => setVehicleLicense(e.target.value)}
                  required
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                  placeholder="Enter vehicle license number"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Vehicle Owner</label>
                <input
                  type="text"
                  value={vehicleOwner}
                  onChange={e => setVehicleOwner(e.target.value)}
                  required
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                  placeholder="Enter owner's name"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Vehicle Type</label>
                <input
                  type="text"
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}
                  required
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                  placeholder="Enter vehicle type"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Vehicle Category</label>
                <input
                  type="text"
                  value={vehicleCategory}
                  onChange={e => setVehicleCategory(e.target.value)}
                  required
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-teal-300"
                  placeholder="Enter vehicle category"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 text-white font-bold py-3 rounded-full shadow-lg hover:bg-teal-600 transition duration-300 ease-in-out"
                disabled={!vehicleName || !vehicleModel || !vehicleLicense || !vehicleOwner || !vehicleType || !vehicleCategory}
              >
                Create Vehicle
              </button>
            </form>
          </div>

          {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default VehicleCreation;
