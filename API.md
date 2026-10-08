# API MANDÉ SUGU - Contrats

**Base URL** : `https://mande-sugu-backend-production.up.railway.app/api`

**Authentification** : JWT Bearer dans le header `Authorization: Bearer <token>`

**Rôles** : `client`, `seller`, `admin`, `super_admin`, `logistics`, `support`

**Format réponse** : `{ success: boolean, message?: string, data?: any }`

---

## 🔐 AUTHENTIFICATION (`/api/auth`)

### POST /auth/register
**Body** : `{ full_name, email, password, phone?, role?, country_code? }`
**Réponse 201** : `{ success: true, message: "Inscription réussie", data: { user, token } }`

### POST /auth/login
**Body** : `{ email, password }`
**Réponse 200** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 11,
      "full_name": "seydou",
      "email": "sd860848@gmail.com",
      "phone": "83680319",
      "role": "super_admin",
      "is_verified": 0,
      "is_active": 1,
      "avatar_url": "/uploads/avatars/avatar-11-xxx.png",
      "country_code": "223",
      "preferred_language": "fr",
      "preferred_currency": "XOF",
      "created_at": "2026-10-04T22:22:14.000Z",
      "city": "Bamako"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### GET /auth/me
**Headers** : Authorization
**Réponse** : `{ success: true, data: User }`

### POST /auth/become-seller
**Headers** : Authorization
**Body** : `{ shop_name, description?, country_code?, city?, whatsapp_number? }`
**Réponse** : `{ success: true, message: "Vous êtes maintenant vendeur !", data: { user, shop } }`

---

## 📊 ADMIN - DASHBOARD (`/api/admin/dashboard`)

Toutes ces routes nécessitent `requireAuth` + `requireRole('admin', 'super_admin')`.

### GET /admin/dashboard/summary
```json
{
  "success": true,
  "data": {
    "users": { "total": 7, "newLast7Days": 3, "trend": 50 },
    "sellers": { "total": 5 },
    "products": { "total": 4, "newLast7Days": 2 },
    "orders": { "total": 1, "newLast7Days": 1, "trend": 100 },
    "revenue": { "total": 0 }
  }
}
```

### GET /admin/dashboard/chart
```json
{
  "success": true,
  "data": [
    { "date": "2026-10-01", "dayLabel": "mar.", "orders": 0, "revenue": 0 },
    { "date": "2026-10-07", "dayLabel": "lun.", "orders": 1, "revenue": 7500 }
  ]
}
```

### GET /admin/dashboard/top-products
```json
{
  "success": true,
  "data": [
    { "id": 2, "name": "Tissu Bogolan authentique", "main_image": "https://...", "price": "8500.00", "sales_count": 246, "stock": 24, "rating": "4.60" }
  ]
}
```

### GET /admin/dashboard/recent-orders
```json
{
  "success": true,
  "data": [
    { "id": 1, "order_number": "ORD-20261006-5868", "total_amount": "7500.00", "status": "pending", "created_at": "2026-10-06T22:15:00.000Z", "buyer_name": "seydou", "buyer_email": "sd860848@gmail.com" }
  ]
}
```

### GET /admin/dashboard/recent-users
```json
{
  "success": true,
  "data": [
    { "id": 12, "full_name": "Seydou", "email": "seydoum456723@gmail.com", "role": "seller", "avatar_url": null, "created_at": "2026-10-06T15:20:00.000Z" }
  ]
}
```

### GET /admin/dashboard/alerts
```json
{
  "success": true,
  "data": [
    { "type": "warning", "message": "1 produit(s) en stock bas", "count": 1 },
    { "type": "info", "message": "1 commande(s) en attente", "count": 1 },
    { "type": "info", "message": "3 vendeur(s) a verifier", "count": 3 }
  ]
}
```

---

## 👥 ADMIN - UTILISATEURS (`/api/admin`)

