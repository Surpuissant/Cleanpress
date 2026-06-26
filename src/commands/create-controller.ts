import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export async function createController(routeName: string, controllerName: string): Promise<void> {
  const targetDir = process.cwd();
  const srcDir = path.join(targetDir, 'src');
  const mainPath = path.join(srcDir, 'main.ts');

  const route = normalizeRoute(routeName);
  const controllerClassName = normalizeControllerName(controllerName);
  const controllerInstanceName = toCamelCase(controllerClassName);
  const routeVariableName = `${toCamelCase(route.fileName)}Routes`;

  console.log(chalk.bold.cyan(`\n Création du controller "${controllerClassName}"...\n`));

  if (!fs.existsSync(srcDir)) {
    console.log(chalk.red('Le dossier src est introuvable. Lance cette commande à la racine d\'une app CleanPress.'));
    process.exit(1);
  }

  const controllersDir = path.join(srcDir, 'infrastructure/http/controllers');
  const routesDir = path.join(srcDir, 'infrastructure/http/routes');
  const controllerPath = path.join(controllersDir, `${controllerClassName}.ts`);
  const routePath = path.join(routesDir, `${route.fileName}.routes.ts`);

  const spinnerDirs = ora('Préparation des dossiers HTTP...').start();
  fs.ensureDirSync(controllersDir);
  fs.ensureDirSync(routesDir);
  removeGitkeep(controllersDir);
  removeGitkeep(routesDir);
  spinnerDirs.succeed('Dossiers HTTP prêts');

  const spinnerController = ora('Génération du controller...').start();
  ensureFileDoesNotExist(controllerPath, spinnerController);
  fs.writeFileSync(controllerPath, buildControllerTemplate(controllerClassName));
  spinnerController.succeed(`Controller créé : ${path.relative(targetDir, controllerPath)}`);

  const spinnerRoute = ora('Génération de la route...').start();
  ensureFileDoesNotExist(routePath, spinnerRoute);
  fs.writeFileSync(
    routePath,
    buildRouteTemplate(controllerClassName, controllerInstanceName)
  );
  spinnerRoute.succeed(`Route créée : ${path.relative(targetDir, routePath)}`);

  const spinnerMain = ora('Connexion de la route dans main.ts...').start();
  if (!fs.existsSync(mainPath)) {
    spinnerMain.warn('main.ts introuvable, import manuel nécessaire');
  } else {
    registerRouteInMain(mainPath, route.path, route.fileName, routeVariableName);
    spinnerMain.succeed('Route connectée dans main.ts');
  }

  console.log(chalk.bold.green('\n Controller et route créés avec succès !\n'));
  console.log(chalk.white('Fichiers générés :'));
  console.log(chalk.cyan(`  ${path.relative(targetDir, controllerPath)}`));
  console.log(chalk.cyan(`  ${path.relative(targetDir, routePath)}\n`));
}

function normalizeRoute(routeName: string): { path: string; fileName: string } {
  const cleaned = routeName.trim().replace(/^\/+|\/+$/g, '');

  if (!cleaned) {
    console.log(chalk.red('Le nom de la route est obligatoire.'));
    process.exit(1);
  }

  const fileName = cleaned
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9/-]/g, '-')
    .replace(/\//g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  return {
    path: `/${cleaned}`,
    fileName,
  };
}

function normalizeControllerName(controllerName: string): string {
  const pascalName = toPascalCase(controllerName);

  if (!pascalName) {
    console.log(chalk.red('Le nom du controller est obligatoire.'));
    process.exit(1);
  }

  return pascalName.endsWith('Controller') ? pascalName : `${pascalName}Controller`;
}

function toPascalCase(value: string): string {
  return value
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toCamelCase(value: string): string {
  const pascalName = toPascalCase(value);
  return pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
}

function ensureFileDoesNotExist(filePath: string, spinner: ora.Ora): void {
  if (fs.existsSync(filePath)) {
    spinner.fail(chalk.red(`Le fichier "${filePath}" existe déjà.`));
    process.exit(1);
  }
}

function removeGitkeep(dirPath: string): void {
  const gitkeepPath = path.join(dirPath, '.gitkeep');

  if (fs.existsSync(gitkeepPath)) {
    fs.removeSync(gitkeepPath);
  }
}

function buildControllerTemplate(controllerClassName: string): string {
  return `import { Request, Response } from 'express';

export class ${controllerClassName} {
  public async handle(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message: '${controllerClassName} exécuté avec succès',
    });
  }
}
`;
}

function buildRouteTemplate(controllerClassName: string, controllerInstanceName: string): string {
  return `import { Router } from 'express';
import { ${controllerClassName} } from '../controllers/${controllerClassName}';

const router = Router();
const ${controllerInstanceName} = new ${controllerClassName}();

router.post('/', (req, res) => ${controllerInstanceName}.handle(req, res));

export default router;
`;
}

function registerRouteInMain(
  mainPath: string,
  routePath: string,
  routeFileName: string,
  routeVariableName: string
): void {
  let content = fs.readFileSync(mainPath, 'utf8');
  const importLine = `import ${routeVariableName} from './infrastructure/http/routes/${routeFileName}.routes';`;
  const useLine = `app.use('${routePath}', ${routeVariableName});`;

  if (!content.includes(importLine)) {
    content = content.replace(/(import express from 'express';\n)/, `$1${importLine}\n`);
  }

  if (!content.includes(useLine)) {
    content = content.replace(/(app\.use\(express\.json\(\)\);\n)/, `$1${useLine}\n`);
  }

  fs.writeFileSync(mainPath, content);
}
