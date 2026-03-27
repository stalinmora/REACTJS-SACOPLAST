import { useState, useEffect } from 'react';
import { API_HOST } from '../../config/apiConfig';
import ChangePasswordModal from '../../components/features/auth/ChangePasswordModal/ChangePasswordModal';
import styles from './ManageUsersPage.module.css';

const API_BASE_URL = `${API_HOST}/api/users`;

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setFormData({ name: user.name, email: user.email });
  };

  const handleSave = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, name: formData.name, email: formData.email } : u));
        setEditingUser(null);
      } else {
        setError(data.message || 'Error al actualizar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`${API_BASE_URL}/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      } else {
        setError(data.message || 'Error al cambiar estado');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handlePasswordChangeClick = (userId) => {
    setSelectedUserId(userId);
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (userId, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Contraseña actualizada exitosamente');
      } else {
        setError(data.message || 'Error al cambiar contraseña');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Gestionar Usuarios</h2>
      {error && <p className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                {editingUser === user.id ? (
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUser === user.id ? (
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                <span className={user.status === 'active' ? styles.active : styles.inactive}>
                  {user.status}
                </span>
              </td>
              <td>
                {editingUser === user.id ? (
                  <button onClick={() => handleSave(user.id)}>Guardar</button>
                ) : (
                  <button onClick={() => handleEditClick(user)}>Editar</button>
                )}
                <button
                  onClick={() => handleToggleStatus(user.id, user.status)}
                  className={user.status === 'active' ? styles.deactivate : styles.activate}
                >
                  {user.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handlePasswordChangeClick(user.id)}
                  className={styles.changePassword}
                >
                  Cambiar Contraseña
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedUserId(null);
        }}
        onSave={handleChangePassword}
        userId={selectedUserId}
      />
    </div>
  );
};

export default ManageUsersPage;