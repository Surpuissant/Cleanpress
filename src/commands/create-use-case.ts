import fs from "fs";
import path from "path";

export async function createUseCaseCommand(moduleName: string, name: string) {
  if (!moduleName || !name) {
    console.error("Usage: cleanpress create-use-case <module> <Name>");
    process.exit(1);
  }

  const basePath = path.join(
    "src",
    "modules",
    moduleName,
    "application"
  );

  const useCaseDir = path.join(basePath, "use-cases");
  const dtoDir = path.join(basePath, "dto");

  const useCasePath = path.join(useCaseDir, `${name}UseCase.ts`);
  const inputPath = path.join(dtoDir, `${name}Input.ts`);
  const outputPath = path.join(dtoDir, `${name}Output.ts`);

  // 1. créer dossiers
  fs.mkdirSync(useCaseDir, { recursive: true });
  fs.mkdirSync(dtoDir, { recursive: true });

  // 2. générer contenu
  const useCaseContent = generateUseCase(name);
  const inputContent = generateInput(name);
  const outputContent = generateOutput(name);

  // 3. écrire fichiers
  fs.writeFileSync(useCasePath, useCaseContent);
  fs.writeFileSync(inputPath, inputContent);
  fs.writeFileSync(outputPath, outputContent);

  console.log(`✅ UseCase ${name} créé dans module ${moduleName}`);
}

function generateUseCase(name: string) {
  return `export class ${name}UseCase {
  async execute(input: ${name}Input): Promise<${name}Output> {
    throw new Error("Not implemented");
  }
}
`;
}

function generateInput(name: string) {
  return `export interface ${name}Input {
}
`;
}

function generateOutput(name: string) {
  return `export interface ${name}Output {
}
`;
}