import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Registration.css';

export default function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Add any success-specific logic here
  }, []);

  return (
    <div className="page-wrapper success-page">
      <div className="info-section success-content">
        <div className="tech-bg"></div>
        <div className="content-wrapper">
          <div className="success-icon-wrapper">
            <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="event-title">REGISTRATION<br/>SUCCESSFUL!</h1>
          <p className="event-subtitle">WELCOME TO THE BLOCKVERSE</p>
          
          <div className="event-details success-message">
            <div className="detail-item">
              <span className="value">Your team has been successfully registered for BlockVerse '26.</span>
            </div>
            <div className="detail-item">
              <span className="value highlight-text">Please visit the BRL desk to complete your payment.</span>
            </div>
            <div className="detail-item">
              <span className="value">Check your student email for the confirmation details and event schedule.</span>
            </div>
          </div>

          <button 
            className="submit-button back-home-btn" 
            onClick={() => navigate('/')}
            style={{ marginTop: '40px', maxWidth: '300px' }}
          >
            RETURN TO HOME
          </button>
        </div>
      </div>
    </div>
  );
}