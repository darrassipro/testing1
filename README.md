

````markdown
# 🧭 GO-FEZ — Plan de Développement Complet

## 🏗️ Architecture Recommandée

### ⚙️ Stack Technique (Confirmée)
| Couche | Technologie |
|--------|--------------|
| **Frontend** | Next.js 15+ (App Router), TypeScript, Tailwind CSS |
| **Backend** | Node.js / Express avec Sequelize ORM |
| **Base de données** | MySQL |
| **Stockage** | Cloudinary (images, audio, vidéo, 360°) |
| **Authentification** | JWT avec cookies httpOnly |
| **État global** | Redux Toolkit avec RTK Query |

---

## 🚀 Phase MVP : Plan de Développement Détaillé

### 1️⃣ Authentification & Profil Utilisateur

#### Backend (Déjà partiellement implémenté)
✅ Modèle `User` avec multi-provider (phone, Google, Facebook)

⚠️ À compléter :
- Service d'envoi SMS (Twilio/Vonage) pour OTP  
- Endpoints de vérification OTP  
- Intégration OAuth Google/Facebook  
- Gestion du refresh token  

#### Frontend à créer
```typescript
// Structure des pages d'authentification
app/[locale]/(auth)/
├── login/page.tsx
├── signup/page.tsx
├── verify-otp/page.tsx
├── forgot-password/page.tsx
└── reset-password/page.tsx

// Components nécessaires
components/auth/
├── PhoneInput.tsx
├── OTPInput.tsx
├── PasswordStrength.tsx
├── SocialLoginButtons.tsx
└── AuthLayout.tsx
````

#### Flux d'inscription

1. Saisie téléphone → Validation format
2. Envoi OTP (6 chiffres) → Vérification backend
3. Création compte (nom, prénom, mot de passe)
4. Profil complété (photo optionnelle)

---

### 2️⃣ Découverte des POIs

#### Backend - Améliorations nécessaires

```javascript
// Ajouter filtres avancés dans POIController.js
const findAllPOIsWithFilters = async (req, res) => {
  const { 
    cityId, 
    categoryId, 
    search, 
    rating, 
    isPremium,
    latitude,
    longitude,
    radius = 5000 // 5km par défaut
  } = req.query;

  // Ajouter calcul de distance géographique
  // Pagination
  // Tri par pertinence/distance/note
};
```

#### Frontend - Pages & Composants

```typescript
// Structure des pages POI
app/[locale]/pois/
├── page.tsx                    // Liste avec filtres
├── [id]/page.tsx              // Détail POI
└── map/page.tsx               // Vue carte

components/pois/
├── POICard.tsx
├── POIDetailView.tsx
├── POIFilters.tsx
├── POIMap.tsx                 // Intégration Mapbox/Leaflet
├── MediaGallery.tsx
├── AudioPlayer.tsx
├── VirtualTour360.tsx         // Pannellum ou React 360
└── POIRating.tsx
```

#### Fonctionnalités POI à implémenter

* Recherche full-text (nom, description)
* Filtres : catégorie, ville, note, premium
* Géolocalisation avec calcul de distance
* Lecteur audio multilingue
* Galerie photos/vidéos
* Viewer 360° (Pannellum.js recommandé)
* Système de favoris (backend à créer)

---

### 3️⃣ Parcours / Circuits

#### Backend - Extensions nécessaires

```javascript
// models/CircuitProgress.js - Nouveau modèle
const CircuitProgress = sequelize.define('CircuitProgress', {
  userId: DataTypes.UUID,
  circuitId: DataTypes.UUID,
  currentPOIIndex: DataTypes.INTEGER,
  completedPOIs: DataTypes.JSON, // Array d'IDs
  startedAt: DataTypes.DATE,
  completedAt: DataTypes.DATE,
  totalTime: DataTypes.INTEGER // en minutes
});

// Ajouter dans CircuitController.js
const startCircuit = async (req, res) => {
  // Créer CircuitProgress
  // Démarrer tracking GPS
};

const updateCircuitProgress = async (req, res) => {
  // Marquer POI comme visité
  // Calculer progression
};
```

#### Frontend - Structure

```typescript
app/[locale]/circuits/
├── page.tsx                      // Liste circuits
├── [id]/
│   ├── page.tsx                 // Détail circuit
│   ├── navigation/page.tsx      // Navigation GPS
│   └── summary/page.tsx         // Résumé après complétion

