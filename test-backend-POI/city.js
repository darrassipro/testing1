const API_URL = 'http://localhost:8080/api/city'; // Assurez-vous que c'est le bon port et chemin
const cityListContainer = document.getElementById('cityList');
const createCityForm = document.getElementById('createCityForm');
const updateCityForm = document.getElementById('updateCityForm');
const updateModal = document.getElementById('updateModal');
const alertMessage = document.getElementById('alertMessage');

// --- Utility Functions ---

/**
 * Affiche un message d'alerte (succès ou erreur)
 * @param {string} message Le message à afficher
 * @param {string} type 'success' ou 'error'
 */
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `message ${type}`;
    alertMessage.style.display = 'block';
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}

// --- CRUD Operations ---

/**
 * Récupère et affiche toutes les villes.
 */
async function fetchCities() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (response.ok) {
            renderCities(result.data);
        } else {
            showAlert(`Erreur lors de la récupération des villes: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Erreur réseau/fetch:', error);
        showAlert('Erreur de connexion au serveur.', 'error');
    }
}

/**
 * Gère la création d'une ville.
 * @param {Event} e L'événement de soumission du formulaire
 */
async function handleCreateCity(e) {
    e.preventDefault();
    const formData = new FormData(createCityForm);
    
    // Le backend attend un multipart/form-data car il y a un fichier (req.file)
    // et des champs de texte (req.body)
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData // Fetch gère automatiquement le Content-Type: multipart/form-data
        });

        const result = await response.json();

        if (response.status === 201) {
            showAlert('Ville créée avec succès !', 'success');
            createCityForm.reset();
            fetchCities(); // Rafraîchir la liste
        } else {
            showAlert(`Échec de la création: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création de la ville:', error);
        showAlert('Erreur réseau lors de la création.', 'error');
    }
}

/**
 * Ouvre la modale de modification avec les données de la ville.
 * @param {object} city Les données de la ville
 */
function openUpdateModal(city) {
    document.getElementById('updateId').value = city.id;
    document.getElementById('modalCityName').textContent = city.name;
    document.getElementById('updateName').value = city.name || '';
    document.getElementById('updateNameAr').value = city.nameAr || '';
    document.getElementById('updateNameEn').value = city.nameEn || '';
    document.getElementById('updateCountry').value = city.country || '';
    document.getElementById('updateRadius').value = city.radius || '';
const coords = city.coordinates || {}; 

    // ✅ Remplir les champs de localisation en accédant à l'objet 'coords'
    document.getElementById('updateAddress').value = coords.address || '';
    // Correction des clés et de la gestion de l'undefined/null :
    document.getElementById('updateAdressAr').value = coords.addressAr || ''; 
    document.getElementById('updateAdressEn').value = coords.addressEn || '';
    document.getElementById('updateLatitude').value = coords.latitude || '';
    document.getElementById('updateLongitude').value = coords.longitude || '';                                                                                                                 
    document.getElementById('updateIsActive').value = String(city.isActive);

    
    const currentImage = document.getElementById('currentImage');
    if (city.image) {
        currentImage.src = city.image;
        currentImage.style.display = 'block';
    } else {
        currentImage.src = '';
        currentImage.style.display = 'none';
    }

    document.getElementById('updateImage').value = ''; // Réinitialiser le champ fichier
    updateModal.style.display = 'block';
}

/**
 * Ferme la modale de modification.
 */
function closeModal() {
    updateModal.style.display = 'none';
}

/**
 * Gère la mise à jour d'une ville.
 * @param {Event} e L'événement de soumission du formulaire
 */
