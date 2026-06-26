import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

export async function createApp(name: string): Promise<void> {
  const targetDir = path.resolve(process.cwd(), name);

  console.log(chalk.bold.cyan(`\n Création de l'application "${name}"...\n`));

  // 1. Créer le dossier
  const spinnerDir = ora('Initialisation du dossier...').start();
  if (fs.existsSync(targetDir)) {
    spinnerDir.fail(chalk.red(`Le dossier "${name}" existe déjà.`));
    process.exit(1);
  }
  fs.mkdirSync(targetDir, { recursive: true });
  spinnerDir.succeed('Dossier créé');

  // 2. Initialiser le projet Node
  const spinnerInit = ora('Initialisation du projet Node...').start();
  execSync('npm init -y', { cwd: targetDir, stdio: 'ignore' });
  spinnerInit.succeed('package.json généré');

  // 3. Installer les dépendances
  const spinnerDeps = ora('Installation de Express et TypeScript...').start();
  execSync(
    'npm install express && npm install -D typescript ts-node @types/node @types/express',
    { cwd: targetDir, stdio: 'ignore' }
  );
  spinnerDeps.succeed('Dépendances installées');

  // 4. Installer et configurer ESLint
  const spinnerEslint = ora('Configuration ESLint...').start();
  execSync(
    'npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin',
    { cwd: targetDir, stdio: 'ignore' }
  );
  spinnerEslint.succeed('ESLint configuré');

  // 5. Copier les fichiers de config
  const spinnerConfig = ora('Génération des fichiers de configuration...').start();
  const templatesDir = path.resolve(__dirname, '../../templates');
  fs.copySync(path.join(templatesDir, 'tsconfig.json'), path.join(targetDir, 'tsconfig.json'));
  fs.copySync(path.join(templatesDir, '.eslintrc.json'), path.join(targetDir, '.eslintrc.json'));
  spinnerConfig.succeed('TypeScript et ESLint configurés');

  // 6. Créer la structure Clean Architecture
  const spinnerArch = ora('Création de la structure Clean Architecture...').start();
  createCleanArchitecture(targetDir, name);
  spinnerArch.succeed('Structure Clean Architecture créée');

  // 7. Mettre à jour package.json avec les scripts
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = fs.readJsonSync(pkgPath);
  pkg.scripts = {
    dev: 'ts-node src/main.ts',
    build: 'tsc',
    start: 'node dist/main.js',
    lint: 'eslint . --ext .ts'
  };
  pkg.main = 'dist/main.js';
  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

  console.log(chalk.bold.green('\n Application créée avec succès !\n'));
  console.log(chalk.white('Pour démarrer :'));
  console.log(chalk.cyan(`  cd ${name}`));
  console.log(chalk.cyan('  npm run dev\n'));
}

function createCleanArchitecture(targetDir: string, appName: string): void {
  const dirs = [
    'src/domain/entities',
    'src/domain/repositories',
    'src/application/use-cases',
    'src/application/dtos',
    'src/infrastructure/http/routes',
    'src/infrastructure/http/middlewares',
    'src/infrastructure/repositories',
  ];

  for (const dir of dirs) {
    fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
    fs.writeFileSync(path.join(targetDir, dir, '.gitkeep'), '');
  }

  // Fichier AGENTS.md
  fs.writeFileSync(
    path.join(targetDir, 'AGENTS.md'),
    `# ${appName} — Guide pour les agents IA

## Architecture
Ce projet suit la **Clean Architecture**. Respecte strictement la séparation des couches :

- \`src/domain/\` — entités et interfaces (aucune dépendance externe)
- \`src/application/\` — use cases (dépend uniquement du domain)
- \`src/infrastructure/\` — implémentations concrètes, routes Express, accès DB
- \`src/main.ts\` — point d'entrée, composition root

## Règles
- Ne jamais importer \`infrastructure\` depuis \`domain\` ou \`application\`
- Les use cases ne connaissent pas Express (pas de \`req\`, \`res\`)
- Toujours typer explicitement avec TypeScript, pas de \`any\`
- Lancer \`npm run lint\` avant de proposer du code

## Commandes utiles
\`\`\`bash
npm run dev    # démarrer en développement
npm run build  # compiler TypeScript
npm run lint   # vérifier le code
\`\`\`
`
  );

  // Fichier main.ts
  fs.writeFileSync(
    path.join(targetDir, 'src/main.ts'),
    `import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Bienvenue sur ${appName}' });
});

app.listen(PORT, () => {
  console.log(\`Serveur démarré sur http://localhost:\${PORT}\`);
});
`
  );
}
