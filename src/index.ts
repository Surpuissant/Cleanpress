#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createApp } from "./commands/create-app";
import { createModule } from "./commands/create-module";
import { createUseCaseCommand } from './commands/create-use-case';

const program = new Command();

program
  .name("cleanpress")
  .description(
    chalk.cyan("CLI pour créer des apps Express avec Clean Architecture"),
  )
  .version("1.0.0")
  .addHelpText(
    "before",
    `
${chalk.bold.cyan("╔══════════════════════════════════════╗")}
${chalk.bold.cyan("║")}        ${chalk.bold.white("CleanPress CLI  v1.0.0")}        ${chalk.bold.cyan("║")}
${chalk.bold.cyan("╚══════════════════════════════════════╝")}
`,
  )
  .addHelpText(
    "after",
    `
${chalk.bold("Exemples :")}
  ${chalk.cyan("$ cleanpress create-app mon-api")}       Crée une app nommée mon-api
  ${chalk.cyan("$ cleanpress create-app my-project")}    Crée une app nommée my-project

${chalk.bold("Structure générée :")}
  ${chalk.gray("mon-api/")}
  ${chalk.gray("├── src/")}
  ${chalk.gray("│   ├── domain/          ← entités, interfaces")}
  ${chalk.gray("│   ├── application/     ← use cases, dtos")}
  ${chalk.gray("│   ├── infrastructure/  ← routes Express, DB")}
  ${chalk.gray("│   └── main.ts          ← point d'entrée")}
  ${chalk.gray("├── tsconfig.json")}
  ${chalk.gray("├── .eslintrc.json")}
  ${chalk.gray("└── AGENTS.md")}

${chalk.bold("Après création :")}
  ${chalk.cyan("$ cd mon-api && npm run dev")}
`,
  );

program
  .command("version")
  .description("Affiche la version de CleanPress")
  .action(() => {
    console.log(
      `\n${chalk.bold.cyan("CleanPress")} ${chalk.white("v1.0.0")}\n`,
    );
  });

program
  .command("create-app <name>")
  .description("Crée une nouvelle application Express avec Clean Architecture")
  .action(async (name: string) => {
    await createApp(name);
  });

program
  .command("create-module <name>")
  .description(
    "Crée une structure de module Clean Architecture dans src/modules",
  )
  .action(async (name: string) => {
    await createModule(name);
  });

program
  .command("create-use-case <module> <name>")
  .description("Crée un Use Case + DTOs dans un module")
  .action(async (module: string, name: string) => {
    await createUseCaseCommand(module, name);
  });


program.parse(process.argv);
