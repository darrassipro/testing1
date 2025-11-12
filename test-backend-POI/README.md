# Formulaire de Création de POI - Go Fez

Ce dossier contient un formulaire complet pour créer des Points d'Intérêt (POI) dans l'application Go Fez.

## 🚀 Fonctionnalités

### Formulaire Multilingue
- **Français** : Nom, description, adresse et fichier audio
- **Arabe** : Nom, description, adresse et fichier audio  
- **Anglais** : Nom, description, adresse et fichier audio

### Informations Générales
- Catégorie du POI (Monument, Musée, Restaurant, etc.)
- Sélection de la ville
- Coordonnées GPS (avec géolocalisation automatique)
- Adresse complète
- Informations pratiques (JSON)
- Statuts (Actif, Vérifié, Premium)

### Fichiers Multimédias
- **Image principale** : JPG, PNG, GIF, WebP (Max: 5MB)
- **Vidéo** : MP4, MOV, AVI, WebM (Max: 50MB)
- **Visite virtuelle 360°** : MP4, MOV, WebM (Max: 100MB)
- **Fichiers audio** : MP3, WAV, OGG, M4A, AAC (Max: 10MB)

## 📁 Structure des Fichiers

```
test-backend-POI/
├── index.html          # Formulaire principal
├── style.css           # Styles CSS modernes et responsives
├── script.js           # Logique JavaScript et gestion des formulaires
└── README.md           # Documentation
```

## 🛠️ Utilisation

### 1. Prérequis
- Serveur backend Go Fez en cours d'exécution
- Configuration Cloudinary valide
- Base de données configurée

### 2. Démarrage
1. Ouvrir `index.html` dans un navigateur web
2. Remplir les champs obligatoires (marqués avec *)
3. Sélectionner les fichiers multimédias si nécessaire
4. Cliquer sur "Créer le POI"

### 3. Validation
- Validation en temps réel des champs
- Vérification des formats de fichiers
- Contrôle des tailles de fichiers
- Validation des coordonnées GPS

## 🔧 Configuration Backend

### Route API
Le formulaire utilise la route `/api/poi/create-with-files` qui :
- Accepte les données en FormData
- Upload automatiquement les fichiers vers Cloudinary
- Crée les localisations multilingues
- Enregistre le POI en base de données

### Structure des Données
```json
{
  "coordinates": {
    "latitude": 34.0522,
    "longitude": -6.8521,
    "address": "Adresse complète"
  },
  "category": 1,
  "cityId": "uuid-de-la-ville",
  "practicalInfo": "{\"horaires\": \"9h-18h\", \"prix\": \"50 MAD\"}",
  "arLocalization": {
    "name": "اسم الموقع",
    "description": "وصف الموقع",
    "address": "العنوان"
  },
  "frLocalization": {
    "name": "Nom du site",
    "description": "Description du site",
    "address": "Adresse"
  },
  "enLocalization": {
    "name": "Site name",
    "description": "Site description", 
    "address": "Address"
  }
}
```

## 🎨 Interface Utilisateur

### Design Moderne
- Interface responsive (mobile, tablette, desktop)
- Animations fluides
- Validation visuelle des champs
- Aperçu des fichiers sélectionnés
- Messages de statut en temps réel

### Fonctionnalités UX
- Géolocalisation automatique
- Aperçu des données avant soumission
- Gestion des erreurs utilisateur
- Indicateurs de progression
- Réinitialisation du formulaire

## 🔒 Sécurité

### Validation Côté Client
- Types de fichiers autorisés
- Tailles maximales respectées
- Formats de données validés
- Coordonnées GPS vérifiées

### Validation Côté Serveur
- Middleware Multer pour les uploads
- Validation Express-validator
- Upload sécurisé vers Cloudinary
- Gestion des erreurs complète

## 📱 Responsive Design

Le formulaire s'adapte automatiquement à :
- **Mobile** : Layout vertical, boutons pleine largeur
- **Tablette** : Grille adaptative, navigation optimisée
- **Desktop** : Layout multi-colonnes, interface complète

## 🚨 Gestion des Erreurs

### Types d'Erreurs Gérées
- Fichiers trop volumineux
- Formats non supportés
- Coordonnées GPS invalides
- Champs obligatoires manquants
- Erreurs de connexion API
- Erreurs d'upload Cloudinary

### Messages Utilisateur
- Messages d'erreur contextuels
- Indicateurs de succès
- Avertissements informatifs
- Notifications de progression

## 🔄 Workflow Complet

1. **Saisie** : L'utilisateur remplit le formulaire
2. **Validation** : Vérification côté client en temps réel
3. **Upload** : Envoi des fichiers vers Cloudinary
4. **Création** : Enregistrement en base de données
5. **Confirmation** : Retour de succès à l'utilisateur

## 📊 Données Créées

Le formulaire crée automatiquement :
- 1 enregistrement POI principal
- 1-3 enregistrements POILocalization (selon les langues)
- 1 enregistrement POIFile (si fichiers fournis)
- Uploads Cloudinary pour tous les fichiers

## 🎯 Prochaines Améliorations

- [ ] Sauvegarde automatique des brouillons
- [ ] Upload par glisser-déposer
- [ ] Prévisualisation des images
- [ ] Géolocalisation interactive sur carte
- [ ] Templates de POI prédéfinis
- [ ] Import en lot de POI
