# CleanPress

> Un framework CLI pour générer des projets Node.js/Express structurés en **Clean Architecture**, avec TypeScript, ESLint et tout ce qu'il faut — sans la corvée de setup.

---

## C'est quoi CleanPress ?

CleanPress est un outil en ligne de commande qui t'évite de partir d'une page blanche à chaque nouveau projet API. En une commande, tu obtiens une base de projet Express bien organisée, avec TypeScript configuré, ESLint prêt à l'emploi et une structure Clean Architecture en place.

Tu peux ensuite générer tes modules, tes use cases et tes controllers au fil de l'eau, toujours au bon endroit, toujours dans le bon format.

---

## Installation

> **Prérequis :** Node.js ≥ 16, npm

```bash
# 1. Cloner le dépôt
git clone https://github.com/ton-utilisateur/cleanpress.git
cd cleanpress

# 2. Installer les dépendances
npm install

# 3. Compiler le TypeScript
npm run build

# 4. Rendre la commande disponible globalement
npm link
```

Une fois le lien créé, la commande `cleanpress` est disponible dans ton terminal, où que tu sois.

---

## Démarrage rapide

```bash
# Aller dans le dossier de ton choix
cd ~/Desktop

# Créer une nouvelle app
cleanpress create-app mon-api

# Aller dans le projet généré
cd mon-api

# Lancer le serveur de développement
npm run dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000) dans ton navigateur.

---

## Commandes CLI

---

### `cleanpress create-app <nom>`

Initialise un nouveau projet complet.

```bash
cleanpress create-app mon-api
```

Ce que ça fait :
- Initialise le projet Node.js
- Installe Express et le framework
- Configure TypeScript
- Ajoute les règles ESLint
- Génère la structure Clean Architecture de base
- Génère un fichier `agent.md` à la racine du projet

---

### Le fichier `agent.md`

`create-app` génère automatiquement un fichier `agent.md` à la racine du projet. Son rôle est de documenter les **règles d'architecture à respecter par couche**, afin qu'elles soient lisibles par n'importe quel agent IA (Copilot, Cursor, Claude…) travaillant sur le projet. Concrètement, il empêche un assistant de "prendre des raccourcis" importer Prisma dans le domaine, accéder à `req/res` directement dans un controller, ou court-circuiter un port en rendant ces contraintes explicites et consultables en contexte.

---

### `cleanpress create-module <module>`

Génère la structure complète d'un module métier.

```bash
cleanpress create-module users
```

Résultat :

```
src/
  modules/
    users/
      users.module.ts
      domain/
        entities/
        value-objects/
        ports/
      application/
        use-cases/
        dto/
      infrastructure/
        adapters/
        persistence/
      presentation/
        controllers/
        routes.ts
```

---

### `cleanpress create-use-case <module> <NomDuUseCase>`

Génère un use case et ses DTOs associés dans le module cible.

```bash
cleanpress create-use-case users CreateUser
```

Résultat :

```
src/
  modules/
    users/
      application/
        use-cases/
          CreateUserUseCase.ts
        dto/
          CreateUserInput.ts
          CreateUserOutput.ts
```

---

### `cleanpress create-controller <module> <NomDuController>`

Génère un controller et met à jour le fichier de routes du module cible.

```bash
cleanpress create-controller users CreateUser
```

Résultat :

```
src/
  modules/
    users/
      presentation/
        controllers/
          CreateUserController.ts
        routes.ts
```

### `cleanpress --help`

Affiche l'aide générale et la liste des commandes disponibles.

```bash
cleanpress --help
```

---

## Exemple de workflow complet

```bash
# 1. Créer le projet
cleanpress create-app mon-api
cd mon-api

# 2. Créer un module
cleanpress create-module users

# 3. Ajouter un use case
cleanpress create-use-case users CreateUser

# 4. Ajouter le controller correspondant
cleanpress create-controller users CreateUser

# 5. Lancer le serveur
npm run dev
```

---

## Structure générée

```
mon-api/
  src/
    modules/
      users/
        users.module.ts
        domain/
          entities/
          value-objects/
          ports/
        application/
          use-cases/
            CreateUserUseCase.ts
          dto/
            CreateUserInput.ts
            CreateUserOutput.ts
        infrastructure/
          adapters/
          persistence/
        presentation/
          controllers/
            CreateUserController.ts
          routes.ts
  tsconfig.json
  .eslintrc
  package.json
  agent.md
```
