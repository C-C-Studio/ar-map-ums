import { handleRouteRequest } from './navigation.js';
import { state } from './state.js';

const openSearchBtn = document.getElementById('open-search-btn');
const closeSearchBtn = document.getElementById('close-search-btn');
const searchPanel = document.getElementById('search-panel');
const searchInput = document.getElementById('search-input');
const allLocationsList = document.getElementById('all-locations-list');
const bottomNavbar = document.getElementById('bottom-navbar');

let hideControlsTimer = null;

export function setupUI(map) {
    // --- Hitung & Jalankan Animasi ---
    const activateMarquee = () => {
        // Ambil semua elemen teks (h3 dan p) yang ada di dalam list
        const contents = document.querySelectorAll('.marquee-content');
        
        contents.forEach(content => {
            const container = content.parentElement;
            
            // Reset dulu agar perhitungan ulang akurat (jika resize layar)
            content.classList.remove('auto-scroll-active');
            content.style.removeProperty('--scroll-dist');
            content.style.removeProperty('animation-duration');
            
            // Hitung selisih lebar (Isi Teks - Lebar Container)
            const overflow = content.scrollWidth - container.clientWidth;

            // Jika teks lebih panjang dari wadahnya (+ toleransi 2px)
            if (overflow > 2) {
                // Set jarak scroll (negatif = ke kiri)
                content.style.setProperty('--scroll-dist', `-${overflow}px`);
                
                // Set durasi dinamis: semakin panjang teks, semakin pelan jalannya
                // Rumus: min 3 detik, ditambah 1 detik setiap 30px overflow
                const duration = 3 + (overflow / 30);
                content.style.animationDuration = `${duration}s`;

                // Jalankan animasi
                content.classList.add('auto-scroll-active');
            }
        });
    };

    // --- Search Panel Listener ---
    openSearchBtn.addEventListener('click', () => { 
        searchPanel.classList.remove('-translate-y-full');
        searchInput.focus();

        // PENTING: Jalankan perhitungan marquee setelah transisi panel selesai/dimulai
        // Kita beri jeda sedikit (300ms) agar panel sudah tampil dan punya lebar
        setTimeout(activateMarquee, 300);
    });

    closeSearchBtn.addEventListener('click', () => { 
        searchPanel.classList.add('-translate-y-full');
    });

    // --- Klik List Item ---
    allLocationsList.addEventListener('click', function(e) {
        const item = e.target.closest('.location-item');
        if (!item) return; 

        const locationBtn = e.target.closest('.location-btn'); // Tombol Locate
        const routeBtn = e.target.closest('.route-btn');       // Tombol Route
        const toggleBtn = e.target.closest('button');          // Cek toggle (chevron)

        if (toggleBtn && !locationBtn && !routeBtn) return;
        
        if (locationBtn) {
            map.flyTo({
                center: [item.dataset.lon, item.dataset.lat],
                zoom: 18
            });
        } else {
            const namaAsli = item.querySelector('h3').textContent; 
            // const deskripsiAsli = item.querySelector('p').textContent; // Ambil teks dari tag <p>
            const deskripsiAsli = item.dataset.desc;

            // PANGGIL handleRouteRequest dengan parameter lengkap
            handleRouteRequest(item.dataset.lat, item.dataset.lon, namaAsli, deskripsiAsli);
        }
        searchPanel.classList.add('-translate-y-full');
    });

    // --- Filter Search Listener (Smart Accordion) ---
    searchInput.addEventListener('keyup', function(e) { 
        const rawInput = e.target.value.toLowerCase();
        // Pecah input jadi array kata kunci (hapus spasi kosong)
        const keywords = rawInput.split(' ').filter(word => word.trim() !== '');
        
        // Ambil semua grup lokasi
        const groups = allLocationsList.getElementsByClassName('location-group');
        
        Array.from(groups).forEach(group => {
            // Ambil elemen-elemen penting dalam grup
            const parentItem = group.querySelector('.location-item:not(.child-item)');
            const childrenContainer = group.querySelector('.children-container');
            const childItems = group.querySelectorAll('.child-item'); // NodeList anak-anak
            const toggleIcon = parentItem.querySelector('.toggle-icon');

            // 1. Cek Apakah Parent Cocok?
            const parentName = parentItem.dataset.nama ? parentItem.dataset.nama.toLowerCase() : "";
            const isParentMatch = keywords.every(k => parentName.includes(k));

            // 2. Cek Apakah Anak Cocok?
            let isAnyChildMatch = false;

            childItems.forEach(child => {
                const childName = child.dataset.nama ? child.dataset.nama.toLowerCase() : "";
                // Cek match nama anak
                const isChildMatch = keywords.every(k => childName.includes(k));
                
                if (isChildMatch) {
                    isAnyChildMatch = true;
                    child.style.display = 'flex'; // Tampilkan anak ini
                } else {
                    // Jika user sedang mencari (keywords > 0), sembunyikan anak yg tidak cocok
                    // Jika search kosong, kembalikan ke flex (biar normal)
                    child.style.display = keywords.length > 0 ? 'none' : 'flex';
                }
            });

            // --- LOGIKA TAMPILAN AKHIR (DISPLAY LOGIC) ---

            if (keywords.length === 0) {
                // A. KONDISI RESET (Search Kosong) -> Kembali ke tampilan awal
                group.style.display = 'block';
                parentItem.style.display = 'flex';
                
                // Tutup Accordion (Reset)
                if (childrenContainer) {
                    childrenContainer.classList.remove('open');
                    if(toggleIcon) toggleIcon.classList.remove('rotate');
                    // Reset display semua anak agar siap dibuka manual
                    childItems.forEach(c => c.style.display = 'flex'); 
                }

            } else {
                // B. KONDISI SEDANG MENCARI
                if (isAnyChildMatch) {
                    // KASUS 1: Anak Ketemu (Misal: "Informatika")
                    // -> Tampilkan Grup, Tampilkan Parent, BUKA Accordion
                    group.style.display = 'block';
                    parentItem.style.display = 'flex';
                    
                    if (childrenContainer) {
                        childrenContainer.classList.add('open'); // <--- INI KUNCINYA
                        if(toggleIcon) toggleIcon.classList.add('rotate');
                    }

                } else if (isParentMatch) {
                    // KASUS 2: Parent Ketemu (Misal: "Gedung J"), tapi user tidak cari anak
                    // -> Tampilkan Grup, tapi BIARKAN Accordion tertutup (rapi)
                    group.style.display = 'block';
                    parentItem.style.display = 'flex';
                    
                    if (childrenContainer) {
                        childrenContainer.classList.remove('open'); 
                        if(toggleIcon) toggleIcon.classList.remove('rotate');
                        // Reset anak-anak agar kalau dibuka manual isinya ada
                        childItems.forEach(c => c.style.display = 'flex');
                    }

                } else {
                    // KASUS 3: Tidak ada yang cocok -> Sembunyikan satu grup
                    group.style.display = 'none';
                }
            }
        });

        // Jalankan animasi teks berjalan (marquee) untuk item yang baru muncul
        setTimeout(activateMarquee, 100);
    });

    // --- Navbar Auto Hide ---
    map.once('idle', () => {
        map.on('movestart', hideMapControls);
    });
    map.on('moveend', function() {
        clearTimeout(hideControlsTimer);
        hideControlsTimer = setTimeout(showMapControls, 1000);
    });
}

function hideMapControls() {
    if (bottomNavbar) {
        clearTimeout(hideControlsTimer);
        bottomNavbar.classList.add('translate-y-full');
    }
}

function showMapControls() {
    if (state.isNavigating || state.wasNavigating || state.isPreviewingRoute) return;

    if (bottomNavbar) {
        bottomNavbar.classList.remove('translate-y-full');
    }
}