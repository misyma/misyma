import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import type { RootState, AppDispatch } from './store';

export const useStoreDispatch: () => AppDispatch = useDispatch;

export const useStoreSelector: TypedUseSelectorHook<RootState> = useSelector;
