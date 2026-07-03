import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

// This file is web-only and used to configure the root HTML for every page in the web app.
export default function HTML({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        {/* Instantly visible HTML splash screen on Web boot */}
        <div id="root-loading-splash">
          <div id="root-loading-bg" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div className="spinner" />
            <div style={{ color: '#6D5218', fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '24px', marginTop: '16px', letterSpacing: '1.5px', textShadow: '0 0 8px #ffffff' }}>
              LawyerSathi
            </div>
            <div style={{ color: '#7C6021', fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: '12px', marginTop: '4px', letterSpacing: '0.5px', textShadow: '0 0 6px #ffffff' }}>
              Your Legal Supporter
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}

const styles = `
#root-loading-splash {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999999;
}
#root-loading-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/splash_bg.png'), url('assets/images/splash_bg.png');
  background-size: cover;
  background-position: center;
  opacity: 0.55;
  z-index: -1;
}
.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(212, 175, 55, 0.2);
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
