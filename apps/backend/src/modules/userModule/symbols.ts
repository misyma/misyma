export const symbols = {
  userModuleConfigProvider: Symbol('userModuleConfigProvider'),
  userMapper: Symbol('userMapper'),
  userRepository: Symbol('userRepository'),
  hashService: Symbol('hashService'),
  registerUserCommandHandler: Symbol('registerUserCommandHandler'),
  loginUserCommandHandler: Symbol('loginUserCommandHandler'),
  deleteUserCommandHandler: Symbol('deleteUserCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
  userHttpController: Symbol('userHttpController'),
  emailService: Symbol('emailService'),
};

export const userSymbols = {
  userHttpController: symbols.userHttpController,
};
