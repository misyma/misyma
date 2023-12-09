sudo rm -rf data

mkdir data

chmod 777 data

sqlite3 data/test.db ".databases" >> /dev/null

npm run test:migrations:run
