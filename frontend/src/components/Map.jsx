// frontend/src/components/Map.jsx - Fixed dengan loading toast dismiss yang benar
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { API_BASE_URL, publicAxios } from '../config';
import { showToast } from '../utils/toast';
import { toast } from 'react-hot-toast'; // Import toast untuk dismiss

const BandungMap = () => {
    // State untuk data GeoJSON kecamatan dan data RTH
    const [geoData, setGeoData] = useState(null);
    const [rthData, setRthData] = useState(null);
    const [mergedData, setMergedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapReady, setMapReady] = useState(false);

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

    // Create custom marker icon
    const createCustomMarkerIcon = () => {
        return L.icon({
            iconUrl: '/marker-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: null
        });
    };

    // Fetch both kecamatan boundaries and RTH data
    useEffect(() => {
        const fetchData = async () => {
            const loadingToast = showToast.loading('Memuat data peta...');

            try {
                setLoading(true);
                setError(null);

                console.log('Starting to fetch map data...');

                // Fetch kecamatan boundaries
                const kecamatanResponse = await publicAxios.get('/api/kecamatan/public');
                setGeoData(kecamatanResponse.data);

                // Fetch RTH data
                const rthResponse = await publicAxios.get('/api/rth-kecamatan/public');
                setRthData(rthResponse.data);

                // Simulate delay untuk better UX
                await new Promise(resolve => setTimeout(resolve, 500));

                // FIXED: Dismiss loading toast sebelum menampilkan success toast
                toast.dismiss(loadingToast);

                // Gunakan pesan yang berbeda dari DataPage untuk menghindari duplikasi
                showToast.success('Peta interaktif siap digunakan!');
                setLoading(false);
                setMapReady(true);

            } catch (err) {
                console.error('Error fetching map data:', err);

                // FIXED: Dismiss loading toast jika error
                toast.dismiss(loadingToast);

                // Specific error messages
                if (err.response?.status === 404) {
                    setError('Data peta tidak ditemukan');
                    showToast.error('Data peta tidak ditemukan');
                } else if (err.response?.status >= 500) {
                    setError('Server sedang bermasalah. Silakan coba lagi nanti.');
                    showToast.error('Server bermasalah. Coba lagi nanti.');
                } else if (!navigator.onLine) {
                    setError('Tidak ada koneksi internet');
                    showToast.error('Periksa koneksi internet Anda');
                } else {
                    setError(`Gagal memuat data peta: ${err.message}`);
                    showToast.error('Gagal memuat peta. Silakan refresh halaman.');
                }

                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Merge GeoJSON and RTH data when both are available
    useEffect(() => {
        if (geoData && rthData && Array.isArray(geoData.features) && Array.isArray(rthData)) {
            // Create a mapping of kecamatan names to RTH data
            const rthByKecamatan = {};
            rthData.forEach(item => {
                if (item.kecamatan) {
                    const normalizedName = item.kecamatan.toLowerCase().trim();
                    rthByKecamatan[normalizedName] = item;
                }
            });

            // Create a new GeoJSON object with merged data
            const mergedGeoJSON = {
                type: 'FeatureCollection',
                features: geoData.features.map(feature => {
                    const featureName = (feature.properties.name || '').toLowerCase().trim();
                    const rthInfo = rthByKecamatan[featureName] || null;

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

            setMergedData(mergedGeoJSON);
        }
    }, [geoData, rthData]);

    // Get color based on cluster
    const getColor = (feature) => {
        if (!feature.properties.rthData) {
            return '#CCCCCC';
        }

        const rthData = feature.properties.rthData;
        switch (rthData.cluster) {
            case 'cluster_0':
                return '#E53E3E';
            case 'cluster_1':
                return '#F6E05E';
            case 'cluster_2':
                return '#38A169';
            default:
                return '#CCCCCC';
        }
    };

    // Style function for GeoJSON
    const getFeatureStyle = (feature) => {
        return {
            fillColor: getColor(feature),
            weight: 1,
            opacity: 1,
            color: '#333',
            dashArray: '0.5',
            fillOpacity: 0.5
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

    // Function to handle each feature
    const onEachFeature = (feature, layer) => {
        const tooltipContent = createTooltipContent(feature);
        layer.bindTooltip(tooltipContent);

        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#555',
                    dashArray: '',
                    fillOpacity: 0.7
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(getFeatureStyle(feature));
            }
        });
    };

    // Create popup content for markers
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

    // Normalize kecamatan name for matching
    const normalizeKecamatanName = (name) => {
        return name.toLowerCase().trim()
            .replace(/bojongloa/g, 'bojongloa')
            .replace(/bojonglea/g, 'bojongloa')
            .replace(/cibeunying/g, 'cibeunying')
            .replace(/bandung wetan/g, 'bandung timur')  // Tambahan
            .replace(/bandung kulon/g, 'bandung barat')   // Tambahan
            .replace(/ujung berung/g, 'ujungberung')      // Tambahan
            .replace(/\s+/g, ' ')  // Multiple spaces jadi single space
            .trim();
    };

    // Get marker data with RTH info
    const getMarkersWithRthData = () => {
        if (!rthData) return [];

        return kecamatanCoordinates.map(coord => {
            const normalizedCoordName = normalizeKecamatanName(coord.name);
            const rthInfo = rthData.find(item => {
                if (!item.kecamatan) return false;
                const normalizedRthName = normalizeKecamatanName(item.kecamatan);

                if (normalizedRthName === normalizedCoordName) return true;
                if (normalizedCoordName === 'ujung berung' && normalizedRthName.includes('ujung berung')) return true;
                if (normalizedCoordName === 'sukajadi' && normalizedRthName.includes('sukajadi')) return true;
                if (normalizedCoordName === 'sukasari' && normalizedRthName.includes('sukasari')) return true;

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
                        • Klik marker biru untuk detail RTH<br />
                        • Hover area untuk info singkat<br />
                    </div>
                </div>
            </div>
        );
    };

    // Error retry handler
    const handleRetry = () => {
        setError(null);
        setLoading(true);
        window.location.reload();
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                    <p className="mt-2">Loading peta...</p>
                </div>
            </div>
        );
    }

    // Error state with retry option
    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center p-4">
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 max-w-md">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="font-bold mb-2 text-lg">Gagal Memuat Peta</h3>
                        <p className="text-sm mb-4">{error}</p>
                        <div className="space-y-2">
                            <button
                                onClick={handleRetry}
                                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                            >
                                Coba Lagi
                            </button>
                            <button
                                onClick={() => window.location.href = '/data'}
                                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                            >
                                Lihat Data Tabel
                            </button>
                        </div>
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
                className="z-0"
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
                        icon={createCustomMarkerIcon()}
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
                    Klik marker biru untuk detail kecamatan
                </div>
            </div>
        </div>
    );
};

export default BandungMap;