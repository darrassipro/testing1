// Configuration de l'API
const API_BASE_URL = 'http://localhost:8080/api/pois';

// Éléments du DOM
const form = document.getElementById('poiForm');
const previewBtn = document.getElementById('previewBtn');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const previewModal = document.getElementById('previewModal');
const previewContent = document.getElementById('previewContent');
const statusMessage = document.getElementById('statusMessage');
const closeModal = document.querySelector('.close');

// État du formulaire
let isSubmitting = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeFormValidation();
});

// Gestionnaires d'événements
function initializeEventListeners() {
    // Soumission du formulaire
    form.addEventListener('submit', handleFormSubmit);
    
    // Bouton d'aperçu
    previewBtn.addEventListener('click', showPreview);
    
    // Bouton de réinitialisation
    resetBtn.addEventListener('click', resetForm);
    
    // Fermeture du modal
    closeModal.addEventListener('click', closePreviewModal);
    window.addEventListener('click', function(event) {
        if (event.target === previewModal) {
            closePreviewModal();
        }
    });
    
    // Validation en temps réel
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Gestion des fichiers
    const fileInputs = form.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', handleFileSelection);
    });
}

// Validation du formulaire
function initializeFormValidation() {
    // Validation des coordonnées
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    
    latInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (value < -90 || value > 90) {
            this.setCustomValidity('La latitude doit être entre -90 et 90');
        } else {
            this.setCustomValidity('');
        }
    });
    
    lngInput.addEventListener('input', function() {
        const value = parseFloat(this.value);
        if (value < -180 || value > 180) {
            this.setCustomValidity('La longitude doit être entre -180 et 180');
        } else {
            this.setCustomValidity('');
        }
    });
}

// Validation d'un champ
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Supprimer les erreurs précédentes
    clearFieldError(event);
    
    // Validation spécifique selon le type de champ
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Ce champ est obligatoire');
        return false;
    }
    
    // Validation des coordonnées
    if (field.type === 'number' && field.name === 'latitude') {
        const lat = parseFloat(value);
        if (lat < -90 || lat > 90) {
            showFieldError(field, 'La latitude doit être entre -90 et 90');
            return false;
        }
    }
    
    if (field.type === 'number' && field.name === 'longitude') {
        const lng = parseFloat(value);
        if (lng < -180 || lng > 180) {
            showFieldError(field, 'La longitude doit être entre -180 et 180');
            return false;
        }
    }
    
    // Validation JSON pour les informations pratiques
    if (field.name === 'practicalInfo' && value) {
        try {
            JSON.parse(value);
        } catch (e) {
            showFieldError(field, 'Format JSON invalide');
            return false;
        }
    }
    
    return true;
}

// Afficher une erreur de champ
function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.style.borderColor = '#ef4444';
    field.parentNode.appendChild(errorDiv);
}

// Effacer les erreurs de champ
function clearFieldError(event) {
    const field = event.target;
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '#e5e7eb';
}

// Gestion de la sélection de fichiers
function handleFileSelection(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Vérifier la taille du fichier
    const maxSizes = {
        image: 5 * 1024 * 1024, // 5MB
        audio: 10 * 1024 * 1024, // 10MB
        video: 50 * 1024 * 1024, // 50MB
        virtualTour360: 100 * 1024 * 1024 // 100MB
    };
    
    const fileType = event.target.name;
    const maxSize = maxSizes[fileType] || maxSizes.image;
    
    if (file.size > maxSize) {
        showFieldError(event.target, `Fichier trop volumineux (max: ${formatFileSize(maxSize)})`);
        event.target.value = '';
        return;
    }
    
    // Afficher un aperçu du fichier
    showFilePreview(event.target, file);
}

// Afficher un aperçu de fichier
function showFilePreview(input, file) {
    const preview = input.parentNode.querySelector('.file-preview');
    if (preview) {
        preview.remove();
    }
    
    const previewDiv = document.createElement('div');
    previewDiv.className = 'file-preview';
    previewDiv.innerHTML = `
        <i class="fas fa-file"></i>
        ${file.name} (${formatFileSize(file.size)})
    `;
    
    input.parentNode.appendChild(previewDiv);
}

