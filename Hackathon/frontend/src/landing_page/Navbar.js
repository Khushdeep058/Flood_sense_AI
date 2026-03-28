import React from 'react';

const Navbar = ({ onNavigate }) => {
    return (
        <nav className="glass" style={{
            margin: '20px',
            padding: '1.2rem 3rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backdropFilter: 'blur(20px)',
            background: 'rgba(10, 14, 20, 0.8)'
        }}>
            <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
            }} onClick={() => onNavigate('home')}>
                FloodSense 🌊
            </div>
            
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <button 
                    onClick={() => onNavigate('home')} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
                    Home
                </button>
                <button 
                    onClick={() => onNavigate('dashboard')} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
                    Dashboard
                </button>
                <button 
                    onClick={() => onNavigate('about')} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
                    About
                </button>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    color: '#003738'
                }}>
                    JD
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