components/circuits/
├── CircuitCard.tsx
├── CircuitMap.tsx               // Carte avec itinéraire
├── POITimeline.tsx              // Liste POIs avec ordre
├── NavigationControls.tsx
├── GPSTracker.tsx               // Suivi position temps réel
└── ProgressBar.tsx
```

#### Navigation GPS - Implémentation

```typescript
// Utiliser Geolocation API + Mapbox Directions
const useGPSNavigation = (circuit: Circuit) => {
  const [position, setPosition] = useState<GeolocationPosition>();
  const [currentPOI, setCurrentPOI] = useState(0);
  
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        checkPOIProximity(pos, circuit.pois[currentPOI]);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentPOI]);
};
```

---

### 4️⃣ Gamification

#### Backend - Nouveaux modèles

```javascript
// models/UserPoints.js
const UserPoints = sequelize.define('UserPoints', {
  userId: DataTypes.UUID,
  totalPoints: DataTypes.INTEGER,
  level: DataTypes.INTEGER,
  badges: DataTypes.JSON // Array de badge IDs
});

// models/Badge.js
const Badge = sequelize.define('Badge', {
  nameAr: DataTypes.STRING,
  nameFr: DataTypes.STRING,
  nameEn: DataTypes.STRING,
  icon: DataTypes.STRING,
  requiredPoints: DataTypes.INTEGER,
  category: DataTypes.ENUM('explorer', 'social', 'premium')
});

// controllers/gamificationController.js - Extensions
const awardPoints = async (userId, activity) => {
  const rule = await GamificationRule.findOne({ 
    where: { activity, isActive: true } 
  });
  
  await UserPoints.increment('totalPoints', {
    by: rule.points,
    where: { userId }
  });
  
  // Vérifier nouveaux badges
  await checkBadgeUnlocks(userId);
};
```

#### Frontend - Gamification

```typescript
app/[locale]/profile/
├── page.tsx                    // Profil principal
├── achievements/page.tsx       // Badges & réalisations
├── leaderboard/page.tsx        // Classement
└── history/page.tsx            // Historique activités

components/gamification/
├── PointsDisplay.tsx
├── LevelProgress.tsx
├── BadgeGrid.tsx
├── LeaderboardTable.tsx
└── AchievementNotification.tsx // Toast lors déverrouillage
```

---

### 5️⃣ Fonctionnalités Sociales (MVP)

#### Backend à créer

```javascript
// models/Review.js
const Review = sequelize.define('Review', {
  userId: DataTypes.UUID,
  poiId: DataTypes.UUID,
  rating: DataTypes.DECIMAL(3, 2),
  comment: DataTypes.TEXT,
  photos: DataTypes.JSON // Array URLs Cloudinary
});

// models/Share.js
const Share = sequelize.define('Share', {
  userId: DataTypes.UUID,
  resourceType: DataTypes.ENUM('circuit', 'poi'),
  resourceId: DataTypes.UUID,
  platform: DataTypes.ENUM('facebook', 'twitter', 'whatsapp')
});
```

#### Frontend

```typescript
components/social/
├── ReviewForm.tsx
├── ReviewList.tsx
├── ShareButtons.tsx
└── ReferralCode.tsx
```

---

## 💎 Phase Version Complète

### 1️⃣ Parcours Personnalisés

#### Backend

```javascript
// models/CustomCircuit.js
const CustomCircuit = sequelize.define('CustomCircuit', {
  userId: DataTypes.UUID,
  name: DataTypes.STRING,
  selectedPOIs: DataTypes.JSON,
  startDate: DataTypes.DATE,
  estimatedDuration: DataTypes.INTEGER,
  isPublic: DataTypes.BOOLEAN
});

// Système de recommandations (ML optionnel)
const getRecommendations = async (userId) => {
  // Basé sur historique utilisateur
  // POIs similaires
  // Circuits populaires dans sa ville
};
```

#### Frontend

```typescript
app/[locale]/custom-circuits/
├── create/page.tsx
└── [id]/page.tsx

