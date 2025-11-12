(function () {
    const apiBase = (typeof window !== 'undefined' && window.API_BASE) || 'http://localhost:8080/api';

    const el = (id) => document.getElementById(id);
    const getThemesBtn = el('getThemesBtn');
    const getPoisBtn = el('getPoisBtn');
    const previewPayloadBtn = el('previewPayloadBtn');
    const createCircuitBtn = el('createCircuitBtn');

    const themesBox = el('themesBox');
    const poisBox = el('poisBox');
    const payloadBox = el('payloadBox');

    // Données globales
    let themesData = [];
    let poisData = [];
    let citiesData = [];

    async function fetchJson(url) {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    function parseThemeIds(input) {
        if (!input) return [];
        return input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    function parsePoiEntries(input) {
        if (!input) return [];
        // format: ordre:uuid:temps
        return input
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((token) => {
                const [orderStr, poiId, timeStr] = token.split(':').map((t) => t && t.trim());
                const order = orderStr ? Number(orderStr) : undefined;
                const estimatedTime = timeStr ? Number(timeStr) : undefined;
                return { poiId, order, estimatedTime };
            })
            .filter((p) => p.poiId);
    }

    function populateSelect(selectId, data, valueField, textField) {
        const select = el(selectId);
        if (!select) {
            console.error('Select non trouvé:', selectId);
            return;
        }
        
        console.log('Population du select:', selectId, 'avec', data.length, 'éléments');
        console.log('Données:', data);
        
        // Vider le select
        select.innerHTML = '';
        
        // Ajouter l'option placeholder
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Sélectionner...';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);
        
        // Ajouter les options
        data.forEach((item, index) => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            select.appendChild(option);
            console.log(`Option ${index}:`, item[valueField], '->', item[textField]);
        });
        
        console.log('Select peuplé avec', select.options.length, 'options');
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

        // Récupérer les thèmes sélectionnés
        const themeSelect = el('themeIds');
        const themeIds = Array.from(themeSelect.selectedOptions).map(option => option.value).filter(Boolean);
        
        // Récupérer les POIs sélectionnés
        const poiSelect = el('poiIds');
        const selectedPois = Array.from(poiSelect.selectedOptions).map(option => option.value).filter(Boolean);

        return {
            cityId,
            duration,
            distance,
            isActive,
            isPremium,
            themeIds,
            poiIds: selectedPois,
            localizations: {
                ar,
                fr,
                en
            }
        };
    }

    function showJson(target, obj) {
        target.textContent = JSON.stringify(obj, null, 2);
    }

    if (getThemesBtn) {
        getThemesBtn.addEventListener('click', async () => {
            themesBox.textContent = 'Chargement des thèmes...';
            try {
                const data = await fetchJson(`${apiBase}/themes`);
                const list = Array.isArray(data?.data) ? data.data : data;
                themesData = list.map((t) => {
                    // Extraire le nom depuis le JSON fr
                    let name = 'Thème sans nom';
                    try {
                        if (t.fr && typeof t.fr === 'string') {
                            const frData = JSON.parse(t.fr);
                            name = frData.name || frData.title || 'Thème sans nom';
                        } else if (t.fr && typeof t.fr === 'object') {
                            name = t.fr.name || t.fr.title || 'Thème sans nom';
                        }
                    } catch (e) {
                        console.warn('Erreur parsing JSON thème:', e);
                        name = 'Thème sans nom';
                    }
                    
                    return { 
                        id: t.id, 
                        name: name,
                        fr: t.fr, 
                        en: t.en 
                    };
                });
                
                // Populer le select
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
                console.log('Réponse API POIs:', data);
                const list = Array.isArray(data?.pois) ? data.pois : (Array.isArray(data?.data) ? data.data : data);
                console.log('Liste POIs extraite:', list);
                poisData = list.map((p) => {
                    // Récupérer le nom depuis les localisations
                    let name = 'POI sans nom';
                    
                    // Essayer de récupérer depuis frLocalization (relation)
                    if (p.frLocalization && p.frLocalization.name) {
                        name = p.frLocalization.name;
                    }
                    // Sinon essayer depuis fr (champ direct)
                    else if (p.fr && typeof p.fr === 'object' && p.fr.name) {
                        name = p.fr.name;
                    }
                    // Sinon utiliser l'ID comme nom
                    else {
                        name = `POI ${p.id.substring(0, 8)}`;
                    }
                    
                    return { 
                        id: p.id, 
                        name: name,
                        fr: p.frLocalization?.name || 'Sans nom', 
                        cityId: p.cityId 
                    };
                });
                
                // Populer le select
                populateSelect('poiIds', poisData, 'id', 'name');
                showJson(poisBox, poisData);
            } catch (e) {
                poisBox.textContent = `Erreur chargement POIs: ${e.message}`;
            }
        });
    }

    if (previewPayloadBtn) {
        previewPayloadBtn.addEventListener('click', () => {
            const payload = buildPayload();
            showJson(payloadBox, payload);
        });
    }

    if (createCircuitBtn) {
        createCircuitBtn.addEventListener('click', async () => {
            const payload = buildPayload();
            showJson(payloadBox, payload);
            
            try {
                // Préparer FormData pour l'upload d'image
                const formData = new FormData();
                
                // Ajouter les données JSON
                formData.append('data', JSON.stringify(payload));
                
                // Ajouter l'image si sélectionnée
                const imageFile = el('image').files[0];
                if (imageFile) {
                    formData.append('image', imageFile);
                }
                
                const res = await fetch(`${apiBase}/circuits/create-with-image`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
                payloadBox.textContent = `Créé avec succès:\n` + JSON.stringify(data, null, 2);
            } catch (e) {
                payloadBox.textContent = `Erreur création circuit: ${e.message}`;
            }
        });
    }

    // Charger les villes au démarrage
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

    // Charger les villes au chargement de la page
    document.addEventListener('DOMContentLoaded', loadCities);
})();