### GET /admin/users
**Query** : `page` (défaut 1), `limit` (défaut 20), `role`, `search`, `status` (active|inactive)
**Réponse** :
```json
{
  "success": true,
  "data": [
    { "id": 11, "full_name": "seydou", "email": "sd860848@gmail.com", "phone": "83680319", "role": "super_admin", "is_verified": 0, "is_active": 1, "avatar_url": null, "city": "Bamako", "created_at": "2026-10-04T22:22:14.000Z" }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 7, "totalPages": 1 }
}
```

### GET /admin/users/:id
**Réponse** : `{ success: true, data: User }`

### PUT /admin/users/:id/role
**Body** : `{ role: "client" | "seller" | "admin" | "super_admin" | "logistics" | "support" }`
**Réponse** : `{ success: true, message: "Rôle mis à jour avec succès" }`

### PUT /admin/users/:id/status
**Body** : aucun (bascule is_active)
**Réponse** : `{ success: true, message: "Statut utilisateur modifié" }`

### DELETE /admin/users/:id
**Réponse** : `{ success: true, message: "Utilisateur supprimé" }`

---

## 📦 ADMIN - PRODUITS (`/api/admin`)

### GET /admin/products
**Query** : `page`, `limit`, `search`
**Réponse** :
```json
{
  "success": true,
  "data": [
    { "id": 7, "name": "Tripier", "price": "5000.00", "stock": 10, "main_image": "https://...", "seller_id": 3, "seller_name": "Amadou Vendeur", "is_active": 1, "sales_count": 0, "rating": "0.00", "created_at": "2026-10-05T12:00:00.000Z" }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 4, "totalPages": 1 }
}
```

### PUT /admin/products/:id/status
**Body** : `{ is_active: boolean }`

### DELETE /admin/products/:id

---

## 🛒 ADMIN - COMMANDES (`/api/admin`)

