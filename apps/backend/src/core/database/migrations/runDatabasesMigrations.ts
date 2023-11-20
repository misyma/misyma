import { BookDatabaseManager } from '../../../modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { UserDatabaseManager } from '../../../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';

try {
  const databaseManagers = [UserDatabaseManager, BookDatabaseManager];

  for (const databaseManager of databaseManagers) {
    await databaseManager.booststrapDatabase();
  }

  console.log('Database: migrations run succeed.');
} catch (error) {
  console.log('Database: migrations run error.');

  console.log(error);

  process.exit(1);
}
