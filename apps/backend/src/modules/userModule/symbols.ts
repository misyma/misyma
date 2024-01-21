export const symbols = {
  userModuleConfigProvider: Symbol('userModuleConfigProvider'),
  userMapper: Symbol('userMapper'),
  userRepository: Symbol('userRepository'),
  blacklistTokenMapper: Symbol('blacklistTokenMapper'),
  blacklistTokenRepository: Symbol('blacklistTokenRepository'),

  registerUserCommandHandler: Symbol('registerUserCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
  resetUserPasswordCommandHandler: Symbol('resetUserPasswordCommandHandler'),
  changeUserPasswordCommandHandler: Symbol('changeUserPasswordCommandHandler'),
  loginUserCommandHandler: Symbol('loginUserCommandHandler'),
  refreshUserTokensCommandHandler: Symbol('refreshUserTokensCommandHandler'),
  logoutUserCommandHandler: Symbol('logoutUserCommandHandler'),
  deleteUserCommandHandler: Symbol('deleteUserCommandHandler'),
  sendVerificationEmailCommandHandler: Symbol('sendVerificationEmailCommandHandler'),
  verifyUserEmailCommandHandler: Symbol('verifyUserEmailCommandHandler'),

  userHttpController: Symbol('userHttpController'),

  emailEventRepository: Symbol('emailEventRepository'),
  emailEventMapper: Symbol('emailEventMapper'),

  emailMessageBus: Symbol('emailMessageBus'),

  findEmailEventsQueryHandler: Symbol('findEmailEventsQueryHandler'),
  changeEmailEventStatusCommandHandler: Symbol('changeEmailEventStatusCommandHandler'),

  emailQueueController: Symbol('emailQueueController'),

  hashService: Symbol('hashService'),
  emailService: Symbol('emailService'),
  passwordValidationService: Symbol('passwordValidationService'),
};

export const userSymbols = {
  userHttpController: symbols.userHttpController,
  userRepository: symbols.userRepository,
  emailQueueController: symbols.emailQueueController,
};
