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

  const moduleFileContent = `import { defineModule } from '../../core';
import routes from './presentation/routes';

export default defineModule({
  name: '${normalizedName}',
  routes,
  providers: []
});
`;

  const routesFileContent = `import { defineRoutes } from '../../../core';

export default defineRoutes([]);
`;

  fs.writeFileSync(path.join(moduleRoot, ".module.ts"), moduleFileContent);
  fs.writeFileSync(
    path.join(moduleRoot, "presentation", "routes.ts"),
    routesFileContent,
  );

  updateModulesRegistry(targetDir, normalizedName);

  console.log(
    chalk.bold.green(`\nModule "${normalizedName}" créé avec succès !`),
  );
  console.log(
    chalk.white(
      `Structure générée dans ${path.relative(targetDir, moduleRoot) || "."}`,
    ),
  );
}

function updateModulesRegistry(targetDir: string, moduleName: string): void {
  const registryPath = path.join(targetDir, "src", "modules.ts");
  const importPath = `./modules/${moduleName}/.module`;
  const importStatement = `import Module from '${importPath}';\n`;

  if (!fs.existsSync(registryPath)) {
    fs.writeFileSync(
      registryPath,
      `${importStatement}\nexport const modules = [Module];\n`,
    );
    return;
  }

  let registryContent = fs.readFileSync(registryPath, "utf8");

  if (!registryContent.includes(importStatement)) {
    const importRegex = /^(?:import\s+.+?;\s*)+/m;
    if (importRegex.test(registryContent)) {
      registryContent = registryContent.replace(
        importRegex,
        (match) => `${match}${importStatement}`,
      );
    } else {
      registryContent = `${importStatement}${registryContent}`;
    }
  }

  const modulesArrayRegex = /export\s+const\s+modules\s*=\s*\[(.*?)\];/s;
  if (modulesArrayRegex.test(registryContent)) {
    registryContent = registryContent.replace(
      modulesArrayRegex,
      (_match, arrayContent: string) => {
        const trimmedContent = arrayContent.trim();
        if (!trimmedContent) {
          return `export const modules = [Module];`;
        }

        if (trimmedContent.includes("Module")) {
          return `export const modules = [${trimmedContent}];`;
        }

        return `export const modules = [${trimmedContent}, Module];`;
      },
    );
  } else {
    registryContent += `\nexport const modules = [Module];\n`;
  }

  fs.writeFileSync(registryPath, registryContent);
}
