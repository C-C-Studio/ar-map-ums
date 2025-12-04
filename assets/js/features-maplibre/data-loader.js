// File: data-loader.js

import { state } from './state.js';
import { handleRouteRequest } from './navigation.js';

const allLocationsList = document.getElementById('all-locations-list');

function createMarker(map, lokasi) {
    // ... (Kode createMarker Anda tetap sama)
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

    new maplibregl.Marker({ color: "#DC2626" })
        .setLngLat([lokasi.lon, lokasi.lat])
        .setPopup(popup)
        .addTo(map);

    popup.on('open', () => { state.activePopup = popup; });
    popup.on('close', () => { if (state.activePopup === popup) state.activePopup = null; });
}

function createLocationListItem(lokasi, isChild = false) {
    const itemDiv = document.createElement('div');
    
    // Styling Base
    // PENTING: p-4 tetap ada di sini sebagai default. 
    // Nanti untuk Parent yang punya anak, padding ini akan kita hapus lewat manipulasi DOM di loadMapData
    let baseClass = 'location-item rounded-xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden transition-all';
    
    if (isChild) {
        baseClass += ' child-item'; 
    } else {
        baseClass += ' bg-[#1f3a5f]'; 
    }
    
    itemDiv.className = baseClass;
    itemDiv.dataset.nama = lokasi.nama; 
    itemDiv.dataset.lat = lokasi.lat;
    itemDiv.dataset.lon = lokasi.lon;
    itemDiv.dataset.desc = lokasi.deskripsi;
    itemDiv.dataset.isChild = isChild; 

    // Logic Icon
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
        
        <div class="flex-grow min-w-0 flex flex-col gap-0.5 w-[45%]"> 
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
                    
                    // 1. Ubah Layout Parent jadi Column dan Hapus Padding Bawaan
                    parentItem.classList.remove('flex-row', 'items-center', 'p-4'); 
                    parentItem.classList.add('flex', 'flex-col', 'p-0', 'pb-0'); 

                    // 2. Bungkus Konten Lama (Icon, Teks, Tombol Aksi) ke Div baru di Atas
                    const topContent = document.createElement('div');
                    topContent.className = 'w-full flex items-center gap-4 p-4 pb-0'; // Padding dipindah ke sini
                    
                    // Pindahkan semua anak parentItem saat ini ke topContent
                    while (parentItem.firstChild) {
                        topContent.appendChild(parentItem.firstChild);
                    }
                    parentItem.appendChild(topContent);

                    // 3. Buat Tombol Toggle (Batang Bawah)
                    const toggleBtn = document.createElement('button');
                    // Style: Full width, height kecil, background agak gelap, rounded bottom
                    toggleBtn.className = 'w-full h-6 bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors rounded-b-xl cursor-pointer mt-0';
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-down toggle-icon text-white text-xs transition-transform duration-300"></i>';
                    
                    // Masukkan tombol toggle ke bagian bawah parentItem
                    parentItem.appendChild(toggleBtn);

                    // 4. Container Anak
                    childrenContainer = document.createElement('div');
                    childrenContainer.className = 'children-container pl-2 pr-1'; 

                    parentLokasi.sub_locations.forEach(childLokasi => {
                        createMarker(map, childLokasi);
                        const childItem = createLocationListItem(childLokasi, true);
                        childrenContainer.appendChild(childItem);
                    });

                    // 5. Event Klik Toggle
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