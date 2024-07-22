export const symbols = {
  config: Symbol('config'),
  loggerService: Symbol('loggerService'),
  httpService: Symbol('httpService'),
  uuidService: Symbol('uuidService'),
  databaseClient: Symbol('databaseClient'),
  applicationHttpController: Symbol('applicationHttpController'),
  sendGridService: Symbol('sendGridService'),
  s3Client: Symbol('s3Client'),
  s3Service: Symbol('s3Service'),
};

export const coreSymbols = {
  config: symbols.config,
  loggerService: symbols.loggerService,
  httpService: symbols.httpService,
  uuidService: symbols.uuidService,
  databaseClient: symbols.databaseClient,
  sendGridService: symbols.sendGridService,
  s3Client: symbols.s3Client,
  s3Service: symbols.s3Service,
};
