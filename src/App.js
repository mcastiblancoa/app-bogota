import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { IoIosApps, IoIosArrowDown } from "react-icons/io";
import MapComponent from './components/MapComponent';
import ReportsList from './components/ReportsList';
import bogota_app_logo from '../src/assets/img/bogota_app_logo.png'
import './App.css';

const App = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    localStorage.setItem('user', JSON.stringify(decoded));
    console.log('Login Success:', decoded);
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
    console.log('Logged out');
  };

  const [showReports, setShowReports] = useState(false);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        {user ? (
          <>
            <div className="logout-container">
              <button onClick={handleLogout} className="logout-button">
                Cerrar sesión
              </button>
            </div>
            <MapComponent />
            
            {/* Contenedor para los reportes */}
            <div className={`reports-container ${showReports ? '' : 'hidden'}`}>
              <ReportsList />
            </div>

            {/* Botón de reporte con ícono */}
            <button
              onClick={() => setShowReports((prev) => !prev)}
              className="report-button"
            >
              {showReports ? <IoIosArrowDown /> : <IoIosApps />}
            </button>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column', // Cambia la dirección del flexbox a columna
            }}
          >
            {/* Logo y descripción */}
            <img src={bogota_app_logo} alt="Logo de la aplicación" style={{ width: '300px', marginBottom: '20px' }} />

            {/* Botón de Google Login */}
            <GoogleLogin 
              onSuccess={handleLoginSuccess} 
              onError={() => console.log('Login Failed')} 
              theme="filled_blue"
              shape="pill"
              text="signin"
              logo_alignment="center"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '20px',
                padding: '10px 20px',
                border: '2px solid black',
                fontSize: '16px',
                fontWeight: 'bold',
                outline: 'none',
                cursor: 'pointer',
              }}
            />

            <p className="login-description" style={{ marginBottom: 20, textAlign: "center" }}>
              Esta aplicación es un <strong>mapa interactivo</strong> que permite reportar en tiempo real robos, accidentes y otros incidentes.
              <br /><br />
              Su objetivo es ayudar a los ciudadanos a <strong>identificar zonas de riesgo</strong> en Bogotá y tomar decisiones más seguras sobre sus rutas.
              <br /><br />
              <strong>⚠️ Importante:</strong> Esta aplicación <strong>NO</strong> es un reporte oficial de incidentes de inseguridad o accidentes en Bogotá.
            </p>

            
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;