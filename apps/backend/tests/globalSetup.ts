import { TestContainer } from './container/testContainer.js';
import { BookDatabaseManager } from '../src/modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { BookshelfDatabaseManager } from '../src/modules/bookshelfModule/infrastructure/databases/bookshelvesDatabase/bookshelfDatabaseManager.js';
import { UserDatabaseManager } from '../src/modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { UserEventsDatabaseManager } from '../src/modules/userModule/infrastructure/databases/userEventsDatabase/userEventsDatabaseManager.js';

export async function setup(): Promise<void> {
  try {
    const container = TestContainer.create();

    const eventsDatabaseManagers = [UserEventsDatabaseManager];

    const databaseManagers = [UserDatabaseManager, BookDatabaseManager, BookshelfDatabaseManager];

    for (const databaseManager of databaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    for await (const databaseManager of eventsDatabaseManagers) {
      await databaseManager.bootstrapDatabase(container);
    }

    console.log('Database: migrations run succeed.');
  } catch (error) {
    console.log('Database: migrations run error.');

    console.log(error);

    process.exit(1);
  }
}
