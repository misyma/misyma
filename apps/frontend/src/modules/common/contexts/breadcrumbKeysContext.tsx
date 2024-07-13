import { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react';

const defaultValues: Record<string, string> = {};

export interface SetValueAction {
  value: string;
  key: string;
}

export interface ClearKeysAction {
  clear: true;
}

export interface RemoveKeyAction {
  key: string;
}

export type BreadcrumbKeyAction = SetValueAction | ClearKeysAction | RemoveKeyAction;

const BreadcrumbKeysContext = createContext<Record<string, string>>(defaultValues);

const BreadcrumbKeysDispatchContext = createContext(null as unknown as Dispatch<BreadcrumbKeyAction>);

export function BreadcrumbKeysProvider({ children }: { children: ReactNode }): JSX.Element {
  const [breadcrumbKeys, dispatch] = useReducer(breadcrumbKeysRequestReducer, defaultValues);

  return (
    <BreadcrumbKeysContext.Provider value={breadcrumbKeys}>
      <BreadcrumbKeysDispatchContext.Provider value={dispatch}>{children}</BreadcrumbKeysDispatchContext.Provider>
    </BreadcrumbKeysContext.Provider>
  );
}

export function useBreadcrumbKeysContext(): Record<string, string> {
  return useContext(BreadcrumbKeysContext);
}

export function useBreadcrumbKeysDispatch() {
  return useContext(BreadcrumbKeysDispatchContext);
}

function breadcrumbKeysRequestReducer(state: Record<string, string>, action: BreadcrumbKeyAction) {
  if ('clear' in action) {
    return {};
  }

  if ('key' in action && !('value' in action)) {
    return Object.entries(state).reduce<Record<string, string>>((agg, [key, val]) => {
      if (key === action.key) {
        return agg;
      }

      agg[key] = val;

      return agg;
    }, {});
  }

  return {
    ...state,
    [action.key]: action.value,
  };
}
