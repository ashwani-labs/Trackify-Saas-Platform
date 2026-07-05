import { createContext } from 'react';

export const MasterSearchContext = createContext({
  query: '',
  setQuery: () => {},
});
