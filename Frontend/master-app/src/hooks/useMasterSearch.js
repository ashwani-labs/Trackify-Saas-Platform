import { useContext } from 'react';
import { MasterSearchContext } from '../context/MasterSearchContextCore';

export const useMasterSearch = () => useContext(MasterSearchContext);
