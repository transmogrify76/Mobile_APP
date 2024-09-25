import React, { useState } from 'react';
import { IonContent, IonButton, IonInput, IonItem, IonLabel, IonCard, IonCardHeader, IonCardContent, IonTitle } from '@ionic/react';
import axios from 'axios';

const OtpVerification: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleOtpVerification = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:3000/userauth/verifyotp', { email, otp }, {
        headers: {
          'apiauthkey': "aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru",
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
    <IonContent className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="signup-container">
        <div className="signup-card shadow-lg rounded-lg">
          <div className="signup-header bg-red-400 rounded-t-lg">
            <h1 className="signup-title text-center text-white text-2xl font-bold py-4">Verify OTP</h1>
          </div>
          <div className="signup-content p-5">
            <IonItem className="mb-4">
              <IonLabel position="floating" className="text-gray-700">Email</IonLabel>
              <IonInput 
                type="email" 
                value={email} 
                onIonChange={e => setEmail(e.detail.value!)} 
                required 
                className="input-field border-b border-gray-300 p-2 focus:outline-none focus:border-blue-500 transition duration-200"
              />
            </IonItem>
            <IonItem className="mb-4">
              <IonLabel position="floating" className="text-gray-700">OTP</IonLabel>
              <IonInput 
                type="text" 
                value={otp} 
                onIonChange={e => setOtp(e.detail.value!)} 
                required 
                className="input-field border-b border-gray-300 p-2 focus:outline-none focus:border-blue-500 transition duration-200"
              />
            </IonItem>

            <IonButton 
              expand="full" 
              onClick={handleOtpVerification} 
              className="signup-button mt-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition duration-200 font-semibold shadow-md"
            >
              Verify OTP
            </IonButton>

            {errorMessage && <p className="mt-4 text-red-600 text-center font-medium">{errorMessage}</p>}
            {successMessage && <p className="mt-4 text-green-600 text-center font-medium">{successMessage}</p>}
          </div>
        </div>
      </div>

      <footer className="mt-4 text-center text-gray-700">
        <p>Didn't receive the OTP? <a href="/resend-otp" className="font-semibold text-red-500 hover:underline">Resend OTP</a></p>
      </footer>
    </IonContent>
  );
};

export default OtpVerification;
