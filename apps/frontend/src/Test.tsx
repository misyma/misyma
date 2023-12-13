import { useStoreDispatch, useStoreSelector } from './stores/storeHooks';
import { userStateActions } from './stores/userStore/userStateSlice';

export const Test = () => {
  const dispatch = useStoreDispatch();

  const currentUser = useStoreSelector((state) => state.user.currentUser);

  return (
    <span onClick={() => dispatch(userStateActions.setCurrentUser({ user: { id: 1, name: 'test' } }))}>
      Current user id: {currentUser?.id}
    </span>
  );
};
