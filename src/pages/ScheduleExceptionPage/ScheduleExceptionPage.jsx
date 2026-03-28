import { useState, useEffect } from 'react';
import { API_HOST } from '../../config/apiConfig';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './ScheduleExceptionPage.module.css';

const API_BASE_URL = `${API_HOST}/api/schedule`;

const ScheduleExceptionPage = () => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [filteredExceptions, setFilteredExceptions] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    exception_date: new Date().toISOString().split('T')[0],
    shift_id: '',
    reason: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, shiftsRes, exceptionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/shifts`),
        fetch(`${API_BASE_URL}/exceptions?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`)
      ]);

      const employeesData = await employeesRes.json();
      const shiftsData = await shiftsRes.json();
      const exceptionsData = await exceptionsRes.json();

      if (employeesData.success && shiftsData.success && exceptionsData.success) {
        setEmployees(employeesData.employees);
        setAllEmployees(employeesData.employees);
        setShifts(shiftsData.shifts);
        setExceptions(exceptionsData.exceptions);
        setFilteredExceptions(exceptionsData.exceptions);
      } else {
        setError(employeesData.message || shiftsData.message || exceptionsData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Variables para búsqueda
  const [allEmployees, setAllEmployees] = useState([]);

  // Filtrar empleados por nombre y cargo
  useEffect(() => {
    let filtered = allEmployees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.nombre_operador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empleado_identificacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cargoFilter) {
      filtered = filtered.filter(emp =>
        emp.cargo && emp.cargo.toLowerCase().includes(cargoFilter.toLowerCase())
      );
    }

    setEmployees(filtered);
  }, [searchTerm, cargoFilter, allEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.exception_date || !formData.shift_id) {
      setError('Empleado, Fecha y Turno Nuevo son requeridos');
      return;
    }

    try {
      let response;
      if (editingId) {
        // Actualizar excepción
        response = await fetch(`${API_BASE_URL}/exceptions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_employee_id: parseInt(formData.employee_id),
            exception_date: formData.exception_date,
            shift_id: parseInt(formData.shift_id),
            reason: formData.reason
          })
        });
      } else {
        // Crear nueva excepción
        response = await fetch(`${API_BASE_URL}/exceptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original_employee_id: parseInt(formData.employee_id),
            exception_date: formData.exception_date,
            shift_id: parseInt(formData.shift_id),
            reason: formData.reason
          })
        });
      }

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refrescar datos
        resetForm();
        setSuccess(editingId ? 'Excepción actualizada exitosamente' : 'Excepción creada exitosamente');
        setError('');
      } else {
        setError(data.message || 'Error al guardar excepción');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleEmployeeChange = (employeeId) => {
    setFormData(prev => ({ ...prev, employee_id: employeeId }));
    setShowEmployeeModal(false);
  };

  const handleEdit = (exception) => {
    setFormData({
      employee_id: exception.original_employee_id.toString(),
      exception_date: exception.exception_date.split('T')[0],
      shift_id: exception.shift_id.toString(),
      reason: exception.reason || ''
    });
    setEditingId(exception.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta excepción?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/exceptions/${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          fetchData(); // Refrescar datos
          setSuccess('Excepción eliminada exitosamente');
          setError('');
        } else {
          setError(data.message || 'Error al eliminar excepción');
        }
      } catch (err) {
        setError('Error de conexión con el servidor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      exception_date: new Date().toISOString().split('T')[0],
      shift_id: '',
      reason: ''
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
  };

  const openEmployeeModal = () => {
    setShowEmployeeModal(true);
    setSearchTerm('');
    setCargoFilter('');
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSearchTerm('');
    setCargoFilter('');
    setEmployees(allEmployees);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Gestión de Excepciones de Horarios</h2>
      <p className={styles.description}>
        Cambie temporalmente un empleado específico a un turno distinto al que normalmente pertenece, sin afectar su grupo permanente.
      </p>
      
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div>
            <label className={styles.label}>Empleado</label>
            <div className={styles.selectedEmployee}>
              {allEmployees.find(emp => emp.id == formData.employee_id) 
                ? `${allEmployees.find(emp => emp.id == formData.employee_id).nombre_operador} (${allEmployees.find(emp => emp.id == formData.employee_id).empleado_identificacion}) - ${allEmployees.find(emp => emp.id == formData.employee_id).cargo || 'Sin cargo'}`
                : 'Seleccionar empleado...'}
              <Button variant="secondary" type="button" onClick={openEmployeeModal}>
                Buscar
              </Button>
            </div>
          </div>
          <Input
            label="Fecha de Excepción"
            type="date"
            value={formData.exception_date}
            onChange={(e) => setFormData({...formData, exception_date: e.target.value})}
            required
          />
        </div>
        
        <div className={styles.row}>
          <Select
            label="Turno Nuevo"
            value={formData.shift_id}
            onChange={(e) => setFormData({...formData, shift_id: e.target.value})}
            options={[
              { value: '', label: 'Seleccionar turno nuevo...' },
              ...shifts.map(shift => ({ value: shift.id.toString(), label: `${shift.name} (${shift.start_time} - ${shift.end_time})` }))
            ]}
            required
          />
        </div>
        
        <div className={styles.row}>
          <Input
            label="Razón de la Excepción"
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            placeholder="Breve descripción del motivo..."
          />
        </div>
        
        <div className={styles.buttonGroup}>
          <Button variant="primary" type="submit">
            {editingId ? 'Actualizar Excepción' : 'Crear Excepción'}
          </Button>
          {editingId && (
            <Button variant="secondary" type="button" onClick={handleCancel}>
              Cancelar Edición
            </Button>
          )}
        </div>
      </form>

      <h3>Excepciones Registradas</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Turno Nuevo</th>
              <th>Razón</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredExceptions.length > 0 ? (
              filteredExceptions.map(exception => (
                <tr key={exception.id}>
                  <td>{allEmployees.find(e => e.id === exception.original_employee_id)?.nombre_operador || 'N/A'}</td>
                  <td>{new Date(exception.exception_date).toLocaleDateString()}</td>
                  <td>{shifts.find(s => s.id === exception.shift_id)?.name || 'N/A'}</td>
                  <td>{exception.reason || '-'}</td>
                  <td>
                    <Button variant="secondary" onClick={() => handleEdit(exception)}>
                      Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(exception.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.noData}>No hay excepciones registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para buscar empleado */}
      {showEmployeeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Buscar Empleado</h3>
              <button onClick={closeEmployeeModal} className={styles.closeButton}>×</button>
            </div>
            <div className={styles.modalBody}>
              <Input
                label="Buscar por nombre o identificación"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe nombre o identificación..."
              />
              <Input
                label="Filtrar por cargo"
                type="text"
                value={cargoFilter}
                onChange={(e) => setCargoFilter(e.target.value)}
                placeholder="Escribe cargo..."
              />
              <div className={styles.employeeList}>
                {employees.map(employee => (
                  <div 
                    key={employee.id} 
                    className={styles.employeeItem}
                    onClick={() => handleEmployeeChange(employee.id.toString())}
                  >
                    <div className={styles.employeeName}>{employee.nombre_operador}</div>
                    <div className={styles.employeeId}>{employee.empleado_identificacion}</div>
                    <div className={styles.employeeCargo}>{employee.cargo || 'Sin cargo'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleExceptionPage;