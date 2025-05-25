// LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PureCityIllustration from '../components/PureCityIllustration';

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section dengan SVG Full Screen */}
            <section className="relative text-white h-screen w-full flex items-center justify-center overflow-hidden">
                {/* SVG sebagai background full screen yang tidak menutupi navbar */}
                <div className="absolute inset-0 w-full h-full z-0">
                    <div className="w-full h-full">
                        <PureCityIllustration />
                    </div>
                </div>

                {/* Overlay gelap */}
                <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

                {/* Konten di atas gambar */}
                <div className="relative max-w-7xl mx-auto px-4 py-36 sm:px-6 lg:px-8 flex flex-col items-center z-20">
                    <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
                        Bandung Green Spaces
                    </h1>
                    <p className="text-xl md:text-2xl text-center max-w-5xl mb-10 font-semibold">
                        Sistem Informasi Geografis Pemetaan Ruang Terbuka Hijau Di Kota Bandung
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/peta" className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-10 rounded-lg shadow-lg transition-all duration-300 text-center text-md">
                            Explore Map
                        </Link>
                    </div>
                </div>
            </section>

            {/* Informasi RTH Section - Berbeda dari referensi */}
            <section className="py-16 bg-gray-100 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-green-700 mb-10">
                        RUANG TERBUKA HIJAU KOTA BANDUNG
                    </h2>

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Kolom Kiri - Kategori RTH */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-green-600">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-green-700 mb-4">
                                    Ruang Terbuka Hijau Itu Apa?
                                </h3>
                                <div className="mb-6 h-60 overflow-hidden rounded-lg">
                                    <img
                                        src="https://www.rumah123.com/seo-cms/assets/taman_balai_kota_bandung_01d494b9ec/taman_balai_kota_bandung_01d494b9ec.jpg"
                                        alt="Taman Kota Bandung"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start">
                                        <span>Ruang terbuka adalah area yang dirancang untuk memenuhi kebutuhan masyarakat akan tempat berkumpul dan beraktivitas di luar ruangan. Ketika banyak orang berkumpul dan berinteraksi, beragam kegiatan dapat terwujud di ruang publik tersebut. Ruang terbuka hijau diartikan sebagai kawasan yang bersifat terbuka dan ditumbuhi tanaman, baik yang tumbuh secara alami maupun yang ditanam dengan sengaja. Ruang terbuka hijau dapat dibagi menjadi dua kategori, yaitu publik dan privat.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Kolom Kanan - Peta Sebaran RTH */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-blue-600">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-blue-700 mb-4">
                                    Kondisi RTH Kota Bandung
                                </h3>
                                <div className="mb-6 h-60 overflow-hidden rounded-lg">
                                    <img
                                        src="https://i2.wp.com/blog.tripcetera.com/id/wp-content/uploads/2020/05/lensaridwankamil_96581275_529003741311511_6037570312047923743_n-1024x1024.jpg"
                                        alt="Peta RTH Bandung"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-gray-700 space-y-4">
                                    <p>
                                        Saat ini, Kota Bandung memiliki sebaran RTH Publik yang belum merata di seluruh wilayah kota. Data tahun 2023 menunjukkan bahwa:
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 my-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-blue-700">2.17%</p>
                                            <p className="text-sm text-gray-600">Total RTH Publik</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-green-700">20%</p>
                                            <p className="text-sm text-gray-600">Target RTH Publik</p>
                                        </div>
                                    </div>
                                    <p>
                                        Melalui pemetaan SIG, kami mengidentifikasi area potensial pengembangan RTH Publik untuk mencapai target minimal 20% sesuai Undang-Undang Penataan Ruang.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;