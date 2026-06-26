import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";

export async function createModule(
  moduleName: string,
  targetDir = process.cwd(),
): Promise<void> {
  const normalizedName = moduleName.trim();

  if (!normalizedName) {
    throw new Error("Le nom du module est requis.");
  }

  const moduleRoot = path.resolve(targetDir, "src", "modules", normalizedName);

  const directories = [
    path.join(moduleRoot, "domain", "entities"),
    path.join(moduleRoot, "domain", "value-objects"),
    path.join(moduleRoot, "domain", "ports"),
    path.join(moduleRoot, "application", "use-cases"),
    path.join(moduleRoot, "application", "dto"),
    path.join(moduleRoot, "infrastructure", "adapters"),
    path.join(moduleRoot, "infrastructure", "persistence"),
    path.join(moduleRoot, "presentation", "controllers"),
  ];

  for (const directory of directories) {
    fs.ensureDirSync(directory);
  }

  const moduleFileContent = `import { defineModule } from '@/core';

export default defineModule({
  name: '${normalizedName}',
  routes: () => import('./presentation/routes'),
  providers: [] // Aucun pour l'instant en prévision
});
`;

  const routesFileContent = `import { defineRoutes } from '@/core';
import { CreateController } from './controllers/CreateController';

export default defineRoutes([
  {
    method: 'GET',
    path: '/',
    controller: CreateController
  }
]);
`;

  const controllerFileContent = `export class CreateController {}
`;

  fs.writeFileSync(path.join(moduleRoot, ".module.ts"), moduleFileContent);
  fs.writeFileSync(
    path.join(moduleRoot, "presentation", "routes.ts"),
    routesFileContent,
  );
  fs.writeFileSync(
    path.join(moduleRoot, "presentation", "controllers", "CreateController.ts"),
    controllerFileContent,
  );

  console.log(
    chalk.bold.green(`\nModule "${normalizedName}" créé avec succès !`),
  );
  console.log(
    chalk.white(
      `Structure générée dans ${path.relative(targetDir, moduleRoot) || "."}`,
    ),
  );
}
