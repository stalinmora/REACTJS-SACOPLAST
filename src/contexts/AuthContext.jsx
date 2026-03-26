import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setPermissions(payload.permissions || []);
        setRole(payload.role || null);
        setIsAuthenticated(true);
        setToken(storedToken);
      } catch (e) {
        console.error('Error decodificando token', e);
      }
    }
  }, []);

  const login = (newToken, userPermissions, userRole) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setPermissions(userPermissions || []);
    setRole(userRole || null);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setPermissions([]);
    setRole(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token, hasPermission, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };