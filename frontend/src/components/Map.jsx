import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import { API_BASE_URL, publicAxios } from '../config';
import { showToast } from '../utils/toast';

const BandungMap = () => {
    // State management
    const [geoData, setGeoData] = useState(null);           // Data batas kecamatan (GeoJSON)
    const [rthData, setRthData] = useState(null);           // Data RTH dari database
    const [mergedData, setMergedData] = useState(null);     // Data gabungan GeoJSON + RTH
    const [loading, setLoading] = useState(true);           // Loading state
    const [error, setError] = useState(null);               // Error state
    const [mapReady, setMapReady] = useState(false);        // Map ready flag

    // Koordinat center point setiap kecamatan untuk marker placement
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

    // Fix Leaflet icon issues in React
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

    // Custom marker icon (blue marker)
    const createCustomMarkerIcon = () => {
        return L.icon({
            iconUrl: '/marker-blue.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: null
        });
    };

    // Fetch data dari API (GeoJSON + RTH data)
    useEffect(() => {
        const fetchData = async () => {
            const loadingToast = showToast.loading('Memuat data peta...');

            try {
                setLoading(true);
                setError(null);

                // Ambil data batas kecamatan dan data RTH
                const [kecamatanResponse, rthResponse] = await Promise.all([
                    publicAxios.get('/api/kecamatan/public'),
                    publicAxios.get('/api/rth-kecamatan/public')
                ]);

                setGeoData(kecamatanResponse.data);
                setRthData(rthResponse.data);

                // Delay untuk better UX
                await new Promise(resolve => setTimeout(resolve, 500));

                showToast.success('Peta berhasil dimuat!');
                setLoading(false);
                setMapReady(true);

            } catch (err) {
                console.error('Error fetching map data:', err);

                // Handle different error types
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

    // Merge GeoJSON dengan data RTH ketika kedua data ready
    useEffect(() => {
        if (geoData && rthData && Array.isArray(geoData.features) && Array.isArray(rthData)) {

            // Buat mapping nama kecamatan ke data RTH
            const rthByKecamatan = {};
            rthData.forEach(item => {
                if (item.kecamatan) {
                    const normalizedName = item.kecamatan.toLowerCase().trim();
                    rthByKecamatan[normalizedName] = item;
                }
            });

            // Gabungkan GeoJSON dengan data RTH
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

    // Warna berdasarkan cluster RTH
    const getColor = (feature) => {
        if (!feature.properties.rthData) return '#CCCCCC';

        const rthData = feature.properties.rthData;
        switch (rthData.cluster) {
            case 'cluster_0': return '#E53E3E';  // Merah - RTH Rendah
            case 'cluster_1': return '#F6E05E';  // Kuning - RTH Menengah
            case 'cluster_2': return '#38A169';  // Hijau - RTH Tinggi
            default: return '#CCCCCC';           // Abu-abu - Unknown
        }
    };

    // Style untuk GeoJSON features
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

    // Nama cluster untuk display
    const getClusterName = (cluster) => {
        switch (cluster) {
            case 'cluster_0': return 'Cluster 0 (RTH Rendah)';
            case 'cluster_1': return 'Cluster 1 (RTH Menengah)';
            case 'cluster_2': return 'Cluster 2 (RTH Tinggi)';
            default: return 'Tidak diketahui';
        }
    };

    // Konten tooltip untuk area hover
    const createTooltipContent = (feature) => {
        const kecamatanName = feature.properties.name || 'Unknown';

        if (!feature.properties.rthData) {
            return `${kecamatanName} (Data tidak tersedia)`;
        }

        const rthData = feature.properties.rthData;
        const clusterName = getClusterName(rthData.cluster);
        return `${kecamatanName} (${clusterName})`;
    };

    // Event handler untuk interaksi GeoJSON (hover effects)
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

    // Konten popup untuk markers
    const createMarkerPopupContent = (kecamatanName, rthInfo) => {
        if (!rthInfo) {
            return `
            <div class="rth-popup">
                <h3 class="text-lg font-bold mb-1">Kecamatan ${kecamatanName}</h3>
                <div class="text-sm text-gray-600 mb-2">Data RTH tidak tersedia</div>
            </div>`;
        }

        const rthPercentage = rthInfo.luas_kecamatan > 0
            ? ((rthInfo.total_rth / rthInfo.luas_kecamatan) * 100).toFixed(2)
            : '0.00';

        return `
        <div class="rth-popup">
            <h3>${kecamatanName}</h3>
            <table>
                <tr><td><strong>Luas Taman:</strong></td><td>${rthInfo.luas_taman.toFixed(3)} ha</td></tr>
                <tr><td><strong>Luas Pemakaman:</strong></td><td>${rthInfo.luas_pemakaman.toFixed(3)} ha</td></tr>
                <tr><td><strong>Total RTH:</strong></td><td>${rthInfo.total_rth.toFixed(3)} ha</td></tr>
                <tr><td><strong>Luas Kecamatan:</strong></td><td>${rthInfo.luas_kecamatan.toFixed(3)} ha</td></tr>
                <tr><td><strong>Persentase RTH:</strong></td><td>${rthPercentage}%</td></tr>
                <tr><td><strong>Cluster:</strong></td><td>${getClusterName(rthInfo.cluster)}</td></tr>
            </table>
        </div>`;
    };

    // Gabungkan koordinat dengan data RTH untuk markers
    const getMarkersWithRthData = () => {
        return kecamatanCoordinates.map(coordinate => {
            const rthInfo = rthData?.find(data =>
                data.kecamatan?.toLowerCase().trim() === coordinate.name.toLowerCase().trim()
            );

            return {
                ...coordinate,
                rthData: rthInfo || null,
                hasData: !!rthInfo
            };
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="h-full w-full relative bg-gray-100">
                <div className="animate-pulse bg-gray-200 h-full w-full rounded"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Memuat peta...</p>
                        <p className="text-sm text-gray-500">Mengambil data RTH dan batas kecamatan</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Peta</h3>
                    <p className="text-sm text-gray-600 mb-4">{error}</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
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
        );
    }

    // Legenda component
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

    const markersWithRthData = getMarkersWithRthData();

    return (
        <div className="h-full w-full relative">
            {/* Leaflet Map Container */}
            <MapContainer
                center={[-6.906685589692674, 107.61551919297135]}  // Center Bandung
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
                className="z-0"
            >
                {/* Base tile layer (OpenStreetMap) */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* GeoJSON layer untuk batas kecamatan */}
                {mergedData && (
                    <GeoJSON
                        data={mergedData}
                        style={getFeatureStyle}
                        onEachFeature={onEachFeature}
                    />
                )}

                {/* Markers untuk setiap kecamatan */}
                {markersWithRthData.map((marker, index) => (
                    <Marker
                        key={`marker-${index}`}
                        position={[marker.lat, marker.lng]}
                        icon={createCustomMarkerIcon()}
                    >
                        <Popup maxWidth={320} className="custom-popup">
                            <div dangerouslySetInnerHTML={{
                                __html: createMarkerPopupContent(marker.name, marker.rthData)
                            }} />
                        </Popup>
                    </Marker>
                ))}

                <MapLegend />
            </MapContainer>

            {/* Info panel */}
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