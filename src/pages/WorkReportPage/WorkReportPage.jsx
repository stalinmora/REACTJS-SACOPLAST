import { useState, useEffect } from 'react';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './WorkReportPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/reports';

const WorkReportPage = () => {
  const [employees, setEmployees] = useState([]);
  const [workGroups, setWorkGroups] = useState([]);
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    group_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, groupsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/groups`)
      ]);

      const employeesData = await employeesRes.json();
      const groupsData = await groupsRes.json();

      if (employeesData.success && groupsData.success) {
        setEmployees(employeesData.employees);
        setWorkGroups(groupsData.groups);
      } else {
        setError(employeesData.message || groupsData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const generateReport = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/work-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: formData.employee_id || null,
          group_id: formData.group_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date
        })
      });

      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      } else {
        setError(data.message || 'Error al generar reporte');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    alert('Funcionalidad de exportación a Excel pendiente de implementar');
  };

  return (
    <div className={styles.container}>
      <h2>Reporte de Días y Horarios Trabajados</h2>
      
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={generateReport} className={styles.filters}>
        <div className={styles.row}>
          <Select
            label="Empleado"
            value={formData.employee_id}
            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
            options={[
              { value: '', label: 'Todos los empleados...' },
              ...employees.map(emp => ({ 
                value: emp.id, 
                label: `${emp.nombre_operador} (${emp.empleado_identificacion})` 
              }))
            ]}
          />
          <Select
            label="Grupo"
            value={formData.group_id}
            onChange={(e) => setFormData({...formData, group_id: e.target.value})}
            options={[
              { value: '', label: 'Todos los grupos...' },
              ...workGroups.map(group => ({ 
                value: group.id, 
                label: group.name 
              }))
            ]}
          />
        </div>
        <div className={styles.row}>
          <Input
            label="Fecha Inicio"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
          />
        </div>
        <div className={styles.buttonGroup}>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Generando...' : 'Generar Reporte'}
          </Button>
          <Button variant="secondary" onClick={exportToExcel} disabled={reports.length === 0}>
            Exportar a Excel
          </Button>
        </div>
      </form>

      {reports.length > 0 && (
        <div className={styles.reportTable}>
          <h3>Resultados del Reporte</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Grupo</th>
                  <th>Fecha</th>
                  <th>Tarea/Actividad</th>
                  <th>Horas Trabajadas</th>
                  <th>Producción Esperada</th>
                  <th>Producción Real</th>
                  <th>Eficiencia</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={`report-${index}-${report.employee_name}-${report.date}`}>
                    <td>{report.employee_name}</td>
                    <td>{report.group_name || '-'}</td>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.task_description || report.shift_name || '-'}</td>
                    <td>{report.hours_worked !== undefined && report.hours_worked !== null ? report.hours_worked : '-'}</td>
                    <td>{report.expected_production !== undefined && report.expected_production !== null ? report.expected_production : '-'}</td>
                    <td>{report.actual_production !== undefined && report.actual_production !== null ? report.actual_production : '-'}</td>
                    <td>
                      {report.efficiency_percentage !== undefined && report.efficiency_percentage !== null 
                        ? `${parseFloat(report.efficiency_percentage).toFixed(2)}%` 
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.summary}>
            <h4>Resumen</h4>
            <div className={styles.summaryStats}>
              <div className={styles.stat}>
                <span className={styles.label}>Total Registros:</span>
                <span className={styles.value}>{reports.length}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>Registros con Eficiencia:</span>
                <span className={styles.value}>{reports.filter(r => r.is_efficiency).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkReportPage;