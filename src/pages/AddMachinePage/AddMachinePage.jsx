import { useState, useEffect } from 'react';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './AddMachinePage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/machines';

const AddMachinePage = () => {
  const [machines, setMachines] = useState([]);
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [machineTypes, setMachineTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [machinesRes, typesRes] = await Promise.all([
        fetch(API_BASE_URL),
        fetch('http://localhost:5000/api/machines/types')
      ]);

      const machinesData = await machinesRes.json();
      const typesData = await typesRes.json();

      if (machinesData.success && typesData.success) {
        setMachines(machinesData.machines);
        setMachineTypes(typesData.types);
      } else {
        setError(machinesData.message || typesData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !typeId) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type_id: parseInt(typeId) }),
      });

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refrescar lista
        setName('');
        setTypeId('');
        setError('');
      } else {
        setError(data.message || 'Error al crear máquina');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
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
      <h2>Máquinas</h2>
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nombre de la Máquina"
          type="text"
          placeholder="Ej: Inyectora 1, Extrusora B..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Tipo de Máquina"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          options={[
            { value: '', label: 'Seleccionar tipo...' },
            ...machineTypes.map(type => ({ value: type.id, label: type.name }))
          ]}
          required
        />
        <Button variant="primary" type="submit">
          Crear Máquina
        </Button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {machines.map(machine => (
            <tr key={machine.id}>
              <td>{machine.id}</td>
              <td>{machine.name}</td>
              <td>{machine.type_name || '-'}</td>
              <td>
                <span className={machine.status === 'active' ? styles.active : styles.inactive}>
                  {machine.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleToggleStatus(machine.id, machine.status)}
                  className={machine.status === 'active' ? styles.deactivate : styles.activate}
                >
                  {machine.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddMachinePage;