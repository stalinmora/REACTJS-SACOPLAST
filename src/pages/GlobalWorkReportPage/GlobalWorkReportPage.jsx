import { useState, useEffect } from 'react';
import { API_HOST } from '../../config/apiConfig';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './GlobalWorkReportPage.module.css';

const API_BASE_URL = `${API_HOST}/api/reports`;

const GlobalWorkReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [dates, setDates] = useState([]);
  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/global-work-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: formData.start_date,
          end_date: formData.end_date
        })
      });

      const data = await response.json();

      if (data.success) {
        processData(data.reports);
      } else {
        setError(data.message || 'Error al generar reporte');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const processData = (rawData) => {
    console.log('Datos crudos recibidos:', rawData); // Debug log
    
    if (!rawData || !Array.isArray(rawData)) {
      console.error('Datos inválidos:', rawData); // Debug log
      return;
    }

    // Agrupar datos por empleado y fecha
    const groupedByEmployee = rawData.reduce((acc, item) => {
      console.log('Procesando item:', item); // Debug log
      
      const employeeId = item.employee_id;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee_id: employeeId,
          employee_name: item.employee_name,
          cargo: item.cargo,
          dateData: {}
        };
      }
      
      const formattedDate = new Date(item.date).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      
      if (!acc[employeeId].dateData[formattedDate]) {
        acc[employeeId].dateData[formattedDate] = {
          total_hours: 0,
          weighted_sum: 0, // Acumulador para (eficiencia × horas)
          individual_records: [] // Para debug
        };
      }
      
      // Obtener valores reales
      const hours = parseFloat(item.hours_worked) || 0;
      const efficiency = parseFloat(item.efficiency_percentage) || 0;
      
      console.log('Valores - Horas:', hours, 'Eficiencia:', efficiency); // Debug log
      
      // Sumar horas totales
      acc[employeeId].dateData[formattedDate].total_hours += hours;
      
      // Sumar para el ponderado: (eficiencia × horas)
      const product = efficiency * hours;
      acc[employeeId].dateData[formattedDate].weighted_sum += product;
      
      // Guardar registro individual para debug
      acc[employeeId].dateData[formattedDate].individual_records.push({
        hours: hours,
        efficiency: efficiency,
        product: product
      });
      
      return acc;
    }, {});

    console.log('Agrupado por empleado:', groupedByEmployee); // Debug log

    // Calcular promedio ponderado por fecha
    const processedData = Object.values(groupedByEmployee).map(employee => {
      const processedDateData = {};
      const uniqueDates = new Set();
      
      Object.entries(employee.dateData).forEach(([date, data]) => {
        uniqueDates.add(date);
        
        // Calcular promedio ponderado: Σ(Eficiencia × Horas) / 12
        const weighted_average = 12 > 0 
          ? parseFloat((data.weighted_sum / 12).toFixed(2))
          : 0;
        
        processedDateData[date] = {
          total_hours: parseFloat(data.total_hours.toFixed(2)),
          weighted_average: weighted_average,
          individual_records: data.individual_records
        };
        
        console.log('Cálculo detallado para', date, ':'); // Debug log
        console.log('  Suma ponderada:', data.weighted_sum); // Debug log
        console.log('  Divisor (12 horas):', 12); // Debug log
        console.log('  Promedio ponderado:', weighted_average); // Debug log
        console.log('  Registros individuales:', data.individual_records); // Debug log
      });
      
      return {
        ...employee,
        dateData: processedDateData
      };
    });

    // Obtener fechas únicas para el encabezado
    const allDates = [...new Set(rawData.map(item => item.date))].sort();
    console.log('Fechas únicas:', allDates); // Debug log
    
    console.log('Datos procesados finales:', processedData); // Debug log
    setDates(allDates);
    setReportData(processedData);
  };

  const exportToExcel = () => {
    alert('Funcionalidad de exportación a Excel pendiente de implementar');
  };

  return (
    <div className={styles.container}>
      <h2>Reporte Global de Horas y Eficiencia</h2>
      
      {error && <p className={styles.error}>{error}</p>}
      
      <form onSubmit={generateReport} className={styles.filters}>
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
          <Button variant="secondary" onClick={exportToExcel} disabled={reportData.length === 0}>
            Exportar a Excel
          </Button>
        </div>
      </form>

      {reportData.length > 0 && (
        <div className={styles.reportTable}>
          <h3>Resultados del Reporte</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Cargo</th>
                  {dates.map(date => (
                    <th key={date}>
                      {new Date(date).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((employee, index) => (
                  <tr key={employee.employee_id || index}>
                    <td>{employee.employee_name}</td>
                    <td>{employee.cargo || '-'}</td>
                    {dates.map(date => {
                      const formattedDate = new Date(date).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      });
                      
                      const dayData = employee.dateData[formattedDate];
                      
                      console.log('Mostrando datos para:', formattedDate, dayData); // Debug log
                      
                      return (
                        <td key={date} className={styles.dataCell}>
                          {dayData ? (
                            <div className={styles.cellContent}>
                              <div className={styles.hours}>Horas: {dayData.total_hours}</div>
                              <div className={styles.efficiency}>Eficiencia: {dayData.weighted_average}%</div>
                            </div>
                          ) : (
                            <div className={styles.noData}>-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalWorkReportPage;