// frontend/src/components/Map.jsx - FIXED untuk menggunakan endpoint public
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { API_BASE_URL } from '../config';

const BandungMap = () => {
    // State untuk data GeoJSON kecamatan dan data RTH
    const [geoData, setGeoData] = useState(null);
    const [rthData, setRthData] = useState(null);
    const [mergedData, setMergedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fix Leaflet icon issues
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: icon,
            iconRetinaUrl: iconRetina,
            shadowUrl: iconShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });
    }, []);

    // Fetch both kecamatan boundaries and RTH data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Starting to fetch map data...');

                // Fetch kecamatan boundaries
                console.log('Fetching kecamatan boundaries...');
                const kecamatanResponse = await axios.get(`${API_BASE_URL}/api/kecamatan/public`);
                console.log('Kecamatan data received:', kecamatanResponse.data);
                setGeoData(kecamatanResponse.data);

                // Fetch RTH data - PENTING: gunakan endpoint /public
                console.log('Fetching RTH data from public endpoint...');
                const rthResponse = await axios.get(`${API_BASE_URL}/api/rth-kecamatan/public`);
                console.log('RTH data received:', rthResponse.data);
                setRthData(rthResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching map data:', err);
                console.error('Error details:', {
                    message: err.message,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data
                });

                setError(`Failed to load map data: ${err.response?.status || 'Network Error'} - ${err.response?.statusText || err.message}`);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Merge GeoJSON and RTH data when both are available
    useEffect(() => {
        if (geoData && rthData && Array.isArray(geoData.features) && Array.isArray(rthData)) {
            console.log('Merging GeoJSON and RTH data...');
            console.log('GeoJSON features count:', geoData.features.length);
            console.log('RTH data count:', rthData.length);

            // Create a mapping of kecamatan names to RTH data
            const rthByKecamatan = {};
            rthData.forEach(item => {
                if (item.kecamatan) {
                    const normalizedName = item.kecamatan.toLowerCase().trim();
                    rthByKecamatan[normalizedName] = item;
                    console.log('RTH mapped:', normalizedName, '→', item.cluster);
                }
            });

            // Create a new GeoJSON object with merged data
            const mergedGeoJSON = {
                type: 'FeatureCollection',
                features: geoData.features.map(feature => {
                    const featureName = (feature.properties.name || '').toLowerCase().trim();
                    const rthInfo = rthByKecamatan[featureName] || null;

                    if (rthInfo) {
                        console.log('Match found:', featureName, '→', rthInfo.cluster);
                    } else {
                        console.log('No RTH data for:', featureName);
                    }

                    // Return a new feature with RTH data included in properties
                    return {
                        ...feature,
                        properties: {
                            ...feature.properties,
                            rthData: rthInfo,
                            hasRthData: !!rthInfo
                        }
                    };
                })
            };

            console.log('Merged data created with', mergedGeoJSON.features.length, 'features');
            setMergedData(mergedGeoJSON);
        }
    }, [geoData, rthData]);

    // Get color based on cluster
    const getColor = (feature) => {
        // Check if feature has RTH data
        if (!feature.properties.rthData) {
            return '#CCCCCC'; // Gray for no data
        }

        const rthData = feature.properties.rthData;
        // Get color based on cluster
        switch (rthData.cluster) {
            case 'cluster_0':
                return '#E53E3E'; // Red for cluster 0
            case 'cluster_1':
                return '#F6E05E'; // Yellow for cluster 1
            case 'cluster_2':
                return '#38A169'; // Green for cluster 2
            default:
                return '#CCCCCC'; // Gray for undefined or null cluster
        }
    };

    // Style function for GeoJSON
    const getFeatureStyle = (feature) => {
        return {
            fillColor: getColor(feature),
            weight: 0.8,
            opacity: 1,
            color: '#333',
            dashArray: '0.5',
            fillOpacity: 0.7
        };
    };

    // Get cluster name for legend
    const getClusterName = (cluster) => {
        switch (cluster) {
            case 'cluster_0':
                return 'Cluster 0 (RTH Rendah)';
            case 'cluster_1':
                return 'Cluster 1 (RTH Menengah)';
            case 'cluster_2':
                return 'Cluster 2 (RTH Tinggi)';
            default:
                return 'Tidak diketahui';
        }
    };

    // Generate tooltip content
    const createTooltipContent = (feature) => {
        const kecamatanName = feature.properties.name || 'Unknown';

        if (!feature.properties.rthData) {
            return `${kecamatanName} (Data tidak tersedia)`;
        }

        const rthData = feature.properties.rthData;
        const clusterName = getClusterName(rthData.cluster);

        return `${kecamatanName} (${clusterName})`;
    };

    // Function to handle each feature (onEachFeature)
    const onEachFeature = (feature, layer) => {
        // Create tooltip content
        const tooltipContent = createTooltipContent(feature);

        // Bind tooltip for hover
        layer.bindTooltip(tooltipContent);

        // Create detailed popup content
        const popupContent = createPopupContent(feature);

        // Bind popup for click
        layer.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });

        // Add event listeners for hover effects
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#555',
                    dashArray: '',
                    fillOpacity: 0.8
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getFeatureStyle(feature));
            },
            click: (e) => {
                const layer = e.target;
                console.log(`Clicked on: ${feature.properties.name || 'Unknown'}`);
            }
        });
    };

    // Create detailed popup content
    const createPopupContent = (feature) => {
        const kecamatanName = feature.properties.name || 'Tidak diketahui';

        if (!feature.properties.rthData) {
            return `
            <div class="rth-popup">
                <h3 class="text-lg font-bold mb-1">Kecamatan ${kecamatanName}</h3>
                <div class="text-sm text-gray-600 mb-2">Data RTH tidak tersedia</div>
            </div>`;
        }

        const rthData = feature.properties.rthData;
        const rthPercentage = rthData.luas_kecamatan > 0
            ? (rthData.total_rth / rthData.luas_kecamatan) * 100
            : 0;

        // Get color based on cluster
        let clusterColor;
        switch (rthData.cluster) {
            case 'cluster_0':
                clusterColor = 'red';
                break;
            case 'cluster_1':
                clusterColor = 'orange';
                break;
            case 'cluster_2':
                clusterColor = 'green';
                break;
            default:
                clusterColor = 'gray';
        }

        const clusterName = getClusterName(rthData.cluster);

        return `
        <div class="rth-popup">
            <h3 class="text-lg font-bold mb-1">Kecamatan ${kecamatanName}</h3>
            <div class="text-sm text-gray-600 mb-2">Informasi Ruang Terbuka Hijau</div>
            
            <table class="w-full text-sm">
                <tr>
                    <td class="font-semibold pr-2">Total RTH:</td>
                    <td>${rthData.total_rth?.toFixed(2) || '0'} ha</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">Luas Taman:</td>
                    <td>${rthData.luas_taman?.toFixed(2) || '0'} ha</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">Luas Pemakaman:</td>
                    <td>${rthData.luas_pemakaman?.toFixed(2) || '0'} ha</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">Luas Kecamatan:</td>
                    <td>${rthData.luas_kecamatan?.toFixed(0) || '0'} ha</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">% RTH:</td>
                    <td>${rthPercentage.toFixed(2)}%</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">Cluster:</td>
                    <td style="color: ${clusterColor}; font-weight: bold">${clusterName}</td>
                </tr>
            </table>
        </div>`;
    };

    // Custom Legend component
    const MapLegend = () => {
        return (
            <div className="leaflet-bottom leaflet-right" style={{ zIndex: 999 }}>
                <div className="leaflet-control leaflet-bar bg-white p-2 shadow-md rounded-md m-4" style={{ minWidth: '300px' }}>
                    <h4 className="font-bold text-sm mb-2">Legenda Cluster RTH</h4>
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-600 mr-2"></div>
                            <span className="text-xs">Cluster 2 (RTH Tinggi)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-400 mr-2"></div>
                            <span className="text-xs">Cluster 1 (RTH Menengah)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-600 mr-2"></div>
                            <span className="text-xs">Cluster 0 (RTH Rendah)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-400 mr-2"></div>
                            <span className="text-xs">Data tidak tersedia</span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        Klik pada kecamatan untuk detail
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                    <p className="mt-2">Loading map data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center p-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 max-w-md">
                        <h3 className="font-bold mb-2">Failed to load map data</h3>
                        <p className="text-sm mb-3">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={[-6.906685589692674, 107.61551919297135]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {mergedData && (
                    <GeoJSON
                        data={mergedData}
                        style={getFeatureStyle}
                        onEachFeature={onEachFeature}
                    />
                )}

                <MapLegend />
            </MapContainer>
        </div>
    );
};

export default BandungMap;