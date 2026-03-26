import { useState, useEffect } from 'react';
import styles from './AssignPermissionsPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/users'; // ✅ Cambiado de roles a users

const AssignPermissionsPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/all`), // ✅ Este endpoint ahora existe
        fetch(`${API_BASE_URL}/permissions`) // ✅ Este endpoint ahora existe
      ]);

      const rolesData = await rolesRes.json();
      const permissionsData = await permissionsRes.json();

      if (rolesData.success && permissionsData.success) {
        setRoles(rolesData.roles);
        setPermissions(permissionsData.permissions);

        // Cargar permisos actuales por rol
        const permissionsByRole = {};
        for (const role of rolesData.roles) {
          const res = await fetch(`${API_BASE_URL}/${role.id}/permissions`);
          const data = await res.json();
          permissionsByRole[role.id] = data.permissions?.map(p => p.name) || [];
        }
        setRolePermissions(permissionsByRole);
      } else {
        setError(rolesData.message || permissionsData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (roleId, permissionName, checked) => {
    try {
      let response;
      if (checked) {
        response = await fetch(`${API_BASE_URL}/${roleId}/permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissionName }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/${roleId}/permissions`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissionName }),
        });
      }

      const data = await response.json();

      if (data.success) {
        setRolePermissions(prev => ({
          ...prev,
          [roleId]: checked
            ? [...prev[roleId], permissionName]
            : prev[roleId].filter(p => p !== permissionName)
        }));
      } else {
        setError(data.message || 'Error al actualizar permiso');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Asignar Permisos a Roles</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.roleList}>
        {roles.map(role => (
          <div key={role.id} className={styles.roleCard}>
            <h3>{role.name}</h3>
            <div className={styles.permissionsGrid}>
              {permissions.map(permission => (
                <label key={`${role.id}-${permission.name}`} className={styles.permissionCheckbox}>
                  <input
                    type="checkbox"
                    checked={rolePermissions[role.id]?.includes(permission.name) || false}
                    onChange={(e) => handlePermissionToggle(role.id, permission.name, e.target.checked)}
                  />
                  {permission.name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignPermissionsPage;