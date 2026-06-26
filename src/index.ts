#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { createApp } from './commands/create-app';
import { createController } from './commands/create-controller';

const program = new Command();

program
  .name('cleanpress')
  .description(chalk.cyan('CLI pour créer des apps Express avec Clean Architecture'))
  .version('1.0.0')
  .addHelpText('before', `
${chalk.bold.cyan('╔══════════════════════════════════════╗')}
${chalk.bold.cyan('║')}        ${chalk.bold.white('CleanPress CLI  v1.0.0')}        ${chalk.bold.cyan('║')}
${chalk.bold.cyan('╚══════════════════════════════════════╝')}
`)
  .addHelpText('after', `
${chalk.bold('Exemples :')}
  ${chalk.cyan('$ cleanpress create-app mon-api')}       Crée une app nommée mon-api
  ${chalk.cyan('$ cleanpress create-app my-project')}    Crée une app nommée my-project
  ${chalk.cyan('$ cleanpress create-controller users CreateUser')} Crée une route et son controller

${chalk.bold('Structure générée :')}
  ${chalk.gray('mon-api/')}
  ${chalk.gray('├── src/')}
  ${chalk.gray('│   ├── domain/          ← entités, interfaces')}
  ${chalk.gray('│   ├── application/     ← use cases, dtos')}
  ${chalk.gray('│   ├── modules/         ← controllers, routes')}
  ${chalk.gray('│   ├── infrastructure/  ← DB, implémentations')}
  ${chalk.gray('│   └── main.ts          ← point d\'entrée')}
  ${chalk.gray('├── tsconfig.json')}
  ${chalk.gray('├── .eslintrc.json')}
  ${chalk.gray('└── AGENTS.md')}

${chalk.bold('Après création :')}
  ${chalk.cyan('$ cd mon-api && npm run dev')}
`);

program
  .command('create-app <name>')
  .description('Crée une nouvelle application Express avec Clean Architecture')
  .action(async (name: string) => {
    await createApp(name);
  });

program
  .command('create-controller <routeName> <controllerName>')
  .description('Crée une route Express et le controller associé')
  .action(async (routeName: string, controllerName: string) => {
    await createController(routeName, controllerName);
  });

program.parse(process.argv);
