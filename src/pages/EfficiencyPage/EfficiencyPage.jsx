import { useState, useEffect } from 'react';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './EfficiencyPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/efficiency';

const EfficiencyPage = () => {
  const [employees, setEmployees] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [formData, setFormData] = useState({
    employee_id: '',
    record_date: new Date().toISOString().split('T')[0],
    area_id: '',
    task_id: '',
    hours_worked: '',
    expected_production: '',
    actual_production: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskSearchTerm, setTaskSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, areasRes, tasksRes, recordsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/areas`),
        fetch(`${API_BASE_URL}/tasks`),
        fetch(`${API_BASE_URL}`)
      ]);

      const employeesData = await employeesRes.json();
      const areasData = await areasRes.json();
      const tasksData = await tasksRes.json();
      const recordsData = await recordsRes.json();

      console.log('Datos recibidos:', { // Debug log
        employees: employeesData,
        records: recordsData
      });

      if (employeesData.success && areasData.success && tasksData.success && recordsData.success) {
        setEmployees(employeesData.employees);
        setAllEmployees(employeesData.employees); // Para búsqueda
        setAreas(areasData.areas);
        setTasks(tasksData.tasks);
        setAllTasks(tasksData.tasks); // Para búsqueda
        setRecords(recordsData.records);
      } else {
        setError(employeesData.message || areasData.message || tasksData.message || recordsData.message || 'Error al cargar datos');
      }
    } catch (err) {
      console.error('Error en fetchData:', err); // Debug log
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Variables para búsqueda
  const [allEmployees, setAllEmployees] = useState([]); // Para búsqueda
  const [allTasks, setAllTasks] = useState([]); // Para búsqueda

  // Filtrar empleados por nombre o apellido
  useEffect(() => {
    if (searchTerm) {
      const filtered = allEmployees.filter(emp =>
        emp.nombre_operador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empleado_identificacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setEmployees(filtered);
    } else {
      setEmployees(allEmployees);
    }
  }, [searchTerm, allEmployees]);

  // Filtrar tareas por área y descripción
  useEffect(() => {
    let filtered = allTasks;

    if (formData.area_id) {
      filtered = filtered.filter(task => task.area_id == formData.area_id);
    }

    if (taskSearchTerm) {
      filtered = filtered.filter(task =>
        task.description.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        task.specification?.toLowerCase().includes(taskSearchTerm.toLowerCase()) || ''
      );
    }

    setFilteredTasks(filtered);
  }, [formData.area_id, taskSearchTerm, allTasks]);

  useEffect(() => {
    // Calcular producción esperada cuando cambia tarea o horas
    if (formData.task_id && formData.hours_worked) {
      const selectedTask = tasks.find(t => t.id === parseInt(formData.task_id));
      if (selectedTask) {
        const hours = parseFloat(formData.hours_worked);
        let expected = 0;

        if (selectedTask.target_per_hour) {
          expected = selectedTask.target_per_hour * hours;
        } else if (selectedTask.target_per_shift) {
          // Si es por turno, calcular proporcionalmente
          expected = (selectedTask.target_per_shift / 8) * hours; // Asumiendo turno de 8 horas
        }

        setFormData(prev => ({
          ...prev,
          expected_production: expected.toFixed(2)
        }));
      }
    }
  }, [formData.task_id, formData.hours_worked, tasks]);

  useEffect(() => {
    // Filtrar registros por la fecha y empleado seleccionados
    const filtered = records.filter(record => {
      const recordDate = new Date(record.record_date).toISOString().split('T')[0];
      const selectedDate = formData.record_date;
      return recordDate === selectedDate && record.employee_id == formData.employee_id;
    });
    
    setFilteredRecords(filtered);
    
    // Calcular horas totales trabajadas para el empleado en esa fecha
    const total = filtered.reduce((sum, record) => sum + record.hours_worked, 0);
    setTotalHours(total);
  }, [records, formData.record_date, formData.employee_id]);

  const calculateEfficiency = (expected, actual) => {
    if (!expected || !actual) return 0;
    return ((actual / expected) * 100).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id || !formData.record_date || !formData.task_id) {
      setError('Empleado, Fecha y Tarea son requeridos');
      return;
    }

    if (parseFloat(formData.hours_worked) <= 0) {
      setError('Las horas trabajadas deben ser mayores a 0');
      return;
    }

    // Verificar que las horas totales no excedan 12
    const newTotalHours = totalHours + parseFloat(formData.hours_worked);
    if (newTotalHours > 12) {
      setError(`El empleado ya tiene ${totalHours} horas registradas. Al sumar ${formData.hours_worked} horas más, excedería el límite de 12 horas por día.`);
      return;
    }

    // Calcular eficiencia
    const efficiency = calculateEfficiency(
      parseFloat(formData.expected_production),
      parseFloat(formData.actual_production)
    );

    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours_worked: parseFloat(formData.hours_worked),
          expected_production: parseFloat(formData.expected_production),
          actual_production: parseFloat(formData.actual_production),
          efficiency_percentage: parseFloat(efficiency)
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchData(); // Refrescar todos los datos
        setFormData({
          employee_id: formData.employee_id, // Mantener el mismo empleado
          record_date: formData.record_date, // Mantener la misma fecha
          area_id: '',
          task_id: '',
          hours_worked: '',
          expected_production: '',
          actual_production: ''
        });
        setSuccess('Registro de eficiencia guardado exitosamente');
        setError('');
      } else {
        setError(data.message || 'Error al guardar registro de eficiencia');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleAreaChange = (areaId) => {
    setFormData(prev => ({ ...prev, area_id: areaId, task_id: '' }));
  };

  const handleTaskChange = (taskId) => {
    setFormData(prev => ({ ...prev, task_id: taskId }));
    setShowTaskModal(false);
  };

  const handleHoursChange = (hours) => {
    setFormData(prev => ({ ...prev, hours_worked: hours }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, record_date: date }));
  };

  const handleEmployeeChange = (employeeId) => {
    setFormData(prev => ({ ...prev, employee_id: employeeId }));
    setShowEmployeeModal(false);
  };

  const openEmployeeModal = () => {
    setShowEmployeeModal(true);
    setSearchTerm('');
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setSearchTerm('');
    setEmployees(allEmployees); // Restaurar todos los empleados
  };

  const openTaskModal = () => {
    setShowTaskModal(true);
    setTaskSearchTerm('');
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setTaskSearchTerm('');
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h2>Registro de Eficiencias</h2>
      
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div>
            <label className={styles.label}>Empleado</label>
            <div className={styles.selectedEmployee}>
              {employees.find(emp => emp.id == formData.employee_id) 
                ? `${employees.find(emp => emp.id == formData.employee_id).nombre_operador} (${employees.find(emp => emp.id == formData.employee_id).empleado_identificacion})`
                : 'Seleccionar empleado...'}
              <Button variant="secondary" type="button" onClick={openEmployeeModal}>
                Buscar
              </Button>
            </div>
          </div>
          <Input
            label="Fecha de Registro"
            type="date"
            value={formData.record_date}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.row}>
          <Select
            label="Área"
            value={formData.area_id}
            onChange={(e) => handleAreaChange(e.target.value)}
            options={[
              { value: '', label: 'Seleccionar área...' },
              ...areas.map(area => ({ 
                value: area.id, 
                label: area.name 
              }))
            ]}
            required
          />
          <div>
            <label className={styles.label}>Tarea Asignada</label>
            <div className={styles.selectedTask}>
              {tasks.find(task => task.id == formData.task_id) 
                ? tasks.find(task => task.id == formData.task_id).description
                : 'Seleccionar tarea...'}
              <Button variant="secondary" type="button" onClick={openTaskModal}>
                Buscar
              </Button>
            </div>
          </div>
        </div>
        
        <div className={styles.row}>
          <Input
            label="Horas Trabajadas"
            type="number"
            step="0.01"
            min="0.01"
            max="12"
            value={formData.hours_worked}
            onChange={(e) => handleHoursChange(e.target.value)}
            placeholder={`Máximo ${12 - totalHours} horas`}
            required
          />
          <Input
            label="Producción Esperada"
            type="number"
            step="0.01"
            value={formData.expected_production}
            onChange={(e) => setFormData({...formData, expected_production: e.target.value})}
            placeholder="Calculada automáticamente"
            readOnly
          />
        </div>
        
        <div className={styles.row}>
          <Input
            label="Producción Real"
            type="number"
            step="0.01"
            value={formData.actual_production}
            onChange={(e) => setFormData({...formData, actual_production: e.target.value})}
            placeholder="Unidades producidas"
          />
        </div>
        
        <div className={styles.efficiencyInfo}>
          <h4>Horas Totales Trabajadas: 
            <span className={styles.totalHours}>
              {totalHours}h de 12h máximas
            </span>
          </h4>
          <h4>Porcentaje de Eficiencia: 
            <span className={styles.percentage}>
              {calculateEfficiency(formData.expected_production, formData.actual_production)}%
            </span>
          </h4>
        </div>
        
        <Button variant="primary" type="submit">
          Registrar Eficiencia
        </Button>
      </form>

      <h3>Registros de {employees.find(emp => emp.id == formData.employee_id)?.nombre_operador || 'Empleado'} el {new Date(formData.record_date).toLocaleDateString()}</h3>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Área</th>
              <th>Horas</th>
              <th>Esperada</th>
              <th>Real</th>
              <th>Eficiencia</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => {
                const task = tasks.find(t => t.id === record.task_id);
                const area = areas.find(a => a.id === task?.area_id);
                
                return (
                  <tr key={record.id}>
                    <td>{task?.description || '-'}</td>
                    <td>{area?.name || '-'}</td>
                    <td>{record.hours_worked}h</td>
                    <td>{record.expected_production || '-'}</td>
                    <td>{record.actual_production || '-'}</td>
                    <td>
                      <span className={`${styles.percentage} ${record.efficiency_percentage >= 100 ? styles.high : record.efficiency_percentage >= 80 ? styles.medium : styles.low}`}>
                        {record.efficiency_percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className={styles.noData}>No hay registros para este empleado en esta fecha</td>
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
              <div className={styles.employeeList}>
                {employees.map(employee => (
                  <div 
                    key={employee.id} 
                    className={styles.employeeItem}
                    onClick={() => handleEmployeeChange(employee.id)}
                  >
                    <div className={styles.employeeName}>{employee.nombre_operador}</div>
                    <div className={styles.employeeId}>{employee.empleado_identificacion}</div>
                    <div className={styles.employeeCargo}>{employee.cargo}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para buscar tarea */}
      {showTaskModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Buscar Tarea</h3>
              <button onClick={closeTaskModal} className={styles.closeButton}>×</button>
            </div>
            <div className={styles.modalBody}>
              <Select
                label="Filtrar por Área"
                value={formData.area_id}
                onChange={(e) => setFormData(prev => ({ ...prev, area_id: e.target.value }))}
                options={[
                  { value: '', label: 'Todas las áreas...' },
                  ...areas.map(area => ({ 
                    value: area.id, 
                    label: area.name 
                  }))
                ]}
              />
              <Input
                label="Buscar por descripción o especificación"
                type="text"
                value={taskSearchTerm}
                onChange={(e) => setTaskSearchTerm(e.target.value)}
                placeholder="Escribe descripción o especificación..."
              />
              <div className={styles.taskList}>
                {filteredTasks.map(task => {
                  const area = areas.find(a => a.id === task.area_id);
                  
                  return (
                    <div 
                      key={task.id} 
                      className={styles.taskItem}
                      onClick={() => handleTaskChange(task.id)}
                    >
                      <div className={styles.taskDescription}>{task.description}</div>
                      <div className={styles.taskSpecification}>{task.specification || 'Sin especificación'}</div>
                      <div className={styles.taskDetails}>
                        <span className={styles.taskArea}>Área: {area?.name || '-'}</span>
                        <span className={styles.taskTarget}>Meta por turno: {task.target_per_shift || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EfficiencyPage;