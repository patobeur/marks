# Bookmark Cleaner Extension 🧹

Une extension navigateur performante et élégante pour organiser, nettoyer et gérer vos marque-pages. Compatible nativement avec **Google Chrome** et **Mozilla Firefox**.

## ⏱️ à faire en 

- [x] 2 heures max 

## ✨ Fonctionnalités

### 🔍 Détection de doublons
- **Scan Rapide** : Analyse instantanée de milliers de favoris.
- **Mode Intelligent** : Détecte les doublons par URL (par défaut).
- **Mode Strict** : Détecte les doublons uniquement si l'URL ET le titre sont identiques (configurable dans les Options).

### 🛠️ Outils de Nettoyage
- **Voir Liste** : Affiche un rapport détaillé avec la liste de tous les doublons trouvés, leur date d'ajout et leur emplacement.
- **Regrouper** : Déplace automatiquement tous les doublons dans le même dossier que l'original (le plus ancien) pour trier facilement.
- **Supprimer** : Garde uniquement la version la plus ancienne de chaque favori et supprime toutes les copies superflues en un clic.

### 🌍 Internationalisation
- Interface entièrement traduite en **Français 🇫🇷**, **Anglais 🇺🇸**, et **Espagnol 🇪🇸**.

---

## 🚀 Installation

### 1. Google Chrome (Edge, Brave, Vivaldi...)
1. Téléchargez ou clonez ce dossier.
2. Ouvrez Chrome et allez sur `chrome://extensions`.
3. Activez le **Mode développeur** (interrupteur en haut à droite).
4. Cliquez sur **"Charger l'extension non empaquetée"**.
5. Sélectionnez le dossier **`chrome_build`** ( situé dans le dossier du projet).
6. C'est prêt ! L'icône apparaît dans votre barre d'outils.

### 2. Mozilla Firefox
1. Ouvrez Firefox et tapez `about:debugging` dans la barre d'adresse.
2. Cliquez sur **"Ce Firefox"** (à gauche).
3. Cliquez sur **"Charger un module complémentaire temporaire..."**.
4. Naviguez dans le dossier **`firefox_build`** du projet.
5. Sélectionnez le fichier **`manifest.json`**.
6. L'extension est active !

---

## 👨‍💻 Développement et Structure

Ce projet utilise une architecture source/build pour garantir la compatibilité cross-browser sans duplication de code manuelle.

### Structure des dossiers
- **`src/`** : 🌟 **Code Source Maître**. C'est ici que tout le développement se fait.
    - `_locales/` : Fichiers de traduction.
    - `lib/` : Logique métier (BookmarkManager.js, Config.js).
    - `popup/`, `options/`, `report/` : Code des différentes interfaces.
- **`chrome_build/`** : Version générée automatiquement pour Chrome (Manifest V3 standard).
- **`firefox_build/`** : Version générée automatiquement pour Firefox (Manifest V3 compatible Mozilla).
- **`build.bat`** : Script Windows pour compiler les modifications de `src` vers les dossiers de build.

### Comment modifier le code ?
1. Faites vos modifications **uniquement** dans le dossier **`src/`**.
2. Double-cliquez sur le script **`build.bat`** à la racine.
3. Le script va copier les fichiers et préparer les manifeste corrects pour chaque navigateur dans `chrome_build` et `firefox_build`.
4. Rechargez l'extension dans votre navigateur pour voir les changements.

---

## ⚠️ Notes Importantes
- **Suppression** : L'action de suppression est définitive. L'extension demandera toujours une confirmation avant d'agir.
- **Vie Privée** : Cette extension fonctionne **localement** sur votre machine. Aucune donnée n'est envoyée vers des serveurs externes.

---
*Développé avec ❤️ pour des marque-pages bien rangés ou presque.*
