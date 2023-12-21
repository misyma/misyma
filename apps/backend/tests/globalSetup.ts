import { Application } from '../src/core/application.js';
import { AuthorDatabaseManager } from '../src/modules/authorModule/infrastructure/databases/authorDatabaseManager.js';
import { BookDatabaseManager } from '../src/modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { UserDatabaseManager } from '../src/modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';

export async function setup(): Promise<void> {
  try {
    const container = Application.createContainer();

    const databaseManagers = [UserDatabaseManager, AuthorDatabaseManager, BookDatabaseManager];

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
