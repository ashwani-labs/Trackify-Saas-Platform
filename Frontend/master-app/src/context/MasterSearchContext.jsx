import { useMemo, useState } from 'react';
import { MasterSearchContext } from './MasterSearchContextCore';

export const MasterSearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');

  const value = useMemo(() => ({ query, setQuery }), [query]);

  return <MasterSearchContext.Provider value={value}>{children}</MasterSearchContext.Provider>;
};
