import React from 'react';
import Navbar from './Navbar';

const Home = ({ onNavigate }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar onNavigate={onNavigate} />

            {/* Hero Section */}
            <main style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '100px 20px',
                marginTop: '80px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Animation Element */}
                <div className="water-ripple" style={{ left: '10%', top: '20%', width: '100px', height: '100px', opacity: 0.1 }}></div>
                <div className="water-ripple" style={{ right: '15%', bottom: '30%', width: '150px', height: '150px', opacity: 0.1, animationDelay: '1s' }}></div>

                <div style={{
                    textAlign: 'center',
                    maxWidth: '900px',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <div className="glass" style={{ 
                        padding: '8px 24px', 
                        borderRadius: 'full', 
                        fontSize: '0.875rem', 
                        color: 'var(--primary)',
                        display: 'inline-block'
                    }}>
                        Deep Learning Flood Detection v1.0
                    </div>
                    
                    <h1 style={{ 
                        fontSize: '5rem', 
                        margin: 0, 
                        fontWeight: '800', 
                        letterSpacing: '-2px',
                        background: 'linear-gradient(to right, #47eaed, #00ced1, #dfe2eb)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1
                    }}>
                        FloodSense 🌊
                    </h1>
                    
                    <p style={{ 
                        fontSize: '1.5rem', 
                        color: 'var(--text-muted)', 
                        margin: 0,
                        fontWeight: '500',
                        maxWidth: '650px'
                    }}>
                        AI-powered flood prediction system utilizing real-time ward data & machine learning to protect city infrastructure.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                        <button className="btn-primary" onClick={() => onNavigate('dashboard')} style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                            Check Flood Risk
                        </button>
                        <button className="btn-outline" onClick={() => onNavigate('dashboard')} style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                            Go to Dashboard
                        </button>
                    </div>

                    <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%' }}>
                        {[
                            { title: 'Real-time Monitoring', desc: 'Active sensing of ward-level rainfall & drainage' },
                            { title: 'Probability Engine', desc: 'Predicting future risks using Random Forest algorithms' },
                            { title: 'Interactive Maps', desc: 'Visualizing flood probability through heatmaps' }
                        ].map((feature, i) => (
                            <div key={i} className="glass" style={{ padding: '30px', textAlign: 'left' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: 'var(--primary)' }}>{feature.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="glass" style={{ margin: '20px', padding: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                &copy; 2026 FloodSense AI. Developed for Advanced Urban Resilience.
            </footer>
        </div>
    );
};

export default Home;
