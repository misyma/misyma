export const symbols = {
  authModuleConfig: Symbol('authModuleConfig'),
  tokenService: Symbol('tokenService'),
  accessControlService: Symbol('accessControlService'),
};

export const authSymbols = {
  tokenService: symbols.tokenService,
  accessControlService: symbols.accessControlService,
};
