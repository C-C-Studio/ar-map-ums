/*
=========================================
 FILE: geofence.js
 (Logika Pengecekan Radius Kampus)
=========================================
*/

// Aktifkan atau Nonaktifkan Pengecekan Radius Kampus
const IS_CAMPUS_CHECK_ENABLED = false;

// --- KONFIGURASI AREA KAMPUS ---
// 1. Tentukan Titik Pusat Kampus (LngLat MapLibre)
const CAMPUS_CENTER = new maplibregl.LngLat(110.7711, -7.5567);

// 2. Tentukan Radius (dalam METER)
const CAMPUS_RADIUS_METERS = 800; //meter

/**
 * Fungsi utama untuk mengecek apakah pengguna ada di dalam radius kampus.
 * @param {maplibregl.LngLat} userLngLat - Objek LngLat lokasi pengguna.
 * @returns {boolean} - True jika di dalam kampus, False jika di luar.
 */
function isUserOnCampus(userLngLat) {
  if (!IS_CAMPUS_CHECK_ENABLED) {
    console.log("Geofence: Check dinonaktifkan (Mode Development).");
    return true;
  }
  const distance = userLngLat.distanceTo(CAMPUS_CENTER);

  console.log(`Geofence: Jarak ke pusat kampus: ${distance} meter.`);

  return distance <= CAMPUS_RADIUS_METERS;
}