### GET /admin/orders
**Query** : `page`, `limit`, `status`
**Statuts** : `pending`, `paid`, `processing`, `shipped`, `in_transit`, `delivered`, `completed`, `cancelled`, `refunded`
**Réponse** :
```json
{
  "success": true,
  "data": [
    { "id": 1, "order_number": "ORD-20261006-5868", "buyer_name": "seydou", "buyer_email": "sd860848@gmail.com", "total_amount": "7500.00", "status": "pending", "created_at": "2026-10-06T22:15:00.000Z" }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### PUT /admin/orders/:id/status
**Body** : `{ status: "pending" | "paid" | "processing" | ... }`

---

## 🛒 COMMANDES CLIENT (`/api/orders`)

- `POST /orders` → Créer une commande
- `GET /orders` → Mes commandes
- `GET /orders/:id` → Détail
- `PUT /orders/:id/status` → Changer statut
- `POST /orders/:id/cancel` → Annuler

---

## 🛍️ PANIER (`/api/cart`)

- `GET /cart` → Voir panier
- `POST /cart` → Ajouter article
- `PUT /cart/:id` → Modifier quantité
- `DELETE /cart/:id` → Retirer article
- `DELETE /cart` → Vider panier

---

## 💬 CHAT (`/api/chat`)

- `GET /chat/conversations` → Liste conversations
- `POST /chat/conversations` → Créer (body: `{ seller_id, product_id }`)
- `GET /chat/conversations/:id` → Messages
- `POST /chat/messages` → Envoyer (body: `{ conversation_id, content }`)

---

## ⭐ FAVORIS (`/api/favorites`)

- `GET /favorites` → Mes favoris
- `GET /favorites/ids` → IDs des favoris
- `POST /favorites/toggle` → Basculer
- `DELETE /favorites/:productId` → Retirer

---

## 🔔 NOTIFICATIONS (`/api/notifications`)

- `GET /notifications` → Mes notifications
- `GET /notifications/unread-count` → Nombre non lues
- `PUT /notifications/read-all` → Tout marquer lu
- `PUT /notifications/:id/read` → Marquer une
- `DELETE /notifications/:id` → Supprimer

---

## 👤 PROFIL (`/api/profile`)

- `GET /profile` → Mon profil
- `PUT /profile` → Modifier
- `PUT /profile/password` → Changer mot de passe
- `POST /profile/avatar` → Upload avatar (multipart)
- `DELETE /profile/avatar` → Supprimer avatar

---

## ⭐ AVIS (`/api/reviews`)

- `GET /reviews/product/:productId` → Avis d'un produit
- `GET /reviews/me` → Mes avis
- `POST /reviews` → Créer avis
- `PUT /reviews/:id` → Modifier
- `DELETE /reviews/:id` → Supprimer

---

## 🏪 VENDEUR (`/api/seller`)

- `POST /seller/products` → Créer produit
- `PUT /seller/products/:id` → Modifier
- `DELETE /seller/products/:id` → Supprimer

---

## 📤 UPLOAD (`/api/upload`)

- `POST /upload` → Upload fichier (multipart, champ `file`)

---

## 🚨 ROUTES NON ENCORE IMPLÉMENTÉES

Ces routes sont **prévues** mais **pas encore dans le backend**.
Le frontend doit gérer un fallback gracieux (toast "Fonctionnalité bientôt disponible") si 404.

### Gestion utilisateurs avancée
```
POST /admin/users/:id/reset-password       Réinitialiser mot de passe
POST /admin/users/:id/ban                  Bannir utilisateur
POST /admin/users/:id/unban                Débannir
POST /admin/users/:id/force-logout         Forcer déconnexion
GET  /admin/users/:id/activity             Historique activité
GET  /admin/users/:id/sessions             Sessions actives
GET  /admin/users/:id/login-history        Historique connexion
```

### Gestion commandes avancée
```
POST /admin/orders/:id/refund              Rembourser
POST /admin/orders/:id/cancel              Annuler
GET  /admin/orders/:id                     Détail commande
GET  /admin/orders/:id/history             Historique statuts
```

### Gestion vendeurs
```
GET  /admin/sellers                        Liste vendeurs
GET  /admin/sellers/:id                    Détail vendeur
PUT  /admin/sellers/:id/verify             Vérifier vendeur
PUT  /admin/sellers/:id/status             Suspendre
GET  /admin/sellers/:id/stats              Statistiques
```

### Messages / Modération
```
GET  /admin/messages                       Toutes conversations
GET  /admin/messages/:id                   Détail conversation
POST /admin/messages/:id/reply             Répondre
GET  /admin/messages/flagged               Conversations signalées
```

### Support / Tickets
```
GET  /admin/tickets                        Liste tickets
GET  /admin/tickets/:id                    Détail
PUT  /admin/tickets/:id/assign             Assigner
PUT  /admin/tickets/:id/resolve            Résoudre
PUT  /admin/tickets/:id/close              Fermer
```

### Audit / Logs
```
GET  /admin/audit-logs                     Historique actions admin
GET  /admin/audit-logs?admin_id=&action=   Filtrer
```

### Paramètres
```
GET  /admin/settings                       Config site
PUT  /admin/settings                       Modifier config
```

### Notifications de masse
```
POST /admin/notifications/broadcast        Envoyer à tous
```

### Sécurité
```
GET  /admin/security/failed-logins         Tentatives échouées
POST /admin/security/block-ip              Bloquer IP
GET  /admin/security/sessions              Sessions admin actives
```

### Analytics
```
GET  /admin/analytics/overview             Vue générale
GET  /admin/analytics/revenue              Revenus
GET  /admin/analytics/traffic              Trafic
GET  /admin/analytics/conversion           Taux conversion
```

---

## 📋 CONVENTIONS

1. **Format réponse** : toujours `{ success, message?, data? }`
2. **Erreurs HTTP** :
   - `400` : Données invalides
   - `401` : Token manquant/expiré
   - `403` : Accès refusé
   - `404` : Ressource non trouvée
   - `500` : Erreur serveur
3. **Pagination** : `{ page, limit, total, totalPages }`
4. **Dates** : ISO 8601 (`2026-10-06T22:15:00.000Z`)
5. **Prix** : string avec 2 décimales (`"7500.00"`)
6. **Headers** : `Authorization: Bearer <token>` pour les routes protégées
7. **CORS** : autorise `*.vercel.app` et `localhost:*`