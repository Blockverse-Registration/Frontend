import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Registration.css';

export default function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Add any success-specific logic here
  }, []);

  return (
    <div className="page-wrapper success-page-wrapper">
      <div className="success-container-outer">
        <div className="success-glow-bg"></div>
        <div className="info-section success-card">
          <div className="tech-bg"></div>
          <div className="content-wrapper">
            <div className="success-icon-wrapper">
              <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 className="event-title success-heading">REGISTRATION<br/>SUCCESSFUL!</h1>
            <p className="event-subtitle success-subtitle">WELCOME TO THE BLOCKVERSE</p>
            
            <div className="success-message-container">
              <p className="success-desc">Your team has been successfully registered for BlockVerse '26.</p>
              <p className="payment-instruction">Please visit the BRL desk to complete your payment.</p>
              <p className="success-desc">Check your student email for the confirmation details and event schedule.</p>
            </div>

            <div className="success-action-wrapper">
              <button 
                className="back-home-btn" 
                onClick={() => navigate('/')}
              >
                RETURN TO HOME
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}