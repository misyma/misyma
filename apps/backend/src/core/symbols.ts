export const symbols = {
  configProvider: Symbol('configProvider'),
  loggerService: Symbol('loggerService'),
  httpService: Symbol('httpService'),
  uuidService: Symbol('uuidService'),
  postgresDatabaseClient: Symbol('postgresDatabaseClient'),
};

export const coreSymbols = {
  configProvider: symbols.configProvider,
  loggerService: symbols.loggerService,
  httpService: symbols.httpService,
  uuidService: symbols.uuidService,
  postgresDatabaseClient: symbols.postgresDatabaseClient,
};
