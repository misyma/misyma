export const ApiPaths = {
  users: {
    path: '/users',
    ['$userId']: {
      path: '/users/{{userId}}',
      pathParam: {
        userId: '{{userId}}',
      },
    },
    token: {
      path: '/users/token',
    },
    me: {
      path: '/users/me',
    },
    changePassword: {
      path: '/users/change-password',
    },
  },
};
