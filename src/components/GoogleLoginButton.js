import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const GoogleLoginButton = ({ onSuccess }) => {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        onSuccess(decoded); // Pasamos el usuario decodificado a la función onSuccess
      }}
      onError={() => console.log('Login Failed')}
    />
  );
};

export default GoogleLoginButton;
