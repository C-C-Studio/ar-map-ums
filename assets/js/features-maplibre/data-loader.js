// File: data-loader.js

import { state } from './state.js';
import { handleRouteRequest } from './navigation.js';

const allLocationsList = document.getElementById('all-locations-list');

// --- 1. HELPER BARU: KHUSUS MEMBUAT MARKER DI PETA ---
function createMarker(map, lokasi) {
    // Jangan buat marker jika ada flag hideMarker (opsional)
    // if (lokasi.hideMarker) return; 

    const popupHTML = `
        <div class="bg-white rounded-lg shadow-md p-3 max-w-xs">
            <h3 class="font-bold text-gray-900">${lokasi.nama}</h3>
            <p class="text-sm text-gray-600">${lokasi.deskripsi}</p>
            <button class="route-btn-popup w-full mt-2 bg-blue-500 text-white text-sm font-semibold py-1 px-3 rounded" 
                    data-lat="${lokasi.lat}" 
                    data-lon="${lokasi.lon}" 
                    data-nama="${lokasi.nama}"
                    data-desc="${lokasi.deskripsi}">
                <i class="fas fa-route mr-1"></i> Rute ke sini
            </button>
        </div>`;

    const popup = new maplibregl.Popup({ offset: 25, closeButton: false, className: 'custom-popup' })
        .setHTML(popupHTML);

    new maplibregl.Marker({ color: "#DC2626" }) // Warna Merah
        .setLngLat([lokasi.lon, lokasi.lat])
        .setPopup(popup)
        .addTo(map);

    popup.on('open', () => { state.activePopup = popup; });
    popup.on('close', () => { if (state.activePopup === popup) state.activePopup = null; });
}

// --- 2. HELPER: MEMBUAT HTML LIST ITEM (UI) ---
function createLocationListItem(lokasi, isChild = false) {
    const itemDiv = document.createElement('div');
    
    // Styling Base
    let baseClass = 'location-item rounded-xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden transition-all';
    
    // Beda warna untuk Anak vs Induk
    if (isChild) {
        baseClass += ' child-item'; 
    } else {
        baseClass += ' bg-[#1f3a5f]'; 
    }
    
    itemDiv.className = baseClass;
    
    // Metadata untuk Search Engine
    itemDiv.dataset.nama = lokasi.nama; 
    itemDiv.dataset.lat = lokasi.lat;
    itemDiv.dataset.lon = lokasi.lon;
    itemDiv.dataset.desc = lokasi.deskripsi;
    itemDiv.dataset.isChild = isChild; 

    // Logika Icon
    let iconContent;
    const iconType = lokasi.icon ? lokasi.icon.toLowerCase() : '';

    if (iconType === 'mosque') {
        iconContent = '<i class="fas fa-mosque text-lg"></i>';
    } else if (iconType === 'building' || iconType === 'kantor') {
        iconContent = '<i class="fas fa-building text-lg"></i>';
    } else if (iconType === 'code') {
        iconContent = '<i class="fas fa-laptop-code text-lg"></i>';
    } else if (iconType === 'bullhorn') {
        iconContent = '<i class="fas fa-bullhorn text-lg"></i>';
    } else {
        const letter = (lokasi.icon && lokasi.icon.length <= 2) 
                       ? lokasi.icon.toUpperCase() 
                       : (lokasi.nama.charAt(0).toUpperCase() || 'L');
        iconContent = `<span class="text-xl">${letter}</span>`;
    }
    
    itemDiv.innerHTML = `
        <div class="flex-shrink-0 w-10 h-10 rounded-full ${isChild ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-gray-600'} flex items-center justify-center font-bold shadow-sm">
            ${iconContent} 
        </div>
        
        <div class="flex-grow min-w-0 flex flex-col gap-0.5 w-[55%]">
            <div class="marquee-container">
                <h3 class="marquee-content text-white font-semibold text-base">
                    ${lokasi.nama}
                </h3>
            </div>
            <div class="marquee-container">
                <p class="marquee-content text-gray-300 text-sm">
                    ${lokasi.deskripsi}
                </p>
            </div>
        </div>

        <div class="flex-shrink-0 flex gap-2 z-10 pl-2">
            <button class="location-btn w-9 h-9 bg-gray-600/50 text-white rounded-lg flex items-center justify-center hover:bg-green-600 active:scale-95 transition-all" title="Lihat Lokasi">
                <i class="fas fa-location-dot"></i>
            </button>

            <button class="route-btn w-9 h-9 bg-gray-600/50 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all" title="Buat Rute">
                <i class="fas fa-route"></i>
            </button>
        </div>
    `;
    return itemDiv;
}

