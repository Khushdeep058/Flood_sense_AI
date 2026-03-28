import React, { useState } from 'react';

const simulations = [
    { id: '60', label: 'Heavy (60mm)', desc: 'Standard flood scenario' },
    { id: '120', label: 'Extreme (120mm)', desc: 'Flash flood catastrophic' },
    { id: '180', label: 'Supercell (180mm)', desc: 'Cloudburst level simulation' },
];

const Rainselector = ({ selected, onChange }) => {
    const [sliderVal, setSliderVal] = useState(typeof selected === 'number' ? selected : 50);

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value);
        setSliderVal(val);
        // Debounce or just call on change for real-time feel
        onChange(val);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Real-time Toggle */}
            <button
                onClick={() => onChange('real')}
                style={{
                    padding: '16px',
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid ' + (selected === 'real' ? 'var(--primary)' : 'var(--glass-border)'),
                    background: selected === 'real' ? 'rgba(71, 234, 237, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: selected === 'real' ? 'white' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: selected === 'real' ? 'var(--primary)' : 'var(--text-muted)',
                        boxShadow: selected === 'real' ? '0 0 10px var(--primary)' : 'none'
                    }}></span>
                    LIVE TELEMETRY
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px', textAlign: 'left', opacity: 0.7 }}>
                    Pulling actual 24h rainfall data from APIs
                </div>
            </button>

            <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>

            {/* Custom Simulation Slider */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>SIMULATION (mm)</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{typeof selected === 'number' ? selected : sliderVal}mm</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="250" 
                    value={typeof selected === 'number' ? selected : sliderVal}
                    onChange={handleSliderChange}
                    style={{ 
                        width: '100%', 
                        accentColor: 'var(--primary)',
                        cursor: 'pointer',
                        filter: 'drop-shadow(0 0 5px var(--accent-glow))'
                    }}
                />
            </div>

            {/* Simulation Quick Selects */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '10px' }}>
                {simulations.map((sim) => (
                    <button
                        key={sim.id}
                        onClick={() => onChange(parseInt(sim.id))}
                        style={{
                            padding: '12px',
                            background: selected === parseInt(sim.id) ? 'rgba(71, 234, 237, 0.1)' : 'transparent',
                            border: '1px solid ' + (selected === parseInt(sim.id) ? 'var(--primary)' : 'var(--glass-border)'),
                            borderRadius: '8px',
                            color: selected === parseInt(sim.id) ? 'var(--primary)' : 'var(--text-muted)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                    >
                        {sim.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Rainselector;
