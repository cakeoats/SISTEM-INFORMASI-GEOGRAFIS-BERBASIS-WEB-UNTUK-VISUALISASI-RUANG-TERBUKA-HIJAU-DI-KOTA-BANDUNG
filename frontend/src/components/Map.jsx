// frontend/src/components/Map.jsx - Updated dengan Marker/Pinpoint untuk setiap kecamatan
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { API_BASE_URL, publicAxios } from '../config';

const BandungMap = () => {
    // State untuk data GeoJSON kecamatan dan data RTH
    const [geoData, setGeoData] = useState(null);
    const [rthData, setRthData] = useState(null);
    const [mergedData, setMergedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data koordinat kecamatan
    const kecamatanCoordinates = [
        { name: "Andir", lat: -6.9125599922178, lng: 107.5782860332605 },
        { name: "Antapani", lat: -6.9146838129486, lng: 107.6600014758162 },
        { name: "Arcamanik", lat: -6.9180833751853, lng: 107.6760051667764 },
        { name: "Astana Anyar", lat: -6.9383246815137, lng: 107.6022831905824 },
        { name: "Babakan Ciparay", lat: -6.9398915963086, lng: 107.5776614452603 },
        { name: "Bandung Kidul", lat: -6.9564409108600, lng: 107.6299239031377 },
        { name: "Bandung Kulon", lat: -6.9247775433433, lng: 107.5695095566973 },
        { name: "Bandung Wetan", lat: -6.9043109013626, lng: 107.6172978640043 },
        { name: "Batununggal", lat: -6.9229896978139, lng: 107.6377606787891 },
        { name: "Bojongloa Kaler", lat: -6.9307670595136, lng: 107.5901624719044 },
        { name: "Bojongloa Kidul", lat: -6.9496072649972, lng: 107.5974144913079 },
        { name: "Buahbatu", lat: -6.9493336237850, lng: 107.6523847258450 },
        { name: "Cibeunying Kaler", lat: -6.8841940548894, lng: 107.6289713537643 },
        { name: "Cibeunying Kidul", lat: -6.9016032070656, lng: 107.6439278688119 },
        { name: "Cibiru", lat: -6.9150867132882, lng: 107.7221979583051 },
        { name: "Cicendo", lat: -6.9024706031260, lng: 107.5860779052432 },
        { name: "Cidadap", lat: -6.8650162705145, lng: 107.6037609903934 },
        { name: "Cinambo", lat: -6.9266909245580, lng: 107.6904767958404 },
        { name: "Coblong", lat: -6.8842797658746, lng: 107.6131122850114 },
        { name: "Gedebage", lat: -6.9503077649346, lng: 107.6964157781305 },
        { name: "Kiaracondong", lat: -6.9217126876956, lng: 107.6487927697013 },
        { name: "Lengkong", lat: -6.9313604023403, lng: 107.6232675469783 },
        { name: "Mandalajati", lat: -6.8974825708249, lng: 107.6723642626282 },
        { name: "Panyileukan", lat: -6.9311040560833, lng: 107.7056203378684 },
        { name: "Rancasari", lat: -6.9512341658400, lng: 107.6726260788117 },
        { name: "Regol", lat: -6.9383353236929, lng: 107.6116953140295 },
        { name: "Sukajadi", lat: -6.890554002470648, lng: 107.59135119836964 },
        { name: "Sukasari", lat: -6.8664471348541, lng: 107.5866432582876 },
        { name: "Sumur Bandung", lat: -6.9144423016179, lng: 107.6137584679775 },
        { name: "Ujung Berung", lat: -6.9087528237541, lng: 107.7045057495781 }
    ];

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

    // Create Google Maps style marker icon
    const createGoogleMapsStyleIcon = () => {
        return L.divIcon({
            className: 'google-maps-marker',
            html: `
                <div style="
                    position: relative;
                    width: 24px;
                    height: 36px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                ">
                    <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
                        <!-- Drop shadow -->
                        <ellipse cx="12" cy="34" rx="6" ry="2" fill="rgba(0,0,0,0.2)" />
                        <!-- Main marker body -->
                        <path d="M12 0C5.383 0 0 5.383 0 12c0 9 12 24 12 24s12-15 12-24C24 5.383 18.617 0 12 0z" 
                              fill="#EA4335" 
                              stroke="#FFFFFF" 
                              stroke-width="1"/>
                        <!-- Inner white circle -->
                        <circle cx="12" cy="12" r="6" fill="#FFFFFF"/>
                        <!-- Inner colored dot -->
                        <circle cx="12" cy="12" r="3" fill="#EA4335"/>
                    </svg>
                </div>
            `,
            iconSize: [24, 36],
            iconAnchor: [12, 36],
            popupAnchor: [0, -36]
        });
    };

    // Fetch both kecamatan boundaries and RTH data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Starting to fetch map data...');

                // Fetch kecamatan boundaries
                console.log('Fetching kecamatan boundaries...');
                const kecamatanResponse = await publicAxios.get('/api/kecamatan/public');
                console.log('Kecamatan data received:', kecamatanResponse.data);
                setGeoData(kecamatanResponse.data);

                // Fetch RTH data - menggunakan endpoint /public
                console.log('Fetching RTH data from public endpoint...');
                const rthResponse = await publicAxios.get('/api/rth-kecamatan/public');
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
            fillOpacity: 0.3 // Reduced opacity so markers are more visible
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

    // Generate tooltip content for GeoJSON
    const createTooltipContent = (feature) => {
        const kecamatanName = feature.properties.name || 'Unknown';

        if (!feature.properties.rthData) {
            return `${kecamatanName} (Data tidak tersedia)`;
        }

        const rthData = feature.properties.rthData;
        const clusterName = getClusterName(rthData.cluster);

        return `${kecamatanName} (${clusterName})`;
    };

    // Function to handle each feature (onEachFeature) for GeoJSON
    const onEachFeature = (feature, layer) => {
        // Create tooltip content
        const tooltipContent = createTooltipContent(feature);

        // Bind tooltip for hover
        layer.bindTooltip(tooltipContent);

        // Add event listeners for hover effects
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#555',
                    dashArray: '',
                    fillOpacity: 0.5
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getFeatureStyle(feature));
            }
        });
    };

    // Create detailed popup content for markers
    const createMarkerPopupContent = (kecamatanName, rthInfo) => {
        if (!rthInfo) {
            return `
            <div class="rth-popup">
                <h3 class="text-lg font-bold mb-1">Kecamatan ${kecamatanName}</h3>
                <div class="text-sm text-gray-600 mb-2">Data RTH tidak tersedia</div>
            </div>`;
        }

        const rthPercentage = rthInfo.luas_kecamatan > 0
            ? (rthInfo.total_rth / rthInfo.luas_kecamatan) * 100
            : 0;

        // Get color based on cluster
        let clusterColor;
        switch (rthInfo.cluster) {
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

        const clusterName = getClusterName(rthInfo.cluster);

        return `
        <div class="rth-popup">
            <h3 class="text-lg font-bold mb-1">Kecamatan ${kecamatanName}</h3>
            <div class="text-sm text-gray-600 mb-2">Informasi Ruang Terbuka Hijau</div>
            
            <table class="w-full text-sm">
                <tr>
                    <td class="font-semibold pr-2">Total RTH:</td>
                    <td>${rthInfo.total_rth?.toFixed(2) || '0'} ha</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">Luas Taman:</td>
                    <td>${rthInfo.luas_taman?.toFixed(2) || '0'} ha</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">Luas Pemakaman:</td>
                    <td>${rthInfo.luas_pemakaman?.toFixed(2) || '0'} ha</td>
                </tr>
                <tr>
                    <td class="font-semibold pr-2">Luas Kecamatan:</td>
                    <td>${rthInfo.luas_kecamatan?.toFixed(0) || '0'} ha</td>
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

    // Get RTH data for a specific kecamatan
    const getRthDataForKecamatan = (kecamatanName) => {
        if (!rthData || !Array.isArray(rthData)) return null;

        return rthData.find(item =>
            item.kecamatan &&
            item.kecamatan.toLowerCase().trim() === kecamatanName.toLowerCase().trim()
        );
    };

    // Normalize kecamatan name for matching
    const normalizeKecamatanName = (name) => {
        return name.toLowerCase().trim()
            .replace(/bojongloa/g, 'bojongloa') // Unified name
            .replace(/bojonglea/g, 'bojongloa') // Handle old naming
            .replace(/cibeunying/g, 'cibeunying');
    };

    // Get marker data with RTH info
    const getMarkersWithRthData = () => {
        if (!rthData) return [];

        return kecamatanCoordinates.map(coord => {
            // Try to find matching RTH data
            const normalizedCoordName = normalizeKecamatanName(coord.name);
            const rthInfo = rthData.find(item => {
                if (!item.kecamatan) return false;
                const normalizedRthName = normalizeKecamatanName(item.kecamatan);

                // Exact match first
                if (normalizedRthName === normalizedCoordName) return true;

                // Handle special cases
                if (normalizedCoordName === 'ujung berung' && normalizedRthName.includes('ujung berung')) return true;
                if (normalizedCoordName === 'sukajadi' && normalizedRthName.includes('sukajadi')) return true;
                if (normalizedCoordName === 'sukasari' && normalizedRthName.includes('sukasari')) return true;

                // Partial match for similar names
                return normalizedRthName.includes(normalizedCoordName) ||
                    normalizedCoordName.includes(normalizedRthName);
            });

            return {
                ...coord,
                rthData: rthInfo,
                hasData: !!rthInfo
            };
        });
    };

    // Custom Legend component
    const MapLegend = () => {
        return (
            <div className="leaflet-bottom leaflet-right" style={{ zIndex: 999 }}>
                <div className="leaflet-control leaflet-bar bg-white p-2 shadow-md rounded-md m-4" style={{ minWidth: '300px' }}>
                    <h4 className="font-bold text-sm mb-2">Legenda Cluster RTH</h4>
                    <div className="space-y-1 mb-3">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-600 mr-2 rounded-full"></div>
                            <span className="text-xs">Cluster 2 (RTH Tinggi)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-400 mr-2 rounded-full"></div>
                            <span className="text-xs">Cluster 1 (RTH Menengah)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-600 mr-2 rounded-full"></div>
                            <span className="text-xs">Cluster 0 (RTH Rendah)</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-400 mr-2 rounded-full"></div>
                            <span className="text-xs">Data tidak tersedia</span>
                        </div>
                    </div>
                    <hr className="my-2" />
                    <div className="text-xs text-gray-500">
                        • Klik marker merah untuk detail RTH<br />
                        • Hover area untuk info singkat<br />
                        • Marker bergaya Google Maps
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

    const markersWithRthData = getMarkersWithRthData();

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={[-6.906685589692674, 107.61551919297135]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* GeoJSON Layer for Kecamatan Boundaries */}
                {mergedData && (
                    <GeoJSON
                        data={mergedData}
                        style={getFeatureStyle}
                        onEachFeature={onEachFeature}
                    />
                )}

                {/* Markers for each Kecamatan */}
                {markersWithRthData.map((marker, index) => (
                    <Marker
                        key={`marker-${index}`}
                        position={[marker.lat, marker.lng]}
                        icon={createGoogleMapsStyleIcon()}
                    >
                        <Popup
                            maxWidth={320}
                            className="custom-popup"
                        >
                            <div dangerouslySetInnerHTML={{
                                __html: createMarkerPopupContent(marker.name, marker.rthData)
                            }} />
                        </Popup>
                    </Marker>
                ))}

                <MapLegend />
            </MapContainer>

            {/* Additional Info Panel */}
            <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-1000 max-w-xs">
                <h4 className="font-bold text-sm mb-1">Peta RTH Kota Bandung</h4>
                <p className="text-xs text-gray-600">
                    Total {markersWithRthData.length} kecamatan dengan {markersWithRthData.filter(m => m.hasData).length} data RTH tersedia
                </p>
                <div className="mt-2 text-xs">
                    <span className="text-green-600 font-medium">
                        {markersWithRthData.filter(m => m.rthData?.cluster === 'cluster_2').length} RTH Tinggi
                    </span> •
                    <span className="text-yellow-600 font-medium ml-1">
                        {markersWithRthData.filter(m => m.rthData?.cluster === 'cluster_1').length} RTH Menengah
                    </span> •
                    <span className="text-red-600 font-medium ml-1">
                        {markersWithRthData.filter(m => m.rthData?.cluster === 'cluster_0').length} RTH Rendah
                    </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Klik marker merah untuk detail kecamatan
                </div>
            </div>
        </div>
    );
};

export default BandungMap;