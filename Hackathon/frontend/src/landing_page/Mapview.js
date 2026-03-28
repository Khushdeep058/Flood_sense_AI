import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Mapview = ({ rain }) => {
    const [geoData, setGeoData] = useState(null);
    const [wardProbabilities, setWardProbabilities] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch GeoJSON once
        fetchGeoJSON();
    }, []);

    useEffect(() => {
        // Update probabilities when rain scenario changes
        updateProbabilities();
    }, [rain]);

    const fetchGeoJSON = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/get_wards_geojson');
            const data = await response.json();
            setGeoData(data);
        } catch (error) {
            console.error("Error fetching GeoJSON:", error);
        }
    };

    const updateProbabilities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/predict?rain=${rain}`);
            const data = await response.json();
            
            // Map WardName to probability for quick lookup
            const probMap = {};
            data.forEach(w => {
                probMap[w.WardName] = w.flood_probability;
            });
            setWardProbabilities(probMap);
        } catch (error) {
            console.error("Error updating probabilities for map:", error);
        } finally {
            setLoading(false);
        }
    };

    const getColor = (prob) => {
        if (prob > 0.8) return '#ff4d4d'; // Red - Critical
        if (prob > 0.6) return '#ff944d'; // Orange - High
        if (prob > 0.4) return '#ffdb4d'; // Yellow - Elevated
        if (prob > 0.2) return '#47eaed'; // Teal - Specific risk
        return '#004f51'; // Deep Teal - Safe
    };

    const style = (feature) => {
        // The property inwards.geojson that matches WardName in predict API
        // Checking typically for "WardName" or "name"
        const wardName = feature.properties.WardName || feature.properties.name;
        const prob = wardProbabilities[wardName] || 0;
        
        return {
            fillColor: getColor(prob),
            weight: 1,
            opacity: 1,
            color: 'rgba(255,255,255,0.2)', // Border color
            fillOpacity: 0.6
        };
    };

    const onEachFeature = (feature, layer) => {
        const wardName = feature.properties.WardName || feature.properties.name;
        const prob = wardProbabilities[wardName] || 0;
        layer.bindPopup(`
            <div style="background: #10141a; color: white; padding: 10px; border-radius: 8px;">
                <h4 style="margin: 0 0 5px 0;">${wardName}</h4>
                <div style="font-weight: 800; color: ${getColor(prob)}">
                    Flood Prob: ${(prob * 100).toPrecision(3)}%
                </div>
            </div>
        `);
    };

    return (
        <div style={{ width: '100%', height: '100%', background: '#0a0e14', position: 'relative' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ color: 'var(--primary)', fontWeight: '700' }}>LOADING SPATIAL INTELLIGENCE...</div>
                </div>
            )}
            
            <MapContainer 
                center={[28.6139, 77.2090]} 
                zoom={11} 
                style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                zoomControl={false}
            >
                {/* Modern Dark Matter Layer */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {geoData && (
                    <GeoJSON 
                        data={geoData} 
                        style={style} 
                        onEachFeature={onEachFeature}
                        key={JSON.stringify(wardProbabilities)} // Re-render when data updates
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default Mapview;
