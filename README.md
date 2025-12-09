# 🗺️ AR Maps UMS - Campus Navigation System

![UMS Logo](assets/images/Resmi_Logo_UMS_White_FullText.png)

> **Sistem Navigasi Kampus Universitas Muhammadiyah Surakarta berbasis Web & Augmented Reality.**

[![Status](https://img.shields.io/badge/Status-Development-yellow)]()
[![Tech](https://img.shields.io/badge/Tech-WebXR%20%7C%20Three.js%20%7C%20MapLibre-blue)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

## 📖 Tentang Proyek

**AR Map UMS** adalah aplikasi web progresif (PWA) yang dirancang untuk membantu mahasiswa dan tamu menavigasi area kampus Universitas Muhammadiyah Surakarta. Aplikasi ini menggabungkan peta digital interaktif dengan teknologi **WebXR (Augmented Reality)** untuk memberikan panduan arah secara *real-time* langsung melalui kamera perangkat pengguna.

Sistem ini mendeteksi lokasi pengguna, menghitung rute terpendek, dan memproyeksikan panah navigasi 3D ke dunia nyata untuk memandu pengguna menuju gedung atau ruangan tujuan.

## ✨ Fitur Utama

### 📍 Peta Interaktif & Pencarian
* **Pencarian Cerdas:** Fitur pencarian lokasi dengan *accordion list* yang mengelompokkan lokasi induk dan sub-lokasi (misal: Gedung J -> Prodi Informatika).
* **Detail Lokasi:** *Pop-up* informasi gedung beserta deskripsi, ikon tipe lokasi, dan tombol aksi cepat "Rute ke Sini".

### 🧭 Navigasi & Routing
* **Routing Pejalan Kaki:** Perhitungan rute menggunakan Mapbox Directions API.
* **Snap-to-Road Algorithm:** Menggunakan **Turf.js** untuk memastikan posisi pengguna tetap "menempel" pada jalur yang valid, meningkatkan akurasi saat sinyal GPS melompat-lompat.
* **Estimasi Real-time:** Menampilkan sisa jarak (meter/km) dan estimasi waktu tempuh.

### 🕶️ Augmented Reality (AR) Mode
* **WebXR Integration:** Berbasis web (tanpa instalasi aplikasi) menggunakan Three.js.
* **Visual Guidance:**
    * **Nav Arrow:** Panah 3D yang melayang menunjuk ke arah tujuan.
    * **Turn Indicators:** Indikator belokan di layar (HUD) dan panah lantai 3D yang muncul otomatis saat mendekati tikungan.
* **Mini Map Overlay:** Peta kecil di sudut bawah layar saat mode AR aktif untuk orientasi spasial.
* **Safety Features:** Deteksi "Salah Arah" dan peringatan visual.

### 🛡️ Utilitas Lainnya
* **Geofencing:** Membatasi fitur navigasi hanya aktif ketika pengguna berada di dalam radius kampus UMS (Dapat dikonfigurasi).
* **Compass Smoothing:** Algoritma untuk memperhalus pergerakan jarum kompas dan kerucut arah pandang pengguna.

## 🛠️ Teknologi yang Digunakan

* **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN), JavaScript (ES Modules).
* **3D & AR:** [Three.js](https://threejs.org/), WebXR API, [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader).
* **Mapping Libraries:**
    * [MapLibre GL JS](https://maplibre.org/).
* **Geospatial Logic:** [Turf.js](https://turfjs.org/) (Jarak, Bearing, Snapping).
* **Data:** JSON (GeoJSON format untuk jalur dan lokasi).

## 📂 Struktur Proyek

```plaintext
ar-map-ums/
├── assets/
│   ├── 2DAssets/           # Aset gambar 2D (Panah UI, dll)
│   ├── 3DModel/            # Model 3D (GLB format: arrow, turn-arrow)
│   ├── data/
│   │   ├── location.json   # Database lokasi gedung/ruangan
│   │   └── path.json       # Jalur visual (GeoJSON)
│   ├── images/             # Logo UMS dan aset gambar lainnya
│   └── js/
│       ├── features-maplibre/  # Modul logika MapLibre (ES Modules)
│       │   ├── ar-navigation.js # Logika inti AR/Three.js
│       │   ├── navigation.js    # Logika routing & UI navigasi
│       │   ├── geolocation.js   # Logika GPS & Kompas
│       │   ├── data-loader.js   # Memuat data JSON ke Peta
│       │   ├── ui-controls.js   # Interaksi UI (Search, Navbar)
│       │   └── state.js         # State management global
│       ├── config.js       # Kunci API (Mapbox, MapTiler, Google)
│       ├── geofence*.js    # Logika radius kampus
├── index.html              # Halaman Landing / Beranda
├── maplibre.html           # Halaman Peta Utama (MapLibre)
