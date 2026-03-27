import { useState, useEffect } from 'react';
import { API_HOST } from '../../config/apiConfig';
import styles from './AssignRolesPage.module.css';

const API_BASE_URL = `${API_HOST}/api/users`;

const AssignRolesPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Obtener usuarios y roles
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/with-roles`),
        fetch(`${API_BASE_URL}/roles`)
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      if (usersData.success && rolesData.success) {
        setUsers(usersData.users);
        setRoles(rolesData.roles);
      } else {
        setError(usersData.message || rolesData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRoleId }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role_id: newRoleId } : u));
      } else {
        setError(data.message || 'Error al actualizar rol');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Asignar Roles a Usuarios</h2>
      {error && <p className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol Actual</th>
            <th>Asignar Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                {roles.find(r => r.id === user.role_id)?.name || 'Sin rol'}
              </td>
              <td>
                <select
                  value={user.role_id || ''}
                  onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignRolesPage;