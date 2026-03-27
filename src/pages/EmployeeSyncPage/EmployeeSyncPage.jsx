import { useState, useEffect } from 'react';
import { API_HOST } from '../../config/apiConfig';
import Button from '../../components/common/Button/Button';
import styles from './EmployeeSyncPage.module.css';

const API_BASE_URL = `${API_HOST}/api/employees`;

const EmployeeSyncPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showOperators, setShowOperators] = useState(true);
  const [showSupervisors, setShowSupervisors] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Mostrar 10 registros por página

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, showOperators, showSupervisors]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      setMessage('Error al cargar empleados');
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (!showOperators && !showSupervisors) {
      filtered = [];
    } else if (!showOperators) {
      filtered = employees.filter(emp => emp.employee_type === 'supervisor');
    } else if (!showSupervisors) {
      filtered = employees.filter(emp => emp.employee_type === 'operator');
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Resetear a la primera página al filtrar
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const syncAllEmployees = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/sync-all`, {
        method: 'POST'
      });
      
      const data = await response.json();
      setMessage(data.message);
      
      if (data.success) {
        fetchEmployees();
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const syncOperators = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/sync-operators`, {
        method: 'POST'
      });
      
      const data = await response.json();
      setMessage(data.message);
      
      if (data.success) {
        fetchEmployees();
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const syncSupervisors = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/sync-supervisors`, {
        method: 'POST'
      });
      
      const data = await response.json();
      setMessage(data.message);
      
      if (data.success) {
        fetchEmployees();
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`${styles.pageButton} ${currentPage === number ? styles.activePage : ''}`}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h2>Actualizar Operadores y Supervisores</h2>
      
      <div className={styles.syncButtons}>
        <Button variant="primary" onClick={syncAllEmployees} disabled={loading}>
          {loading ? 'Sincronizando...' : 'Sincronizar Todo'}
        </Button>
        <Button variant="secondary" onClick={syncOperators} disabled={loading}>
          {loading ? 'Sincronizando...' : 'Sincronizar Operadores'}
        </Button>
        <Button variant="secondary" onClick={syncSupervisors} disabled={loading}>
          {loading ? 'Sincronizando...' : 'Sincronizar Supervisores'}
        </Button>
      </div>
      
      <div className={styles.filters}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showOperators}
            onChange={(e) => setShowOperators(e.target.checked)}
          />
          Mostrar Operadores
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showSupervisors}
            onChange={(e) => setShowSupervisors(e.target.checked)}
          />
          Mostrar Supervisores
        </label>
      </div>
      
      {message && <p className={styles.message}>{message}</p>}
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Fecha Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.empleado_identificacion}</td>
                  <td>{employee.nombre_operador}</td>
                  <td>{employee.cargo}</td>
                  <td>
                    {employee.empleado_fecha_ingreso 
                      ? new Date(employee.empleado_fecha_ingreso).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                      : '-'
                    }
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noData}>No hay empleados que mostrar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
      
      <div className={styles.info}>
        Mostrando {currentItems.length} de {filteredEmployees.length} empleados
      </div>
    </div>
  );
};

export default EmployeeSyncPage;