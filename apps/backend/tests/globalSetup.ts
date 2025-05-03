import path from 'path';

process.env['NODE_CONFIG_DIR'] = path.resolve(import.meta.dirname, '../config');

import { type DatabaseManager } from '../src/modules/databaseModule/infrastructure/databaseManager.js';
import { databaseSymbols } from '../src/modules/databaseModule/symbols.js';

import { TestContainer } from './testContainer.js';

export async function setup(): Promise<void> {
  try {
    const container = await TestContainer.create();

    const databaseManager = container.get<DatabaseManager>(databaseSymbols.databaseManager);

    await databaseManager.setupDatabase();

    console.log('Database: migrations run succeed.');
  } catch (error) {
    console.log('Database: migrations run error.');

    console.log(error);

    process.exit(1);
  }
}
