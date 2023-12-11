import { BookDatabaseManager } from '../../../modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { UserDatabaseManager } from '../../../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';
import { Application } from '../../application.js';

try {
  const container = Application.createContainer();

  const databaseManagers = [UserDatabaseManager, BookDatabaseManager];

  for (const databaseManager of databaseManagers) {
    await databaseManager.bootstrapDatabase(container);
  }

  console.log('Database: migrations run succeed.');
} catch (error) {
  console.log('Database: migrations run error.');

  console.log(error);

  process.exit(1);
}
