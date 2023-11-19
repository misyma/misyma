import { BookDatabaseManager } from '../../../modules/bookModule/infrastructure/databases/bookDatabase/bookDatabaseManager.js';
import { UserDatabaseManager } from '../../../modules/userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';

try {
  const databaseManagers = [UserDatabaseManager, BookDatabaseManager];

  for (const databaseManager of databaseManagers) {
    await databaseManager.teardownDatabase();
  }

  console.log('Database: migrations rollback succeed.');
} catch (error) {
  console.log('Database: migrations rollback error.');

  console.log(error);

  process.exit(1);
}
