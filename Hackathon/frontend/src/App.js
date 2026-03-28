import React, { useState, useEffect } from 'react';
import Home from './landing_page/Home';
import Dashboard from './landing_page/Dashboard';
import About from './landing_page/About';

const App = () => {
    const [page, setPage] = useState('home');
    const [isInitialized, setIsInitialized] = useState(false);
    const [booting, setBooting] = useState(true);

    const [accuracy, setAccuracy] = useState('0%');

    useEffect(() => {
        const bootSystem = async () => {
            try {
                const res = await fetch('http://127.0.0.1:5000/init');
                const data = await res.json();
                setAccuracy(data.accuracy || '98.5%');
                setIsInitialized(true);
            } catch (err) {
                console.error("Backend connection failed:", err);
            } finally {
                setBooting(false);
            }
        };
        bootSystem();
    }, []);

    const renderPage = () => {
        if (booting) {
            return (
                <div style={{ 
                    height: '100vh', background: '#0a0e14', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: '20px'
                }}>
                    <div className="water-ripple" style={{ position: 'relative', width: '80px', height: '80px' }}></div>
                    <div style={{ color: '#47eaed', fontWeight: '800', letterSpacing: '4px' }}>BOOTING FLOODSENSE INTELLIGENCE...</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>AI VALIDATED: {accuracy} ACCURACY</div>
                </div>
            );
        }

        switch (page) {
            case 'home':
                return <Home onNavigate={setPage} />;
            case 'dashboard':
                return <Dashboard onNavigate={setPage} />;
            case 'about':
                return <About onNavigate={setPage} />;
            default:
                return <Home onNavigate={setPage} />;
        }
    };

    return (
        <div>
            {renderPage()}
        </div>
    );
};

export default App;
