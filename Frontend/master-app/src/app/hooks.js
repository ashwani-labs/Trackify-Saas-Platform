import { useDispatch, useSelector } from 'react-redux';

// Typed wrappers — use these everywhere instead of raw useDispatch/useSelector
export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);
