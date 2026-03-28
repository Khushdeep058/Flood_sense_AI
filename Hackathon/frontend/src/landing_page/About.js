import React from 'react';
import Navbar from './Navbar';

const About = ({ onNavigate }) => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-main)', paddingBottom: '100px' }}>
            <Navbar onNavigate={onNavigate} />
            
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '150px', padding: '150px 20px 50px 20px' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '20px', background: 'linear-gradient(to right, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        The Fluid Sentinel
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
                        FloodSense is an AI-powered intelligence layer designed to protect dense urban environments from the increasing threat of urban flooding.
                    </p>
                </div>

                {/* Problem & Solution */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '80px' }}>
                    <div className="glass" style={{ padding: '40px' }}>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>The Problem</h2>
                        <p style={{ lineHeight: 1.7, color: 'var(--text-main)' }}>
                            Rapid urbanization and climate change have made cities like Delhi highly vulnerable to flash floods. Existing monitoring systems are often reactive, providing data only after the water has risen. Traditional drainage infrastructure cannot keep up with record-breaking rainfall.
                        </p>
                    </div>
                    <div className="glass" style={{ padding: '40px', border: '1px solid var(--primary)' }}>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>The Solution</h2>
                        <p style={{ lineHeight: 1.7, color: 'var(--text-main)' }}>
                            FloodSense is a proactive **Predictive Engine**. By analyzing topography, drainage density, and surface impermeability alongside real-time rainfall data, our AI model calculates ward-level flood probabilities *before* they happen, allowing for strategic deployment of resources.
                        </p>
                    </div>
                </div>

                {/* Tech Stack */}
                <div style={{ marginBottom: '80px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Intelligence Stack</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {[
                            { title: 'Backend', tech: 'Python, Flask' },
                            { title: 'Spatial Data', tech: 'GeoPandas, OSMnx' },
                            { title: 'AI Engine', tech: 'Scikit-Learn (Random Forest)' },
                            { title: 'Frontend', tech: 'React, Leaflet.js' }
                        ].map((item, i) => (
                            <div key={i} className="glass" style={{ padding: '30px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase' }}>{item.title}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{item.tech}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Architecture */}
                <div className="glass" style={{ padding: '50px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '40px' }}>System Architecture</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
                        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ fontWeight: '700' }}>Data Ingestion</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OpenWeather, OSM, Topo APIs</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</div>
                        <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--primary)', color: '#003738', fontWeight: '800' }}>
                            AI Prediction Model
                            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Gradient Boosting / Random Forest</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</div>
                        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                            GIS Frontend
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>React-Leaflet Visualization</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;
