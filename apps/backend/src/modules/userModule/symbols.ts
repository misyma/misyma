export const symbols = {
  userModuleConfigProvider: Symbol('userModuleConfigProvider'),
  userMapper: Symbol('userMapper'),
  userTokensMapper: Symbol('userTokensMapper'),
  userRepository: Symbol('userRepository'),

  registerUserCommandHandler: Symbol('registerUserCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
  resetUserPasswordCommandHandler: Symbol('resetUserPasswordCommandHandler'),
  changeUserPasswordCommandHandler: Symbol('changeUserPasswordCommandHandler'),
  loginUserCommandHandler: Symbol('loginUserCommandHandler'),
  deleteUserCommandHandler: Symbol('deleteUserCommandHandler'),

  userHttpController: Symbol('userHttpController'),

  hashService: Symbol('hashService'),
  emailService: Symbol('emailService'),
};

export const userSymbols = {
  userHttpController: symbols.userHttpController,
};
