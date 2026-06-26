import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { buildDefineRoutesTemplate } from '../templates/define-routes';
import { normalizeControllerName, normalizeRoute, toCamelCase } from '../utils/naming';

export async function createController(routeName: string, controllerName: string): Promise<void> {
  const targetDir = process.cwd();
  const srcDir = path.join(targetDir, 'src');
  const mainPath = path.join(srcDir, 'main.ts');

  const { route, controllerClassName } = resolveNames(routeName, controllerName);
  const routeVariableName = `${toCamelCase(route.moduleName)}Routes`;

  console.log(chalk.bold.cyan(`\n Création du controller "${controllerClassName}"...\n`));

  if (!fs.existsSync(srcDir)) {
    console.log(chalk.red('Le dossier src est introuvable. Lance cette commande à la racine d\'une app CleanPress.'));
    process.exit(1);
  }

  const moduleDir = path.join(srcDir, 'modules', route.moduleName);
  const presentationDir = path.join(moduleDir, 'presentation');
  const controllersDir = path.join(presentationDir, 'controllers');
  const sharedPresentationDir = path.join(srcDir, 'shared/presentation');
  const defineRoutesPath = path.join(sharedPresentationDir, 'defineRoutes.ts');
  const controllerPath = path.join(controllersDir, `${controllerClassName}.ts`);
  const routePath = path.join(presentationDir, 'routes.ts');

  const spinnerDirs = ora('Préparation du module...').start();
  fs.ensureDirSync(moduleDir);
  fs.ensureDirSync(presentationDir);
  fs.ensureDirSync(controllersDir);
  fs.ensureDirSync(sharedPresentationDir);
  removeGitkeep(moduleDir);
  removeGitkeep(presentationDir);
  removeGitkeep(controllersDir);
  removeGitkeep(sharedPresentationDir);
  spinnerDirs.succeed('Module prêt');

  const spinnerDefineRoutes = ora('Génération du gestionnaire de routes...').start();
  if (!fs.existsSync(defineRoutesPath)) {
    fs.writeFileSync(defineRoutesPath, buildDefineRoutesTemplate());
    spinnerDefineRoutes.succeed(`Gestionnaire créé : ${path.relative(targetDir, defineRoutesPath)}`);
  } else {
    spinnerDefineRoutes.succeed('Gestionnaire de routes déjà présent');
  }

  const spinnerController = ora('Génération du controller...').start();
  ensureFileDoesNotExist(controllerPath, spinnerController);
  fs.writeFileSync(controllerPath, buildControllerTemplate(controllerClassName));
  spinnerController.succeed(`Controller créé : ${path.relative(targetDir, controllerPath)}`);

  const spinnerRoute = ora('Génération de la route...').start();
  ensureFileDoesNotExist(routePath, spinnerRoute);
  fs.writeFileSync(
    routePath,
    buildRouteTemplate(route.path, controllerClassName)
  );
  spinnerRoute.succeed(`Route créée : ${path.relative(targetDir, routePath)}`);

  const spinnerMain = ora('Connexion de la route dans main.ts...').start();
  if (!fs.existsSync(mainPath)) {
    spinnerMain.warn('main.ts introuvable, import manuel nécessaire');
  } else {
    registerRouteInMain(mainPath, route.moduleName, routeVariableName);
    spinnerMain.succeed('Route connectée dans main.ts');
  }

  console.log(chalk.bold.green('\n Controller et route créés avec succès !\n'));
  console.log(chalk.white('Fichiers générés :'));
  console.log(chalk.cyan(`  ${path.relative(targetDir, controllerPath)}`));
  console.log(chalk.cyan(`  ${path.relative(targetDir, routePath)}\n`));
}

function ensureFileDoesNotExist(filePath: string, spinner: ora.Ora): void {
  if (fs.existsSync(filePath)) {
    spinner.fail(chalk.red(`Le fichier "${filePath}" existe déjà.`));
    process.exit(1);
  }
}

function resolveNames(
  routeName: string,
  controllerName: string
): { route: ReturnType<typeof normalizeRoute>; controllerClassName: string } {
  try {
    return {
      route: normalizeRoute(routeName),
      controllerClassName: normalizeControllerName(controllerName),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Paramètres invalides.';
    console.log(chalk.red(message));
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

function buildRouteTemplate(routePath: string, controllerClassName: string): string {
  return `import { defineRoutes } from '../../../shared/presentation/defineRoutes';
import { ${controllerClassName} } from './controllers/${controllerClassName}';

export default defineRoutes([
  {
    method: 'GET',
    path: '${routePath}',
    controller: ${controllerClassName},
  },
]);
`;
}

function registerRouteInMain(
  mainPath: string,
  moduleName: string,
  routeVariableName: string
): void {
  let content = fs.readFileSync(mainPath, 'utf8');
  const importLine = `import ${routeVariableName} from './modules/${moduleName}/presentation/routes';`;
  const useLine = `app.use(${routeVariableName});`;

  if (!content.includes(importLine)) {
    content = content.replace(/(import express from 'express';\n)/, `$1${importLine}\n`);
  }

  if (!content.includes(useLine)) {
    content = content.replace(/(app\.use\(express\.json\(\)\);\n)/, `$1${useLine}\n`);
  }

  fs.writeFileSync(mainPath, content);
}