// --- 3. FUNGSI UTAMA LOAD DATA ---
export function loadMapData(map) {
    // A. Muat Data Lokasi (Marker & List)
    fetch('assets/data/location.json')
        .then(response => response.json())
        .then(data => {
            if (state.allLocationData) state.allLocationData = data;
            allLocationsList.innerHTML = ''; 
            
            data.forEach(parentLokasi => {
                // 1. Buat Marker untuk Induk
                createMarker(map, parentLokasi);

                // 2. Buat Struktur List Accordion
                const groupDiv = document.createElement('div');
                groupDiv.className = 'location-group mb-3';

                // Buat Item Induk
                const parentItem = createLocationListItem(parentLokasi, false);
                
                // Cek Anak
                const hasChildren = parentLokasi.sub_locations && parentLokasi.sub_locations.length > 0;
                let childrenContainer = null;

                if (hasChildren) {
                    // Tombol Toggle Arrow
                    const toggleBtn = document.createElement('button');
                    toggleBtn.className = 'w-9 h-9 text-white/70 hover:text-white rounded-lg flex items-center justify-center transition-colors mr-1 z-20';
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-down toggle-icon transition-transform duration-300"></i>';
                    
                    const actionContainer = parentItem.lastElementChild;
                    actionContainer.insertBefore(toggleBtn, actionContainer.firstChild);

                    // Container Anak
                    childrenContainer = document.createElement('div');
                    childrenContainer.className = 'children-container pl-2 pr-1'; 

                    parentLokasi.sub_locations.forEach(childLokasi => {
                        // A. Buat Marker untuk Anak (Biar Rame sesuai request)
                        createMarker(map, childLokasi);

                        // B. Buat Item List untuk Anak
                        const childItem = createLocationListItem(childLokasi, true);
                        childrenContainer.appendChild(childItem);
                    });

                    // Event Klik Toggle
                    toggleBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const icon = toggleBtn.querySelector('.toggle-icon');
                        if (childrenContainer.classList.contains('open')) {
                            childrenContainer.classList.remove('open');
                            icon.classList.remove('rotate');
                        } else {
                            childrenContainer.classList.add('open');
                            icon.classList.add('rotate');
                        }
                    });
                }

                groupDiv.appendChild(parentItem);
                if (childrenContainer) groupDiv.appendChild(childrenContainer);
                allLocationsList.appendChild(groupDiv);
            });
        })
        .catch(error => console.error('Error memuat lokasi:', error));

    // B. Muat Jalur Kustom (Path) - TIDAK BERUBAH
    fetch('assets/data/path.json')
        .then(response => response.json())
        .then(data => {
             const geojsonData = {
                type: 'FeatureCollection',
                features: data.map(jalur => ({
                    type: 'Feature',
                    properties: { nama: jalur.nama },
                    geometry: {
                        type: 'LineString',
                        coordinates: jalur.coordinates.map(coord => [coord[1], coord[0]])
                    }
                }))
            };

            map.addSource('custom-paths', { type: 'geojson', data: geojsonData });
            map.addLayer({
                id: 'custom-paths-layer',
                type: 'line',
                source: 'custom-paths',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#fff34c', 'line-width': 5, 'line-opacity': 1 }
            });

            map.on('click', 'custom-paths-layer', (e) => {
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<b class="text-black">${e.features[0].properties.nama}</b>`)
                    .addTo(map);
            });
        })
        .catch(error => console.error('Error memuat jalur:', error));
        
    // C. Global Listener Popup (Agar tombol 'Rute ke sini' di marker merah berfungsi)
    const mapContainer = document.getElementById('map');
    mapContainer.addEventListener('click', function(e) {
        if (e.target.matches('.route-btn-popup, .route-btn-popup *')) {
            const button = e.target.closest('.route-btn-popup');
            handleRouteRequest(button.dataset.lat, button.dataset.lon, button.dataset.nama, button.dataset.desc); 
            if (state.activePopup) {
                state.activePopup.remove();
                state.activePopup = null;
            }
        }
    });
}