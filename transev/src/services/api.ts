// src/services/api.ts

import axios from 'axios';

const API_URL = 'http://localhost:3000/userauth'; 

const api = axios.create({
  baseURL: API_URL,
});

export const signupUser = async (username: string, email: string, password: string) => {
  try {
    const response = await api.post('/signup', {
      username,
      email,
      password,
    },
    {
    headers: {
        apiauthkey: 'aBcD1eFgH2iJkLmNoPqRsTuVwXyZ012345678jasldjalsdjurewouroewiru'
    }
}
);
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
