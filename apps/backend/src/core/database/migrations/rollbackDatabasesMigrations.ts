import { UserDatabaseManager } from '../../../userModule/infrastructure/databases/userDatabase/userDatabaseManager.js';

try {
  const databaseManagers = [UserDatabaseManager];

  for (const databaseManager of databaseManagers) {
    await databaseManager.teardownDatabase();
  }

  console.log('Database: migrations rollback succeed.');
} catch (error) {
  console.log('Database: migrations rollback error.');

  console.log(error);

  process.exit(1);
}
