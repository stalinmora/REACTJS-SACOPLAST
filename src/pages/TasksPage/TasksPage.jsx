import { useState, useEffect } from 'react';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './TasksPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/tasks';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    area_id: '',
    description: '',
    specification: '',
    target_per_minute: '',
    target_per_hour: '',
    target_per_shift: '',
    status: 'active',
    real_hours_worked: '11.00'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, areasRes] = await Promise.all([
        fetch(API_BASE_URL),
        fetch('http://localhost:5000/api/tasks/areas')
      ]);

      const tasksData = await tasksRes.json();
      const areasData = await areasRes.json();

      if (tasksData.success && areasData.success) {
        setTasks(tasksData.tasks);
        setAreas(areasData.areas);
      } else {
        setError(tasksData.message || areasData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.area_id) {
      setError('La descripción y el área son obligatorias');
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            target_per_minute: formData.target_per_minute || null,
            target_per_hour: formData.target_per_hour || null,
            target_per_shift: formData.target_per_shift || null,
          }),
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            target_per_minute: formData.target_per_minute || null,
            target_per_hour: formData.target_per_hour || null,
            target_per_shift: formData.target_per_shift || null,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refrescar listas
        resetForm();
        setError('');
      } else {
        setError(data.message || (editingId ? 'Error al actualizar tarea' : 'Error al crear tarea'));
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const resetForm = () => {
    setFormData({
      area_id: '',
      description: '',
      specification: '',
      target_per_minute: '',
      target_per_hour: '',
      target_per_shift: '',
      status: 'active',
      real_hours_worked: '11.00'
    });
    setEditingId(null);
  };

  const handleEdit = (task) => {
    setFormData({
      area_id: task.area_id || '',
      description: task.description,
      specification: task.specification || '',
      target_per_minute: task.target_per_minute || '',
      target_per_hour: task.target_per_hour || '',
      target_per_shift: task.target_per_shift || '',
      status: task.status,
      real_hours_worked: task.real_hours_worked || '12.00'
    });
    setEditingId(task.id);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refrescar lista
      } else {
        setError(data.message || 'Error al cambiar estado');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Tareas</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <Select
          label="Área"
          value={formData.area_id}
          onChange={(e) => setFormData({...formData, area_id: e.target.value})}
          options={[
            { value: '', label: 'Seleccionar área...' },
            ...areas.map(area => ({ value: area.id, label: area.name }))
          ]}
          required
        />
        <Input
          label="Descripción de la Tarea"
          type="text"
          placeholder="Ej: Operar inyectora, Control de calidad..."
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />
        <Input
          label="Especificación"
          type="textarea"
          placeholder="Detalles de la tarea..."
          value={formData.specification}
          onChange={(e) => setFormData({...formData, specification: e.target.value})}
        />
        <div className={styles.row}>
          <Input
            label="Meta por Minuto"
            type="number"
            step="0.01"
            placeholder="Ej: 5.00"
            value={formData.target_per_minute}
            onChange={(e) => setFormData({...formData, target_per_minute: e.target.value})}
          />
          <Input
            label="Meta por Hora"
            type="number"
            step="0.01"
            placeholder="Ej: 300.00"
            value={formData.target_per_hour}
            onChange={(e) => setFormData({...formData, target_per_hour: e.target.value})}
          />
        </div>
        <Input
          label="Meta por Turno"
          type="number"
          step="0.01"
          placeholder="Ej: 2400.00"
          value={formData.target_per_shift}
          onChange={(e) => setFormData({...formData, target_per_shift: e.target.value})}
        />
        <div className={styles.row}>
          <Select
            label="Estado"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { value: 'active', label: 'Activa' },
              { value: 'inactive', label: 'Inactiva' }
            ]}
            required
          />
          <Input
            label="Horas Reales Trabajadas"
            type="number"
            step="0.01"
            placeholder="Ej: 12.00"
            value={formData.real_hours_worked}
            onChange={(e) => setFormData({...formData, real_hours_worked: e.target.value})}
          />
        </div>
        <Button variant="primary" type="submit">
          {editingId ? 'Actualizar' : 'Crear'} Tarea
        </Button>
        {editingId && (
          <Button variant="secondary" type="button" onClick={resetForm}>
            Cancelar
          </Button>
        )}
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Área</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Horas Reales</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{areas.find(a => a.id === task.area_id)?.name || '-'}</td>
              <td>{task.description}</td>
              <td>
                <span className={task.status === 'active' ? styles.active : styles.inactive}>
                  {task.status}
                </span>
              </td>
              <td>{task.real_hours_worked}</td>
              <td>
                <button onClick={() => handleEdit(task)}>Editar</button>
                <button
                  onClick={() => handleToggleStatus(task.id, task.status)}
                  className={task.status === 'active' ? styles.deactivate : styles.activate}
                >
                  {task.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TasksPage;