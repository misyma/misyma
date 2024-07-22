export const symbols = {
  blacklistTokenMapper: Symbol('blacklistTokenMapper'),
  blacklistTokenRepository: Symbol('blacklistTokenRepository'),

  userMapper: Symbol('userMapper'),
  userRepository: Symbol('userRepository'),
  registerUserCommandHandler: Symbol('registerUserCommandHandler'),
  findUserQueryHandler: Symbol('findUserQueryHandler'),
  findUsersQueryHandler: Symbol('findUsersQueryHandler'),
  loginUserCommandHandler: Symbol('loginUserCommandHandler'),
  refreshUserTokensCommandHandler: Symbol('refreshUserTokensCommandHandler'),
  logoutUserCommandHandler: Symbol('logoutUserCommandHandler'),
  deleteUserCommandHandler: Symbol('deleteUserCommandHandler'),
  updateUserCommandHandler: Symbol('updateUserCommandHandler'),
  sendResetPasswordEmailCommandHandler: Symbol('sendResetPasswordEmailCommandHandler'),
  sendVerificationEmailCommandHandler: Symbol('sendVerificationEmailCommandHandler'),
  changeUserPasswordCommandHandler: Symbol('changeUserPasswordCommandHandler'),
  verifyUserEmailCommandHandler: Symbol('verifyUserEmailCommandHandler'),
  userHttpController: Symbol('userHttpController'),
  userAdminHttpController: Symbol('userAdminHttpController'),

  emailEventRepository: Symbol('emailEventRepository'),
  emailEventMapper: Symbol('emailEventMapper'),
  emailMessageBus: Symbol('emailMessageBus'),
  emailQueueController: Symbol('emailQueueController'),

  hashService: Symbol('hashService'),
  passwordValidationService: Symbol('passwordValidationService'),
};

export const userSymbols = {
  userHttpController: symbols.userHttpController,
  userAdminHttpController: symbols.userAdminHttpController,
  userRepository: symbols.userRepository,
  emailQueueController: symbols.emailQueueController,
  hashService: symbols.hashService,
};
