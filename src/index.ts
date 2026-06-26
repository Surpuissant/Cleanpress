#!/usr/bin/env node
import { Command } from 'commander';
import { createApp } from './commands/create-app';

const program = new Command();

program
  .name('cleanpress')
  .description('CLI pour créer des apps Express avec Clean Architecture')
  .version('1.0.0');

program
  .command('create-app <name>')
  .description('Crée une nouvelle application Express avec Clean Architecture')
  .action(async (name: string) => {
    await createApp(name);
  });

program.parse(process.argv);