async function handleUpdateCity(e) {
    e.preventDefault();
    const cityId = document.getElementById('updateId').value;
    const formData = new FormData(updateCityForm);
    
    // Enlever les champs vides de FormData pour éviter d'envoyer des valeurs nulles/vides
    // si l'utilisateur ne les a pas modifiées. Cependant, si le champ est vide (ex: name),
    // la valeur sera envoyée comme chaîne vide, ce qui est généralement bien pour PUT.
    // Pour les champs non inclus dans le formulaire (comme l'image si elle n'est pas changée), 
    // ils ne seront simplement pas dans le FormData.

    // Si le fichier image n'est pas sélectionné, retirez-le de FormData pour ne pas l'envoyer
    if (!formData.get('image') || !formData.get('image').name) {
        formData.delete('image');
    }

    try {
        const response = await fetch(`${API_URL}/${cityId}`, {
            method: 'PUT',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Ville mise à jour avec succès ! (L\'ancienne image Cloudinary a été supprimée si une nouvelle a été uploadée).', 'success');
            closeModal();
            fetchCities(); // Rafraîchir la liste
        } else {
            showAlert(`Échec de la mise à jour: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la ville:', error);
        showAlert('Erreur réseau lors de la mise à jour.', 'error');
    }
}

/**
 * Gère la suppression (logique) d'une ville.
 * @param {string} cityId L'ID de la ville à supprimer
 */
async function handleDeleteCity(cityId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ville? (Suppression logique + suppression image Cloudinary)')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${cityId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Ville supprimée avec succès (logiquement et image Cloudinary) !', 'success');
            fetchCities(); // Rafraîchir la liste
        } else {
            showAlert(`Échec de la suppression: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la ville:', error);
        showAlert('Erreur réseau lors de la suppression.', 'error');
    }
}

// --- Rendering ---

/**
 * Affiche la liste des villes dans le DOM.
 * @param {Array<object>} cities La liste des villes
 */
// city.js

// ... (votre code jusqu'à la section Rendering)

// --- Rendering ---

/**
 * Affiche la liste des villes dans le DOM.
 * @param {Array<object>} cities La liste des villes
 */
function renderCities(cities) {
    cityListContainer.innerHTML = '';
    if (cities.length === 0) {
        cityListContainer.textContent = 'Aucune ville trouvée.';
        return;
    }

    cities.forEach(city => {
        // ✅ Accès sécurisé à l'objet coordinates
        const coords = city.coordinates || {}; 
        
        // Fonction pour récupérer la valeur ou afficher 'N/A'
        const getValue = (key) => coords[key] ?? 'N/A';

        // ✅ Utiliser les clés correctes et l'accès sécurisé
        const address = getValue('address');
        const addressAr = getValue('addressAr'); // Correction de 'adressAr' en 'addressAr' dans l'accès
        const addressEn = getValue('addressEn'); // Correction de 'adressEn' en 'addressEn' dans l'accès
        const latitude = getValue('latitude');
        const longitude = getValue('longitude');

        const div = document.createElement('div');
        div.className = 'city-item';
        
        const imageHtml = city.image ? `<img src="${city.image}" alt="Image de ${city.name}">` : '[Pas d\'image]';

        div.innerHTML = `
            ${imageHtml}
            <div class="city-details">
                <strong>ID:</strong> ${city.id}<br>
                <strong>Nom (EN):</strong> ${city.nameEn} (Unicité: ${city.name})<br>
                <strong>Nom (AR):</strong> ${city.nameAr}<br>
                <strong>Pays:</strong> ${city.country}<br>
                <strong>Rayon:</strong> ${city.radius} | 
                <strong>Adresse:</strong> ${address} |
                <strong>Adresse (AR):</strong> ${addressAr} |
                <strong>Adresse (EN):</strong> ${addressEn} |
                <strong>Latitude:</strong> ${latitude} |
                <strong>Longitude:</strong> ${longitude} <br>
                <strong>Actif:</strong> ${city.isActive ? 'Oui ✅' : 'Non ❌'}
            </div>
            <div class="actions">
                <button onclick='openUpdateModal(${JSON.stringify(city)})'>Modifier</button> 
                <button style="background-color: #f44336;" onclick="handleDeleteCity('${city.id}')">Supprimer</button>
            </div>
        `;
        cityListContainer.appendChild(div);
    });
}

// --- Initialisation ---

document.addEventListener('DOMContentLoaded', () => {
    // Événements
    createCityForm.addEventListener('submit', handleCreateCity);
    updateCityForm.addEventListener('submit', handleUpdateCity);
    
    // Charger les villes au démarrage
    fetchCities();
});