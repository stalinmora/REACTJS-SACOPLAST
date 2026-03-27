import { useState, useEffect } from 'react';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import { API_HOST } from '../../config/apiConfig';
import styles from './EmployeeGroupAssignmentPage.module.css';

const API_BASE_URL = `${API_HOST}/api/employee-groups`;

const EmployeeGroupAssignmentPage = () => {
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [workGroups, setWorkGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    group_id: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availableEmpRes, assignedEmpRes, groupsRes, assignmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`), // Solo empleados disponibles
        fetch(`${API_BASE_URL}/employees-assigned`), // Solo empleados asignados
        fetch(`${API_BASE_URL}/groups`),
        fetch(`${API_BASE_URL}`)
      ]);

      const availableEmpData = await availableEmpRes.json();
      const assignedEmpData = await assignedEmpRes.json();
      const groupsData = await groupsRes.json();
      const assignmentsData = await assignmentsRes.json();

      if (availableEmpData.success && assignedEmpData.success && groupsData.success && assignmentsData.success) {
        setAvailableEmployees(availableEmpData.employees);
        setAssignedEmployees(assignedEmpData.employees);
        setWorkGroups(groupsData.groups);
        setAssignments(assignmentsData.assignments);
      } else {
        setError(availableEmpData.message || assignedEmpData.message || groupsData.message || assignmentsData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.group_id) {
      setError('Empleado y Grupo son requeridos');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refrescar datos
        setFormData({ employee_id: '', group_id: '' });
        setError('');
      } else {
        setError(data.message || 'Error al asignar empleado al grupo');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de remover esta asignación?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${assignmentId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          fetchData(); // Refrescar datos
        } else {
          setError(data.message || 'Error al remover asignación');
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
      }
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Asignar Empleados a Grupos</h2>
      
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <Select
            label="Empleado Disponible"
            value={formData.employee_id}
            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
            options={[
              { value: '', label: 'Seleccionar empleado...' },
              ...availableEmployees.map(emp => ({ 
                value: emp.id, 
                label: `${emp.nombre_operador} (${emp.empleado_identificacion})` 
              }))
            ]}
            required
          />
          <Select
            label="Grupo"
            value={formData.group_id}
            onChange={(e) => setFormData({...formData, group_id: e.target.value})}
            options={[
              { value: '', label: 'Seleccionar grupo...' },
              ...workGroups.map(group => ({ 
                value: group.id, 
                label: group.name 
              }))
            ]}
            required
          />
        </div>
        <Button variant="primary" type="submit">
          Asignar a Grupo
        </Button>
      </form>

      <h3>Empleados Asignados</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Identificación</th>
            <th>Grupo</th>
            <th>Cargo</th>
            <th>Fecha de Asignación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(assignment => {
            const employee = assignedEmployees.find(emp => emp.id === assignment.employee_id);
            
            return (
              <tr key={assignment.id}>
                <td>{employee?.nombre_operador || '-'}</td>
                <td>{employee?.empleado_identificacion || '-'}</td>
                <td>{employee?.group_name || '-'}</td>
                <td>{employee?.cargo || '-'}</td>
                <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => handleRemoveAssignment(assignment.id)}
                    className={styles.removeButton}
                  >
                    Liberar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeGroupAssignmentPage;