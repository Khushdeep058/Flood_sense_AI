import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Rainselector from './Rainselector';
import Mapview from './Mapview';
import WardCard from './wardcard';
import WardDetail from './Warddetail';

const Dashboard = ({ onNavigate }) => {
    const [selectedRain, setSelectedRain] = useState('real');
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWard, setSelectedWard] = useState(null);
    const [alerts, setAlerts] = useState([
        { id: 1, time: '2 mins ago', msg: 'Model updated: Simulation at ' + selectedRain + (selectedRain === 'real' ? '' : 'mm'), type: 'info' },
    ]);
    const [notifiedWards, setNotifiedWards] = useState(new Set());

    useEffect(() => {
        fetchWards();
    }, [selectedRain]);

    const fetchWards = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/predict?rain=${selectedRain}`);
            const data = await response.json();
            setWards(data);
            
            // 🚨 INTELLIGENT ALERT GENERATION & GMAIL API AUTOMATION
            const highRiskWards = data.filter(w => w.flood_probability > 0.7)
                                      .sort((a,b) => b.flood_probability - a.flood_probability)
                                      .slice(0, 3);
            
            // AUTOMATED TRANSMISSION (Trigger for Top 1 most critical if not already notified)
            const topRisk = highRiskWards.find(w => w.flood_probability > 0.9);
            if (topRisk && !notifiedWards.has(topRisk.WardName)) {
                // FIRE GMAIL API BACKEND
                fetch('http://127.0.0.1:5000/send_alert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ward: topRisk, email: "9971khushdeep@gmail.com" })
                }).then(res => {
                    if (res.ok) {
                        setAlerts(prev => [{
                            id: Date.now() + 99,
                            time: 'JUST NOW',
                            msg: `📧 GMAIL API: Automated report transmitted for ${topRisk.WardName}`,
                            type: 'info'
                        }, ...prev]);
                        setNotifiedWards(prev => new Set(prev).add(topRisk.WardName));
                    }
                });
            }

            if (highRiskWards.length > 0) {
                const newAlerts = highRiskWards.map(w => ({
                    id: Date.now() + Math.random(),
                    time: 'Just now',
                    msg: `${w.flood_probability > 0.85 ? 'URGENT' : 'WARNING'}: High flood vulnerability in ${w.WardName} (${(w.flood_probability*100).toFixed(0)}%). ${w.elevation_m < 200 ? 'Low-lying area detected.' : 'Increased water accumulation risk.'}`,
                    type: w.flood_probability > 0.85 ? 'error' : 'warning'
                }));
                setAlerts(prev => [...newAlerts, ...prev.slice(0, 3)]);
            }
        } catch (error) {
            console.error("Error fetching ward data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWards = wards.filter(w => 
        w.WardName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const criticalWard = wards.reduce((max, w) => (w.flood_probability > (max?.flood_probability || 0) ? w : max), null);
    
    // 📊 IMPACT ANALYTICS (Synthetic for Hackathon impact)
    const stats = {
        avgProb: (wards.reduce((acc, w) => acc + w.flood_probability, 0) / (wards.length || 1) * 100).toFixed(1),
        atRiskPop: Math.floor(wards.filter(w => w.flood_probability > 0.4).length * 45000), // ~45k per ward avg
        criticalCount: wards.filter(w => w.flood_probability > 0.8).length
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-main)', overflow: 'hidden' }}>
            <Navbar onNavigate={onNavigate} />
            
            <div style={{ display: 'flex', paddingTop: '100px', height: 'calc(100vh - 100px)', gap: '20px', padding: '100px 20px 20px 20px', boxSizing: 'border-box' }}>
                
                {/* Left Sidebar: Control & List */}
                <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                    
                    {/* Rain Selector */}
                    <div className="glass" style={{ padding: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Simulation Control
                        </h3>
                        <Rainselector selected={selectedRain} onChange={setSelectedRain} />
                    </div>

                    {/* Ward List */}
                    <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                            <input 
                                type="text" 
                                placeholder="Search wards..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }} className="custom-scrollbar">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Processing spatial data...</div>
                            ) : (
                                filteredWards.map((ward, i) => (
                                    <WardCard key={i} ward={ward} onClick={setSelectedWard} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content: Map & Alerts */}
                <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Flash Alert Banner */}
                    {criticalWard && criticalWard.flood_probability > 0.7 && (
                        <div className="glass" style={{ 
                            padding: '12px 25px', 
                            background: 'rgba(255, 77, 77, 0.15)', 
                            border: '1px solid rgba(255, 77, 77, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            animation: 'pulseGlow 2s infinite'
                        }}>
                            <span style={{ color: '#ff4d4d', fontWeight: '900', fontSize: '1.2rem' }}>⚠️ CRITICAL:</span>
                            <span style={{ flex: 1, fontWeight: '600' }}>
                                Extreme flood risk detected in <b style={{color: '#ff4d4d'}}>{criticalWard.WardName}</b> (Prob: {(criticalWard.flood_probability*100).toFixed(0)}%)
                            </span>
                            <button className="btn-primary" onClick={() => setSelectedWard(criticalWard)} style={{ padding: '6px 15px', fontSize: '0.7rem' }}>DRILL DOWN</button>
                        </div>
                    )}

                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className="glass">
                        <Mapview rain={selectedRain} />
                        
                        {/* Map Overlay Stats */}
                        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, pointerEvents: 'none' }}>
                            <div className="glass" style={{ padding: '15px 30px', display: 'flex', gap: '40px' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Impacted Population</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>
                                        {stats.atRiskPop.toLocaleString()}+
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Critical Zones</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ff4d4d' }}>
                                        {stats.criticalCount}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Risk Index</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>
                                        {stats.avgProb}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Notifications */}
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                    <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Live Feed
                            </h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }} className="custom-scrollbar">
                            {alerts.map(alert => (
                                <div key={alert.id} style={{ 
                                    padding: '12px', 
                                    marginBottom: '10px', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '8px',
                                    borderLeft: `3px solid ${alert.type === 'error' ? '#ff4d4d' : alert.type === 'warning' ? '#ff944d' : 'var(--primary)'}`
                                }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{alert.time}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '500', lineHeight: 1.4 }}>{alert.msg}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Overlay */}
            {selectedWard && (
                <WardDetail ward={selectedWard} onClose={() => setSelectedWard(null)} />
            )}

            <style>{`
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 5px rgba(255, 77, 77, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(255, 77, 77, 0.4); }
                    100% { box-shadow: 0 0 5px rgba(255, 77, 77, 0.2); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
