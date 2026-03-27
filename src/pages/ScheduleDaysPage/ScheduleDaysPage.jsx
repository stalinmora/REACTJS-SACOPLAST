import { useState, useEffect } from 'react';
import { API_HOST } from '../../config/apiConfig';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './ScheduleDaysPage.module.css';

const API_BASE_URL = `${API_HOST}/api/schedule`;

const ScheduleDaysPage = () => {
  const [scheduleDays, setScheduleDays] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    day_date: '',
    shift_id: '',
    assigned_to: '',
    notes: '',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [daysRes, shiftsRes, usersRes] = await Promise.all([
        fetch(API_BASE_URL),
        fetch(`${API_HOST}/api/schedule/shifts`),
        fetch(`${API_HOST}/api/schedule/users`)
      ]);

      const daysData = await daysRes.json();
      const shiftsData = await shiftsRes.json();
      const usersData = await usersRes.json();

      if (daysData.success && shiftsData.success && usersData.success) {
        setScheduleDays(daysData.days);
        setShifts(shiftsData.shifts);
        setUsers(usersData.users);
      } else {
        setError(daysData.message || shiftsData.message || usersData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.day_date || !formData.shift_id) {
      setError('La fecha y el turno son obligatorios');
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refrescar lista
        resetForm();
        setError('');
      } else {
        setError(data.message || (editingId ? 'Error al actualizar horario' : 'Error al crear horario'));
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const resetForm = () => {
    setFormData({
      day_date: '',
      shift_id: '',
      assigned_to: '',
      notes: '',
      status: 'active'
    });
    setEditingId(null);
  };

  const handleEdit = (day) => {
    setFormData({
      day_date: day.day_date.split('T')[0], // Formato YYYY-MM-DD
      shift_id: day.shift_id || '',
      assigned_to: day.assigned_to || '',
      notes: day.notes || '',
      status: day.status
    });
    setEditingId(day.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          fetchData(); // Refrescar lista
        } else {
          setError(data.message || 'Error al eliminar horario');
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
      }
    }
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
      <h2>Horarios de Trabajo</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <Input
            label="Fecha"
            type="date"
            value={formData.day_date}
            onChange={(e) => setFormData({...formData, day_date: e.target.value})}
            required
          />
          <Select
            label="Turno"
            value={formData.shift_id}
            onChange={(e) => setFormData({...formData, shift_id: e.target.value})}
            options={[
              { value: '', label: 'Seleccionar turno...' },
              ...shifts.map(shift => ({ value: shift.id, label: shift.name }))
            ]}
            required
          />
        </div>
        <div className={styles.row}>
          <Select
            label="Asignado a"
            value={formData.assigned_to}
            onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
            options={[
              { value: '', label: 'Sin asignar...' },
              ...users.map(user => ({ value: user.id, label: user.name }))
            ]}
          />
          <Select
            label="Estado"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' }
            ]}
            required
          />
        </div>
        <Input
          label="Notas"
          type="textarea"
          placeholder="Notas adicionales sobre este horario..."
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
        <Button variant="primary" type="submit">
          {editingId ? 'Actualizar' : 'Crear'} Horario
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
            <th>Fecha</th>
            <th>Turno</th>
            <th>Asignado a</th>
            <th>Estado</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {scheduleDays.map(day => (
            <tr key={day.id}>
              <td>{new Date(day.day_date).toLocaleDateString()}</td>
              <td>{shifts.find(s => s.id === day.shift_id)?.name || '-'}</td>
              <td>{users.find(u => u.id === day.assigned_to)?.name || '-'}</td>
              <td>
                <span className={day.status === 'active' ? styles.active : styles.inactive}>
                  {day.status}
                </span>
              </td>
              <td>{day.notes || '-'}</td>
              <td>
                <button onClick={() => handleEdit(day)}>Editar</button>
                <button
                  onClick={() => handleToggleStatus(day.id, day.status)}
                  className={day.status === 'active' ? styles.deactivate : styles.activate}
                >
                  {day.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDelete(day.id)} className={styles.deleteButton}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleDaysPage;