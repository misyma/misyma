import { BookDatabaseManager } from '../src/modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { BookshelfDatabaseManager } from '../src/modules/bookshelfModule/infrastructure/databases/bookshelvesDatabase/bookshelfDatabaseManager.js';
import { UserDatabaseManager } from '../src/modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';

import { TestContainer } from './testContainer.js';

export async function setup(): Promise<void> {
  try {
    const container = await TestContainer.create();

    const databaseManagers = [UserDatabaseManager, BookshelfDatabaseManager, BookDatabaseManager];

    for (const databaseManager of databaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    console.log('Database: migrations run succeed.');
  } catch (error) {
    console.log('Database: migrations run error.');

    console.log(error);

    process.exit(1);
  }
}
