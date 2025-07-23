Sistem Informasi Geografis Pemetaan Ruang Terbuka Hijau di Kota Bandung

🌐 Live Demo: https://www.bandung-rth.my.id/

📋 Deskripsi Proyek
Sistem Informasi Geografis (SIG) untuk visualisasi ruang terbuka hijau pada 30 kecamatan di Kota Bandung. Aplikasi ini menggunakan teknologi web modern dan mengintegrasikan data clustering dari KNIME untuk menampilkan distribusi RTH dalam bentuk peta choropleth interaktif.
Website ini telah berhasil di-hosting dan dapat diakses secara online melalui domain bandung-rth.my.id dengan implementasi HTTPS untuk keamanan komunikasi data.

🎯 Tujuan
Memvisualisasikan sebaran ruang terbuka hijau di 30 kecamatan Kota Bandung
Menyediakan analisis clustering RTH berdasarkan kepadatan
Memberikan akses mudah kepada masyarakat untuk melihat data RTH
Mendukung pengambilan keputusan terkait pengelolaan RTH

🚀 Fitur Utama
👥 Untuk User (Publik)

Landing Page: Informasi umum tentang aplikasi dan statistik RTH
Peta Interaktif: Visualisasi choropleth dengan 3 cluster RTH (Hijau=Tinggi, Kuning=Sedang, Merah=Rendah)
Detail Kecamatan: Pop-up informasi lengkap RTH per kecamatan dengan data taman dan pemakaman
Tabel Data: Data RTH dalam format tabel dengan fitur pencarian, filter, dan sorting
Export Data: Download data dalam format Excel untuk analisis lanjutan

🔐 Untuk Admin

Dashboard Admin: Interface manajemen dengan quick actions dan statistik
CRUD Operations: Tambah, edit, hapus data RTH dengan validasi
Import Data KNIME: Upload file Excel hasil analisis clustering dari KNIME
Authentication: Sistem login dengan JWT token dan session management
Data Management: Sinkronisasi otomatis data dari KNIME ke visualisasi web

🛠️ Teknologi yang Digunakan

Frontend

React.js - Library untuk UI
Vite - Build tool dan development server
Tailwind CSS - Framework CSS untuk styling
Leaflet - Library untuk peta interaktif
Axios - HTTP client

Backend

Node.js - Runtime JavaScript
Express.js - Web framework
MongoDB - Database NoSQL
Mongoose - ODM untuk MongoDB

Tools & Analytics

KNIME - Platform analisis data untuk clustering
Visual Studio Code - Code editor
Figma - Design tool
GitHub - Version control

📊 Data Clustering
Aplikasi ini mengintegrasikan hasil analisis clustering dari KNIME dengan 3 kategori:

Cluster 0 (Merah): RTH Rendah - Kecamatan dengan kepadatan RTH di bawah rata-rata
Cluster 1 (Kuning): RTH Sedang - Kecamatan dengan kepadatan RTH mendekati rata-rata
Cluster 2 (Hijau): RTH Tinggi - Kecamatan dengan kepadatan RTH tertinggi

🔐 Authentication
Admin Login

Sistem menggunakan JWT dengan expiry 24 jam untuk autentikasi admin
Password menggunakan bcrypt hashing dengan salt rounds 12
Implementasi token blacklist untuk logout yang aman
CORS dikonfigurasi khusus untuk domain bandung-rth.my.id

🧪 Testing
Black Box Testing

Skenario: 19 test cases dengan 30 responden
Hasil: 99.81% tingkat keberhasilan
MAPE: 1% (kategori "Sangat Akurat")

System Usability Scale (SUS)

Skor Rata-rata: 87.83
Kategori: A (Excellent)
Hasil: Kualitas fungsionalitas dan UX sangat baik

📈 API Endpoints
Public Endpoints

GET /api/kecamatan/public - Data boundaries kecamatan
GET /api/rth-kecamatan/public - Data RTH publik

Admin Endpoints (Require Authentication)

POST /api/auth/login - Admin login
GET /api/rth-kecamatan - Semua data RTH
POST /api/rth-kecamatan - Tambah data RTH
PUT /api/rth-kecamatan/:id - Update data RTH
DELETE /api/rth-kecamatan/:id - Hapus data RTH
POST /api/admin/upload-excel - Upload data hasil analisis KNIME

🌐 Deployment
Website Live: https://www.bandung-rth.my.id/

Developer: Akmal Azzary Megaputra
Institution: Universitas Padjadjaran

📞 Kontak
Website: https://www.bandung-rth.my.id/
Project Repository: https://github.com/username/sig-rth-bandung
Email: amegaputra@gmail.com
