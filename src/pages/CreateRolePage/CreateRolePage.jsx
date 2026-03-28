import { useState } from 'react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import styles from './CreateRolePage.module.css';
import { API_HOST } from '../../config/apiConfig';

const API_BASE_URL = `${API_HOST}/api/users`; // Asegúrate que sea correcto

const CreateRolePage = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth(); // ✅ Obtener el token

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/roles`, { // ✅ Asegúrate que sea /roles
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Enviar token en header
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Rol creado exitosamente');
        setName(''); // Limpiar formulario
        setError(''); // Limpiar error
      } else {
        setError(data.message || 'Error al crear el rol');
        setSuccess(''); // Limpiar éxito
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setSuccess(''); // Limpiar éxito
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Crear Nuevo Rol</h2>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        
        <Input
          label="Nombre del Rol"
          type="text"
          placeholder="Ej: Supervisor, Operario, Admin..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <Button variant="primary" type="submit">
          Crear Rol
        </Button>
      </form>
    </div>
  );
};

export default CreateRolePage;