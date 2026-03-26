import { useState, useEffect } from 'react';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './AuditLogPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/audit';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    tableName: ''
  });

  // Opciones para el select de tabla
  const tableOptions = [
    { value: '', label: 'Todas las tablas...' },
    { value: 'users', label: 'Usuarios' },
    { value: 'tasks', label: 'Tareas' },
    { value: 'areas', label: 'Áreas' },
    { value: 'machine_types', label: 'Tipos de Máquina' },
    { value: 'machines', label: 'Máquinas' }
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}${queryParams ? '?' + queryParams : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
      } else {
        setError(data.message || 'Error al cargar registros de auditoría');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      tableName: filters.tableName
    };

    // Remover parámetros vacíos
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    fetchLogs(params);
  };

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      tableName: ''
    });
    fetchLogs(); // Volver a cargar todos los logs
  };

  return (
    <div className={styles.container}>
      <h2>Registros de Auditoría</h2>
      
      {error && <p className={styles.error}>{error}</p>}
      
      {/* Filtros */}
      <div className={styles.filters}>
        <Input
          label="Fecha Desde"
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
        />
        <Input
          label="Fecha Hasta"
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
        />
        <Select
          label="Tabla"
          value={filters.tableName}
          onChange={(e) => setFilters({...filters, tableName: e.target.value})}
          options={tableOptions}
        />
        <div className={styles.buttonGroup}>
          <Button variant="primary" onClick={handleSearch}>Buscar</Button>
          <Button variant="secondary" onClick={handleReset}>Limpiar</Button>
        </div>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tabla</th>
              <th>Operación</th>
              <th>ID Registro</th>
              <th>Usuario</th>
              <th>Fecha/Hora</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.table_name}</td>
                <td>
                  <span className={`${styles.operationBadge} ${styles[log.operation.toLowerCase()]}`}>
                    {log.operation}
                  </span>
                </td>
                <td>{log.record_id}</td>
                <td>{log.changed_by || 'Sistema'}</td>
                <td>{new Date(log.changed_at).toLocaleString()}</td>
                <td>
                  <details className={styles.details}>
                    <summary>Ver detalles</summary>
                    <div className={styles.detailContent}>
                      {log.old_values && (
                        <div>
                          <strong>Antes:</strong>
                          <pre>{JSON.stringify(log.old_values, null, 2)}</pre>
                        </div>
                      )}
                      {log.new_values && (
                        <div>
                          <strong>Después:</strong>
                          <pre>{JSON.stringify(log.new_values, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditLogPage;