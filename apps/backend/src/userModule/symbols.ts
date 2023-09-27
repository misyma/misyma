export const symbols = {
  userModuleConfig: Symbol('userModuleConfig'),
  userMapper: Symbol('userMapper'),
  userRepository: Symbol('userRepository'),
  hashService: Symbol('hashService'),
  registerUserCommandHandler: Symbol('registerUserCommandHandler'),
  loginUserCommandHandler: Symbol('loginUserCommandHandler'),
  deleteUserCommandHandler: Symbol('deleteUserCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
  userHttpController: Symbol('userHttpController'),
};

export const userSymbols = {
  userHttpController: symbols.userHttpController,
};