// Formater la taille de fichier
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Aperçu des données
function showPreview() {
    const formData = new FormData(form);
    const data = extractFormData(formData);
    
    previewContent.textContent = JSON.stringify(data, null, 2);
    previewModal.style.display = 'block';
}

// Fermer le modal d'aperçu
function closePreviewModal() {
    previewModal.style.display = 'none';
}

// Soumission du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    // Validation complète du formulaire
    if (!validateForm()) {
        showStatusMessage('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Création en cours...';
    
    try {
        const formData = new FormData(form);
        const response = await submitPOI(formData);
        
        if (response.success) {
            showStatusMessage('POI créé avec succès!', 'success');
            resetForm();
        } else {
            showStatusMessage(`Erreur: ${response.message}`, 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        showStatusMessage('Erreur lors de la création du POI', 'error');
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Créer le POI';
    }
}

// Validation complète du formulaire
function validateForm() {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Ce champ est obligatoire');
            isValid = false;
        }
    });
    
    // Validation des coordonnées
    const lat = parseFloat(document.getElementById('latitude').value);
    const lng = parseFloat(document.getElementById('longitude').value);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
        showFieldError(document.getElementById('latitude'), 'Latitude invalide');
        isValid = false;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
        showFieldError(document.getElementById('longitude'), 'Longitude invalide');
        isValid = false;
    }
    
    // Validation JSON des informations pratiques
    const practicalInfo = document.getElementById('practicalInfo').value.trim();
    if (practicalInfo) {
        try {
            JSON.parse(practicalInfo);
        } catch (e) {
            showFieldError(document.getElementById('practicalInfo'), 'Format JSON invalide');
            isValid = false;
        }
    }
    
    return isValid;
}

// Extraction des données du formulaire
function extractFormData(formData) {
    const data = {
        // Informations générales
        category: formData.get('category'),
        cityId: formData.get('cityId'),
        coordinates: {
            latitude: parseFloat(formData.get('latitude')),
            longitude: parseFloat(formData.get('longitude')),
            address: formData.get('address')
        },
        practicalInfo: formData.get('practicalInfo') ? JSON.parse(formData.get('practicalInfo')) : null,
        isActive: formData.get('isActive') === 'on',
        isVerified: formData.get('isVerified') === 'on',
        isPremium: formData.get('isPremium') === 'on',
        
        // Localisations
        arLocalization: {
            name: formData.get('ar_name'),
            description: formData.get('ar_description'),
            address: formData.get('ar_address')
        },
        frLocalization: {
            name: formData.get('fr_name'),
            description: formData.get('fr_description'),
            address: formData.get('fr_address')
        },
        enLocalization: {
            name: formData.get('en_name'),
            description: formData.get('en_description'),
            address: formData.get('en_address')
        },
        
        // Fichiers
        files: {
            image: formData.get('image'),
            video: formData.get('video'),
            virtualTour360: formData.get('virtualTour360'),
            fr_audio: formData.get('fr_audio'),
            ar_audio: formData.get('ar_audio'),
            en_audio: formData.get('en_audio')
        }
    };
    
    return data;
}

