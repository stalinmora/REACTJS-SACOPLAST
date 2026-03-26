import { useState, useEffect } from 'react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './AreasPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/tasks/areas';

const AreasPage = () => {
  const [areas, setAreas] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();

      if (data.success) {
        setAreas(data.areas);
      } else {
        setError(data.message || 'Error al cargar áreas');
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
        fetchAreas(); // Refrescar lista
        setName('');
        setDescription('');
        setEditingId(null);
        setError('');
      } else {
        setError(data.message || (editingId ? 'Error al actualizar área' : 'Error al crear área'));
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleEdit = (area) => {
    setName(area.name);
    setDescription(area.description);
    setEditingId(area.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta área?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          fetchAreas(); // Refrescar lista
        } else {
          setError(data.message || 'Error al eliminar área');
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Áreas</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nombre del Área"
          type="text"
          placeholder="Ej: Producción, Calidad..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Descripción"
          type="text"
          placeholder="Breve descripción del área..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button variant="primary" type="submit">
          {editingId ? 'Actualizar' : 'Crear'} Área
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
          {areas.map(area => (
            <tr key={area.id}>
              <td>{area.id}</td>
              <td>{area.name}</td>
              <td>{area.description || '-'}</td>
              <td>
                <button onClick={() => handleEdit(area)}>Editar</button>
                <button onClick={() => handleDelete(area.id)} className={styles.deleteButton}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AreasPage;