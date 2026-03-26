import { useState, useEffect } from 'react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './MachineTypesPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/machines/types';

const MachineTypesPage = () => {
  const [machineTypes, setMachineTypes] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMachineTypes();
  }, []);

  const fetchMachineTypes = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();

      if (data.success) {
        setMachineTypes(data.types);
      } else {
        setError(data.message || 'Error al cargar tipos de máquinas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), description: description.trim() }),
        });
      }

      const data = await response.json();

      if (data.success) {
        fetchMachineTypes(); // Refrescar lista
        setName('');
        setDescription('');
        setEditingId(null);
        setError('');
      } else {
        setError(data.message || (editingId ? 'Error al actualizar tipo' : 'Error al crear tipo'));
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleEdit = (type) => {
    setName(type.name);
    setDescription(type.description);
    setEditingId(type.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este tipo de máquina?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          fetchMachineTypes(); // Refrescar lista
        } else {
          setError(data.message || 'Error al eliminar tipo');
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Tipos de Máquinas</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nombre del Tipo"
          type="text"
          placeholder="Ej: Inyectora, Extrusora..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Descripción"
          type="text"
          placeholder="Breve descripción del tipo..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button variant="primary" type="submit">
          {editingId ? 'Actualizar' : 'Crear'} Tipo
        </Button>
        {editingId && (
          <Button variant="secondary" type="button" onClick={() => {
            setName('');
            setDescription('');
            setEditingId(null);
          }}>
            Cancelar
          </Button>
        )}
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {machineTypes.map(type => (
            <tr key={type.id}>
              <td>{type.id}</td>
              <td>{type.name}</td>
              <td>{type.description || '-'}</td>
              <td>
                <button onClick={() => handleEdit(type)}>Editar</button>
                <button onClick={() => handleDelete(type.id)} className={styles.deleteButton}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MachineTypesPage;