components/custom-circuits/
├── POISelector.tsx           // Drag & drop POIs
├── DatePicker.tsx
├── RouteOptimizer.tsx        // TSP algorithm
└── DurationEstimator.tsx
```

---

### 2️⃣ Monétisation & Paiement

#### Backend - Intégration paiement

```javascript
// models/Subscription.js
const Subscription = sequelize.define('Subscription', {
  userId: DataTypes.UUID,
  plan: DataTypes.ENUM('free', 'premium', 'pro'),
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  paymentMethod: DataTypes.STRING
});

// controllers/paymentController.js
const createPaymentIntent = async (req, res) => {
  // Intégration CMI/SharyPay
  // Webhook validation
};
```

#### Frontend

```typescript
app/[locale]/premium/
├── plans/page.tsx
├── checkout/page.tsx
└── success/page.tsx

components/payment/
├── PricingCards.tsx
├── PaymentForm.tsx
└── InvoiceDownload.tsx
```

---

### 3️⃣ Partenariats

#### Backend

```javascript
// models/Partner.js
const Partner = sequelize.define('Partner', {
  name: DataTypes.STRING,
  category: DataTypes.STRING,
  discount: DataTypes.INTEGER,
  qrCode: DataTypes.STRING,
  isActive: DataTypes.BOOLEAN
});

// models/PartnerVisit.js - Tracking
const PartnerVisit = sequelize.define('PartnerVisit', {
  partnerId: DataTypes.UUID,
  userId: DataTypes.UUID,
  visitedAt: DataTypes.DATE,
  rewardClaimed: DataTypes.BOOLEAN
});
```

#### Frontend

```typescript
app/[locale]/partners/
├── page.tsx
├── [id]/page.tsx
└── qr-scan/page.tsx

components/partners/
├── PartnerCard.tsx
├── QRScanner.tsx            // react-qr-scanner
├── OffersList.tsx
└── PartnerMap.tsx
```

---

### 4️⃣ Mode Hors Ligne

#### Stratégie d'implémentation

```typescript
// Service Worker pour PWA
// next-pwa configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'cloudinary-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
});

// Stockage local IndexedDB
const cacheCircuitForOffline = async (circuitId: string) => {
  const circuit = await fetch(`/api/circuits/${circuitId}`);
  const data = await circuit.json();
  
  // Sauvegarder dans IndexedDB
  await idb.put('circuits', data);
  
  // Pré-télécharger médias essentiels
  await Promise.all(
    data.pois.map(poi => cacheMedia(poi.poiFile))
  );
};
```

---

## ⚡ Optimisations & Bonnes Pratiques

### Performance

```typescript
// Lazy loading des composants lourds
const VirtualTour360 = dynamic(() => import('@/components/pois/VirtualTour360'), {
  ssr: false,
  loading: () => <Skeleton className="h-96" />
});

// Image optimization
<Image
  src={poi.image}
  loader={cloudinaryLoader}
  width={800}
  height={600}
  quality={80}
  placeholder="blur"
/>
```

### Sécurité

* ✅ Rate limiting déjà implémenté
* CSRF tokens pour formulaires sensibles
* Validation **Zod** (frontend) + **express-validator** (backend)
* Sanitization **XSS** (via package `xss`) ✅

---

## 🧪 Tests

```typescript
// Structure tests recommandée
__tests__/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── user-flows/
```

---

## 📅 Timeline Estimée

### Phase MVP (3–4 mois)

| Période        | Objectif                     |
| -------------- | ---------------------------- |
| Semaines 1–2   | Auth complète + Profil       |
| Semaines 3–4   | POIs (liste, détail, médias) |
| Semaines 5–6   | Circuits + Navigation GPS    |
| Semaines 7–8   | Gamification basique         |
| Semaines 9–10  | Social (reviews, partage)    |
| Semaines 11–12 | Tests & corrections          |

### Phase Complète (+2–3 mois)

| Période        | Objectif               |
| -------------- | ---------------------- |
| Semaines 13–14 | Parcours personnalisés |
| Semaines 15–16 | Paiement & Premium     |
| Semaines 17–18 | Partenariats + QR      |
| Semaines 19–20 | Mode offline + PWA     |
| Semaines 21–22 | Multilinguisme étendu  |
| Semaines 23–24 | Optimisations finales  |


