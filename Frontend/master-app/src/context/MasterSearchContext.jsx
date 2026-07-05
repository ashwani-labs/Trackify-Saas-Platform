import { createContext, useContext, useMemo, useState } from 'react';

const MasterSearchContext = createContext({
  query: '',
  setQuery: () => {},
});

export const MasterSearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');

  const value = useMemo(() => ({ query, setQuery }), [query]);

  return <MasterSearchContext.Provider value={value}>{children}</MasterSearchContext.Provider>;
};

export const useMasterSearch = () => useContext(MasterSearchContext);
