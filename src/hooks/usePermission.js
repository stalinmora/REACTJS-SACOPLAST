import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const usePermission = (permission) => {
  const { hasPermission } = useContext(AuthContext);
  return hasPermission(permission);
};