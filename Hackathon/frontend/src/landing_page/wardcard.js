import React from 'react';

const WardCard = ({ ward, onClick }) => {
    const prob = ward.flood_probability || 0;
    
    // Determine risk status
    let status = 'Low Risk';
    let color = '#47eaed';
    let bgColor = 'rgba(71, 234, 237, 0.1)';
    
    if (prob > 0.75) {
        status = 'Critical';
        color = '#ff4d4d';
        bgColor = 'rgba(255, 77, 77, 0.1)';
    } else if (prob > 0.5) {
        status = 'Elevated';
        color = '#ff944d';
        bgColor = 'rgba(255, 148, 77, 0.1)';
    } else if (prob > 0.3) {
        status = 'Moderate';
        color = '#ffdb4d';
        bgColor = 'rgba(255, 219, 77, 0.1)';
    }

    return (
        <div 
            className="glass" 
            style={{ 
                margin: '10px 0', 
                padding: '16px', 
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                background: 'rgba(255,255,255,0.02)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => onClick && onClick(ward)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-main)' }}>{ward.WardName}</div>
                <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    color: color,
                    backgroundColor: bgColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {status}
                </div>
            </div>
            
            <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, height: '100%', 
                    width: `${prob * 100}%`,
                    background: color,
                    boxShadow: `0 0 10px ${color}`
                }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Probability Score</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: color }}>{(prob * 100).toFixed(1)}%</span>
            </div>
        </div>
    );
};

export default WardCard;
