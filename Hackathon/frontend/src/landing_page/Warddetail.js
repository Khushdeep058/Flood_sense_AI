import React from 'react';

const WardDetail = ({ ward, onClose }) => {
    if (!ward) return null;

    const prob = ward.flood_probability || 0;
    const rainfall = ward.rainfall_mm || 0;
    const elevation = ward.elevation_m || 0;
    const drainage = ward.drainage_density || 0;
    const impervious = ward.impermeable_ratio || 0;

    // Determine status
    let status = 'LOW RISK';
    let color = '#47eaed';
    if (prob > 0.75) status = 'CRITICAL';
    else if (prob > 0.5) status = 'ELEVATED';
    else if (prob > 0.3) status = 'MODERATE';

    if (prob > 0.75) color = '#ff4d4d';
    else if (prob > 0.5) color = '#ff944d';
    else if (prob > 0.3) color = '#ffdb4d';

    // 📉 AI RISK CALIBRATION (Optimized for Delhi Topography ~200m)
    const metrics = [
        {
            label: 'Rainfall Impact',
            value: Math.min(rainfall / 200, 1),
            display: `${rainfall}mm`
        },
        {
            label: 'Elevation Risk',
            // Scale: 190m (River-level/Critical) to 235m (Ridge-level/Safe)
            value: Math.max(0, Math.min(1, 1 - (elevation - 190) / 45)),
            display: `${elevation.toFixed(1)}m`
        },
        {
            label: 'Drainage Overflow',
            // Scale: 0.05+ is good urban drainage
            value: Math.max(0, Math.min(1, 1 - (drainage * 20))),
            display: drainage.toFixed(3)
        },
        {
            label: 'Surface Impermeability',
            value: impervious,
            display: `${(impervious * 100).toFixed(1)}%`
        },
    ];

    const handleDownload = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/download_report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ward })
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Flood_Report_${ward.WardName}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
        }} onClick={onClose}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '800px',
                padding: '40px',
                position: 'relative',
                animation: 'modalFadeIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '20px', right: '20px',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '1.5rem', cursor: 'pointer'
                }}>&times;</button>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '2px', fontWeight: '600' }}>WARD ANALYTICS</div>
                        <h1 style={{ fontSize: '3.5rem', margin: '5px 0 0 0', fontWeight: '800' }}>{ward.WardName}</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{
                            fontSize: '0.8rem', fontWeight: '800', padding: '6px 12px',
                            borderRadius: '6px', color: color, background: `${color}22`,
                            border: `1px solid ${color}44`, display: 'inline-block', marginBottom: '10px'
                        }}>
                            {status}
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1 }}>{(prob * 100).toFixed(0)}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FLOOD PROBABILITY</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>

                    {/* Metrics Section */}
                    <div>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '20px', borderLeft: '3px solid var(--primary)', paddingLeft: '15px' }}>
                            AI RISK BREAKDOWN
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            {metrics.map((m, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                        <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{m.display}</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: `${m.value * 100}%`,
                                            background: `linear-gradient(to right, var(--primary), ${color})`,
                                            boxShadow: `0 0 10px ${color}66`
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insight Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass" style={{ padding: '25px', background: 'rgba(71, 234, 237, 0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '10px' }}>AI INSIGHT</div>
                            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                                {prob > 0.6
                                    ? `Detected high risk in ${ward.WardName} due to ${impervious > 0.7 ? 'extreme surface impermeability' : 'low-lying topography'} and projected accumulation.`
                                    : `Current metrics indicate stable conditions for ${ward.WardName}. Primary drainage systems are sufficient for this rainfall level.`
                                }
                            </p>
                        </div>

                        {/* ✅ STRATEGIC ACTION PLAN (Impactful Suggestion) */}
                        <div className="glass" style={{ padding: '25px', borderLeft: '3px solid #ffdb4d', background: 'rgba(255, 219, 77, 0.03)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#ffdb4d', fontWeight: '800', marginBottom: '10px' }}>STRATEGIC ACTION PLAN</div>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {impervious > 0.7 && <li><b>Infrastructure:</b> Dispatch teams to clear storm-drains & remove silt from catch basins.</li>}
                                {elevation < 15 && <li><b>Operations:</b> Deploy mobile heavy-duty pumping units to designated low-lying zones.</li>}
                                {drainage < 0.1 && <li><b>Immediate:</b> Inspect primary sewer lines for blockages in dense areas.</li>}
                                {prob > 0.8 && <li style={{ color: '#ff4d4d' }}><b>Public Safety:</b> Issue early warning SMS & prepare temporary shelters in higher zones.</li>}
                                {prob <= 0.8 && <li><b>Monitoring:</b> Maintain active watch on downstream accumulation points.</li>}
                            </ul>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn-primary" 
                                    style={{ width: '100%', borderRadius: '12px' }}
                                    onClick={handleDownload}>
                                Download Full Report
                            </button>
                            <button className="btn-outline" style={{ width: '100%', borderRadius: '12px' }} onClick={onClose}>Close Terminal</button>
                        </div>
                    </div>
                </div>

            </div>
            <style>{`
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default WardDetail;
