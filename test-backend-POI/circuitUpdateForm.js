(function () {
    const apiBase = (typeof window !== 'undefined' && window.API_BASE) || 'http://localhost:8080/api';

    const el = (id) => document.getElementById(id);
    const getThemesBtn = el('getThemesBtn');
    const getPoisBtn = el('getPoisBtn');
    const previewPayloadBtn = el('previewPayloadBtn');
    
    const loadCircuitBtn = el('loadCircuitBtn');
    const updateCircuitBtn = el('updateCircuitBtn');

    const themesBox = el('themesBox');
    const poisBox = el('poisBox');
    const payloadBox = el('payloadBox');
    const circuitFields = el('circuitFields'); 

    let themesData = [];
    let poisData = [];
    let citiesData = [];
    let currentCircuit = null; 

    async function fetchJson(url) {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
            const data = await res.json().catch(() => ({ message: 'Erreur inconnue' }));
            throw new Error(data?.message || `HTTP ${res.status}`);
        }
        return res.json();
    }

    function populateSelect(selectId, data, valueField, textField, selectedValues = []) {
        const select = el(selectId);
        if (!select) return;
        
        select.innerHTML = '';
        
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Sélectionner...';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);
        
        data.forEach((item) => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];

            const selectedStrings = selectedValues.map(v => String(v));
            if (selectedStrings.includes(String(item[valueField]))) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    function showJson(target, obj) {
        target.textContent = JSON.stringify(obj, null, 2);
    }

    function buildPayload() {
        const cityId = el('cityId').value;
        const duration = Number(el('duration').value);
        const distance = Number(el('distance').value);
        const isActive = el('isActive').checked;
        const isPremium = el('isPremium').checked;

        const fr = { name: el('fr_name').value.trim(), description: el('fr_desc').value.trim() };
        const ar = { name: el('ar_name').value.trim(), description: el('ar_desc').value.trim() };
        const en = { name: el('en_name').value.trim(), description: el('en_desc').value.trim() };

        const themeSelect = el('themeIds');
        const themeIds = Array.from(themeSelect.selectedOptions).map(option => option.value).filter(Boolean);
        
        const poiSelect = el('poiIds');
        const poiIds = Array.from(poiSelect.selectedOptions).map(option => option.value).filter(Boolean);
        
        const imagePublicId = currentCircuit?.imagePublicId || null;

        return {
            cityId,
            duration,
            distance,
            isActive,
            isPremium,
            themeIds,
            poiIds,
            imagePublicId, 
            localizations: {
                ar,
                fr,
                en
            }
        };
    }

    
    const safeParse = (jsonString) => {
        if (!jsonString || typeof jsonString !== 'string') return {};
        
        try {
            const result = JSON.parse(jsonString);
            if (typeof result === 'object' && result !== null) {
                return result;
            }
        } catch (e) {
            if (typeof jsonString === 'object') return jsonString;
        }
        
        try {
            if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                const cleanString = jsonString.slice(1, -1); 
                return JSON.parse(cleanString);
            }
        } catch (e) {
             console.error('Erreur de parsing multiple pour la localisation:', jsonString, e);
        }
        
        return {};
    };

    async function loadCircuit(circuitId) {
        payloadBox.textContent = `Chargement du circuit ${circuitId}...`;
        circuitFields.style.display = 'none';

        try {
            const data = await fetchJson(`${apiBase}/circuits/${circuitId}`);
            currentCircuit = data?.data || data; 
            if (!currentCircuit) {
                throw new Error("Circuit non trouvé.");
            }

            el('cityId').value = currentCircuit.cityId || '';
            el('duration').value = currentCircuit.duration || '';
            el('distance').value = currentCircuit.distance || '';
            el('isActive').checked = currentCircuit.isActive;
            el('isPremium').checked = currentCircuit.isPremium;

            const frData = safeParse(currentCircuit.fr);
            const arData = safeParse(currentCircuit.ar);
            const enData = safeParse(currentCircuit.en);

            el('fr_name').value = frData.name || '';
            el('fr_desc').value = frData.description || frData.desc || ''; 
            el('ar_name').value = arData.name || '';
            el('ar_desc').value = arData.description || arData.desc || '';
            el('en_name').value = enData.name || '';
            el('en_desc').value = enData.description || enData.desc || '';

            const currentImageInfo = el('currentImageInfo');
            if (currentCircuit.image) {
                currentImageInfo.innerHTML = `Image actuelle: <a href="${currentCircuit.image}" target="_blank">Voir l'image</a> (ID: ${currentCircuit.imagePublicId})`;
            } else {
                currentImageInfo.textContent = 'Aucune image actuelle.';
            }

            const selectedThemeIds = currentCircuit.themes?.map(t => t.id) || [];
            populateSelect('themeIds', themesData, 'id', 'name', selectedThemeIds);
            
            const selectedPoiIds = currentCircuit.pois?.map(p => p.id) || [];
            populateSelect('poiIds', poisData, 'id', 'name', selectedPoiIds);
            
            circuitFields.style.display = 'block';
            payloadBox.textContent = `Circuit ${circuitId} chargé avec succès.`;

        } catch (e) {
            payloadBox.textContent = `Erreur chargement circuit: ${e.message}`;
        }
    }

    if (loadCircuitBtn) {
        loadCircuitBtn.addEventListener('click', () => {
            const circuitId = el('circuitId').value.trim();
            if (circuitId) {
                loadCircuit(circuitId);
            } else {
                alert("Veuillez entrer l'ID du circuit.");
            }
        });
    }

    if (updateCircuitBtn) {
        updateCircuitBtn.addEventListener('click', async () => {
            if (!currentCircuit) {
                payloadBox.textContent = 'Veuillez charger un circuit d\'abord.';
                return;
            }

            const circuitId = currentCircuit.id;
            const payload = buildPayload();
            showJson(payloadBox, payload);
            
            try {
                const formData = new FormData();
                
                formData.append('data', JSON.stringify(payload)); 
                
                const imageFile = el('image').files[0];
                if (imageFile) {

                    formData.append('image', imageFile); 
                }
                
                const res = await fetch(`${apiBase}/circuits/${circuitId}`, {
                    method: 'PUT', 
                    body: formData,
                    credentials: 'include'
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
                
                currentCircuit = data.data; 
                payloadBox.textContent = `Circuit ${circuitId} mis à jour avec succès:\n` + JSON.stringify(data, null, 2);
            } catch (e) {
                payloadBox.textContent = `Erreur mise à jour circuit: ${e.message}`;
            }
        });
    }

    if (getThemesBtn) {
        getThemesBtn.addEventListener('click', async () => {
            themesBox.textContent = 'Chargement des thèmes...';
            try {
                const data = await fetchJson(`${apiBase}/themes`);
                const list = Array.isArray(data?.data) ? data.data : data;
                
                themesData = list.map((t) => {
                    let name = 'Thème sans nom';
                    
                    const frData = safeParse(t.fr); 
                    
                    name = frData.name || frData.title || 'Thème sans nom';
                    return { id: t.id, name: name };
                });
                
                populateSelect('themeIds', themesData, 'id', 'name');
                showJson(themesBox, themesData);
            } catch (e) {
                themesBox.textContent = `Erreur chargement thèmes: ${e.message}`;
            }
        });
    }

    if (getPoisBtn) {
        getPoisBtn.addEventListener('click', async () => {
            poisBox.textContent = 'Chargement des POIs...';
            try {
                const data = await fetchJson(`${apiBase}/pois`);
                const list = Array.isArray(data?.pois) ? data.pois : (Array.isArray(data?.data) ? data.data : data);
                
                poisData = list.map((p) => {
                    let name = p.frLocalization?.name || 'POI sans nom';
                    return { id: p.id, name: name, cityId: p.cityId };
                });
                
                populateSelect('poiIds', poisData, 'id', 'name');
                showJson(poisBox, poisData);
            } catch (e) {
                poisBox.textContent = `Erreur chargement POIs: ${e.message}`;
            }
        });
    }
    
    async function loadCities() {
        try {
            const data = await fetchJson(`${apiBase}/city`);
            const list = Array.isArray(data?.data) ? data.data : data;
            citiesData = list.map(c => ({ id: c.id, name: c.name }));
            populateSelect('cityId', citiesData, 'id', 'name');
        } catch (e) {
            console.warn('Erreur chargement villes:', e.message);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadCities();
        getThemesBtn.click();
        getPoisBtn.click();
    });
})();