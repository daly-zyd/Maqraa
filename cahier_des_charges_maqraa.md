# Cahier des Charges
## Site Web – مقرأة قرآن "نحيا" (Rijel & Nissa)

---

## 1. Contexte et présentation du projet

Le projet consiste à concevoir un site web pour une مقرأة قرآن (institut/école coranique) proposant des activités pour hommes et femmes séparément : apprentissage du Coran, contenus de développement spirituel et personnel (tazkiya), et autres activités communautaires.

Le site doit dans un premier temps être développé en **React**, avec un **contenu statique** (pas de backend, pas de base de données pour l'instant). Cette contrainte n'est pas définitive : une base de données/API pourra être ajoutée à tout moment. L'architecture doit donc être pensée pour permettre cette évolution sans réécrire le site.

---

## 2. Objectifs du projet

- Présenter la مقرأة, sa mission, ses valeurs et son organisation.
- Informer sur les programmes et activités proposés (Coran, tajwid, tazkiya, cours, événements).
- Offrir une expérience distincte mais cohérente pour la section نساء et la section رجال.
- Poser les bases techniques pour ajouter plus tard un espace membre et un backend, sans tout refaire.

---

## 3. Public cible

- Hommes et femmes de la communauté souhaitant s'inscrire ou suivre les activités de la مقرأة.
- Parents cherchant des informations sur les programmes pour leurs enfants (à confirmer si concerné).
- Visiteurs souhaitant découvrir l'institut avant de s'engager.

*(À valider : y a-t-il aussi des programmes pour enfants/adolescents ?)*

---

## 4. Périmètre du projet

### Phase 1 (objet de ce cahier des charges)
- Site vitrine React, **contenu statique** (fichiers JSON/JS locaux, aucun appel API, aucune BDD).
- Sections publiques : présentation, programmes, contenu (Coran/tazkiya), contact.
- Filtrage visuel du contenu par section (رجال / نساء) sans authentification.

### Phase 2 (évolution future — à tout moment, non planifiée précisément)
- Espace membre avec authentification.
- Backend + base de données (API pour gérer utilisateurs, progression, contenus dynamiques).
- Tableau de suivi (ex. suivi de mémorisation, présence aux cours).

---

## 5. Arborescence du site (proposition)
/                          → Accueil
/a-propos                  → Présentation de la مقرأة, mission, équipe
/programmes                → Liste des programmes (filtrable rijel / nissa)
/programmes/:slug          → Détail d'un programme
/coran                     → Ressources coraniques (sourates, tajwid, audio si dispo)
/tazkiya                   → Contenus de développement spirituel / bien-être
/evenements                → Calendrier / annonces
/contact                   → Formulaire de contact, localisation, horaires

---

## 6. Fonctionnalités détaillées

### 6.1 Page d'accueil
- Bannière/héro avec identité visuelle de la مقرأة.
- Présentation rapide des deux sections (رجال / نساء) avec accès direct.
- Mise en avant des programmes phares et prochains événements.

### 6.2 Filtrage par section (رجال / نساء)
- Un sélecteur unique permettant de filtrer le contenu (programmes, horaires, encadrants) selon la section.
- Le contenu reste dans la même source de données, affiché différemment selon le filtre choisi.

### 6.3 Programmes / Contenus pédagogiques
- Liste des programmes : Coran (lecture, tajwid, mémorisation), tazkiya, autres ateliers.
- Fiche détaillée par programme : objectifs, niveau, horaires, encadrant(e).

### 6.4 Contenu coranique
- Présentation des supports (sourates travaillées, règles de tajwid).
- Espace prévu pour audio/vidéo (activable plus tard si besoin d'hébergement dynamique).

### 6.5 Contact & Localisation
- Formulaire de contact (envoi via service tiers type EmailJS/Formspree tant qu'il n'y a pas de backend).
- Carte / adresse / horaires d'ouverture.

### 6.6 Multilingue & RTL
- Interface bilingue arabe (RTL) / français (LTR), avec bascule de langue.
- Gestion propre du RTL pour tous les composants (texte, navigation, formulaires).

---

## 7. Exigences non-fonctionnelles

| Exigence | Détail |
|---|---|
| Responsive | Mobile-first, adapté tablette/desktop |
| Performance | Chargement rapide, images optimisées |
| Accessibilité | Contrastes suffisants, tailles de police lisibles pour du texte coranique |
| SEO | Balises meta, structure sémantique, URLs propres |
| Compatibilité | Chrome, Safari, Firefox, Edge (versions récentes) |

---

## 8. Spécifications techniques (Phase 1)

- Framework : React (Vite recommandé).
- Routing : react-router-dom.
- Style : Tailwind CSS (facilite le support RTL).
- Contenu : fichiers JSON/JS locaux, isolés dans une couche dédiée pour faciliter le passage à une API plus tard.
- i18n : react-i18next pour gérer AR/FR.
- Formulaire de contact : service externe (EmailJS, Formspree) en l'absence de backend.
- Hébergement prévu : à définir (Vercel/Netlify adaptés à un site React statique).

---

## 9. Design / Charte graphique

- Palette de couleurs : à définir (inspiration islamique : verts, or, tons neutres ?).
- Typographie arabe adaptée à la lecture coranique (ex. Amiri, Scheherazade) + police latine pour le français.
- Logo / identité visuelle de la مقرأة : disponible ou à créer.

---

## 10. Livrables attendus

- Code source React complet et documenté.
- Site déployé sur l'hébergement choisi.
- Documentation rapide (README) pour ajouter/modifier du contenu statique.

---

## 11. Évolutions futures (hors Phase 1)

- Ajout d'une base de données / backend (à tout moment, sans contrainte de délai).
- Authentification et espace membre (rijel/nissa avec comptes séparés si besoin).
- Suivi de progression (mémorisation, présence).
- Contenu audio/vidéo hébergé dynamiquement.

---

### Points à clarifier
1. Nom définitif du site/de l'institut.
2. Palette de couleurs et logo (disponibles ou à créer).
3. Y a-t-il des programmes spécifiques pour enfants ?
4. Faut-il du contenu audio (récitation) dès la Phase 1 ?
5. Langue principale de rédaction du contenu (arabe, français, ou les deux) ?
