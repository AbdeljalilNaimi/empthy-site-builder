# 🏥 CityHealth Companion — Extension Chrome

Extension Chrome compagnon de la plateforme **CityHealth** pour un accès rapide au triage IA, à la recherche de professionnels de santé et aux alertes SOS don de sang.

---

## ✨ Fonctionnalités

- **🔍 Recherche rapide** — Trouvez un médecin, pharmacie ou spécialiste directement depuis le popup.

  ![Capture du Widget de Recherche](./public/docs/search-widget.png)

- **🤖 Triage IA** — Accès instantané à l'assistant médical intelligent en un clic.

  ![Capture du Widget de Triage](./public/docs/triage-widget.png)

- **🩸 Carte d'urgence santé** — Affichage rapide du groupe sanguin, allergies, conditions chroniques et contact d'urgence (synchronisé avec votre compte CityHealth).

  ![Capture de la Carte d'Urgence](./public/docs/emergency-card.png)

- **🔔 Alertes SOS don de sang** — Notifications en temps réel des urgences de don de sang, avec historique des 5 dernières alertes.

  ![Capture des Alertes SOS](./public/docs/sos-alerts.png)

- **⚙️ Préférences de notifications** — Son, heures calmes, fréquence et filtre par urgence.

---

## 📦 Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)
- Google Chrome (ou navigateur basé sur Chromium)

---

## 🚀 Installation & Build

```bash
# 1. Accéder au dossier de l'extension
cd cityhealth-extension

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env
# Puis remplissez .env avec vos identifiants :
#   VITE_APP_URL=https://votre-app.lovable.app
#   VITE_SUPABASE_URL=https://votre-projet.supabase.co
#   VITE_SUPABASE_ANON_KEY=votre-clé-anon

# 4. Compiler l'extension
npm run build
```

Cela génère un dossier `dist/` contenant tous les fichiers prêts à être chargés dans Chrome.

---

## 🧩 Charger l'extension dans Chrome

1. Ouvrez Chrome et allez dans `chrome://extensions/`
2. Activez le **Mode développeur** (en haut à droite)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `cityhealth-extension/dist/`
5. L'extension apparaît dans la barre d'outils ✅

---

## 🔧 Développement

```bash
# Lancer le serveur de développement (pour le popup uniquement)
npm run dev
```

> **Note :** Le mode dev sert le popup via Vite. Pour tester l'extension complète (background script, notifications), il faut faire un `npm run build` et recharger dans Chrome.

### Structure du projet

```
cityhealth-extension/
├── .env.example               # Variables d'environnement (template)
├── dist/                      # Build généré (ne pas commiter)
├── public/
│   ├── icons/                 # Icônes de l'extension (16, 48, 128px)
│   └── docs/                  # Captures d'écran pour la documentation
├── src/
│   ├── Popup.tsx              # Hub principal : recherche, triage, carte d'urgence
│   ├── OptionsPage.tsx        # Préférences notifications + confidentialité
│   ├── background.ts          # Service worker (alertes SOS temps réel)
│   ├── supabaseClient.ts      # Client Supabase (via variables d'env)
│   ├── main.tsx               # Point d'entrée du popup
│   └── options-main.tsx       # Point d'entrée de la page d'options
├── index.html                 # HTML du popup
├── options.html               # HTML de la page d'options
├── manifest.json              # Manifest Chrome v3
├── vite.config.ts             # Config Vite (popup + options)
├── vite.background.config.ts  # Config Vite (service worker)
└── package.json
```

---

## ⚙️ Configuration

L'extension utilise des **variables d'environnement** pour sa configuration. Créez un fichier `.env` basé sur `.env.example` :

| Variable | Description |
|----------|-------------|
| `VITE_APP_URL` | URL de l'application CityHealth principale |
| `VITE_SUPABASE_URL` | URL du projet backend |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme du projet backend |

> ⚠️ Ne commitez jamais le fichier `.env` contenant vos clés réelles.

---

## 📝 Utilisation

1. **Connectez-vous** avec vos identifiants CityHealth
2. **Recherchez** un médecin, pharmacie ou spécialiste via la barre de recherche
3. **Lancez le Triage IA** en un clic pour une évaluation rapide de vos symptômes
4. **Consultez votre carte d'urgence** (groupe sanguin, allergies…)
5. **Recevez des alertes SOS** de don de sang en temps réel
6. **Personnalisez** vos notifications via l'icône ⚙️ → Options

---

## 🔒 Confidentialité

- **Notifications** : Utilisées uniquement pour les alertes vitales de don de sang.
- **Stockage local** : Vos préférences sont sauvegardées en toute sécurité sur votre appareil uniquement.
- Aucune donnée personnelle n'est partagée avec des tiers.
