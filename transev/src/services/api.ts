// src/services/api.ts

import axios from 'axios';

const API_URL = 'https://transev.site/userauth'; 

const api = axios.create({
  baseURL: API_URL,
});

// Function for user signup and OTP verification
export const signupUser = async (username: string, email: string, password: string, otp?: string) => {
  try {
    const payload: any = { username, email, password };

    // If OTP is provided, include it in the payload
    if (otp) {
      payload.otp = otp;
      delete payload.username; // Remove username if OTP is being verified
    }

    const response = await api.post('/signup', payload, {
      headers: {
        apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru'
      }
    });

    return response.data;
  } catch (error: unknown) {
    // Check if error is an Axios error
    if (axios.isAxiosError(error)) {
      throw error.response?.data?.message || 'Something went wrong!';
    } else {
      throw 'Something went wrong!'; // Handle other types of errors
    }
  }
};
