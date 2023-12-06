export const symbols = {
  configProvider: Symbol('configProvider'),
  loggerService: Symbol('loggerService'),
  httpService: Symbol('httpService'),
  uuidService: Symbol('uuidService'),
  sqliteDatabaseClient: Symbol('sqliteDatabaseClient'),
};

export const coreSymbols = {
  configProvider: symbols.configProvider,
  loggerService: symbols.loggerService,
  httpService: symbols.httpService,
  uuidService: symbols.uuidService,
  sqliteDatabaseClient: symbols.sqliteDatabaseClient,
};