// Soumission du POI au backend
async function submitPOI(formData) {
    try {
        // Préparer les données pour l'API avec FormData
        const apiFormData = prepareFormDataForAPI(formData);
        
        const response = await fetch(`${API_BASE_URL}/create-with-files`, {
            method: 'POST',
            body: apiFormData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la création du POI');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Préparer les données FormData pour l'API
function prepareFormDataForAPI(formData) {
    const apiFormData = new FormData();
    
    // Coordonnées
    apiFormData.append('coordinates', JSON.stringify({
        latitude: parseFloat(formData.get('latitude')),
        longitude: parseFloat(formData.get('longitude')),
        address: formData.get('address')
    }));
    
    // Données générales
    apiFormData.append('category', formData.get('category'));
    apiFormData.append('cityId', formData.get('cityId'));
    apiFormData.append('practicalInfo', formData.get('practicalInfo') || '');
    apiFormData.append('isActive', formData.get('isActive') === 'on' ? 'true' : 'false');
    apiFormData.append('isVerified', formData.get('isVerified') === 'on' ? 'true' : 'false');
    apiFormData.append('isPremium', formData.get('isPremium') === 'on' ? 'true' : 'false');
    
    // Localisations
    apiFormData.append('arLocalization', JSON.stringify({
        name: formData.get('ar_name'),
        description: formData.get('ar_description'),
        address: formData.get('ar_address')
    }));
    
    apiFormData.append('frLocalization', JSON.stringify({
        name: formData.get('fr_name'),
        description: formData.get('fr_description'),
        address: formData.get('fr_address')
    }));
    
    apiFormData.append('enLocalization', JSON.stringify({
        name: formData.get('en_name'),
        description: formData.get('en_description'),
        address: formData.get('en_address')
    }));
    
    // Fichiers
    if (formData.get('image')) {
        apiFormData.append('image', formData.get('image'));
    }
    if (formData.get('video')) {
        apiFormData.append('video', formData.get('video'));
    }
    if (formData.get('virtualTour360')) {
        apiFormData.append('virtualTour360', formData.get('virtualTour360'));
    }
    if (formData.get('fr_audio')) {
        apiFormData.append('fr_audio', formData.get('fr_audio'));
    }
    if (formData.get('ar_audio')) {
        apiFormData.append('ar_audio', formData.get('ar_audio'));
    }
    if (formData.get('en_audio')) {
        apiFormData.append('en_audio', formData.get('en_audio'));
    }
    
    return apiFormData;
}

// Réinitialiser le formulaire
function resetForm() {
    form.reset();
    
    // Supprimer tous les aperçus de fichiers
    const filePreviews = form.querySelectorAll('.file-preview');
    filePreviews.forEach(preview => preview.remove());
    
    // Supprimer toutes les erreurs de validation
    const fieldErrors = form.querySelectorAll('.field-error');
    fieldErrors.forEach(error => error.remove());
    
    // Réinitialiser les styles des champs
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.style.borderColor = '#e5e7eb';
    });
    
    showStatusMessage('Formulaire réinitialisé', 'info');
}

// Afficher un message de statut
function showStatusMessage(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 5000);
}

// Fonction utilitaire pour obtenir les coordonnées GPS actuelles
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                document.getElementById('latitude').value = position.coords.latitude.toFixed(6);
                document.getElementById('longitude').value = position.coords.longitude.toFixed(6);
                showStatusMessage('Coordonnées GPS récupérées', 'success');
            },
            function(error) {
                showStatusMessage('Impossible de récupérer la position GPS', 'error');
            }
        );
    } else {
        showStatusMessage('Géolocalisation non supportée par ce navigateur', 'error');
    }
}

// Ajouter un bouton pour récupérer la position GPS
document.addEventListener('DOMContentLoaded', function() {
    const coordinatesGroup = document.querySelector('.coordinates-group');
    const locationBtn = document.createElement('button');
    locationBtn.type = 'button';
    locationBtn.className = 'btn btn-outline';
    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Ma position';
    locationBtn.style.marginTop = '0.5rem';
    locationBtn.addEventListener('click', getCurrentLocation);
    
    coordinatesGroup.appendChild(locationBtn);
});

// Gestion des erreurs globales
window.addEventListener('error', function(event) {
    console.error('Erreur JavaScript:', event.error);
    showStatusMessage('Une erreur inattendue s\'est produite', 'error');
});

// Gestion des erreurs de promesses non capturées
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesse rejetée:', event.reason);
    showStatusMessage('Erreur lors de l\'exécution d\'une opération', 'error');
});
