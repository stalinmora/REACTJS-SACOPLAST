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
    
    console.log('=== GENERANDO REPORTE ===');
    console.log('Datos del formulario:', formData);
    console.log('URL base:', API_BASE_URL);
    console.log('URL completa:', `${API_BASE_URL}/global-work-schedule`);
    
    setLoading(true);
    setError('');

    try {
      // Primero, probemos si podemos acceder al endpoint
      console.log('Intentando acceder al endpoint...');
      
      const response = await fetch(`${API_BASE_URL}/global-work-schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          start_date: formData.start_date,
          end_date: formData.end_date
        })
      });



// ✅ Ahora (correcto)
console.log('Response status:', response.status);
console.log('Response headers:', response.headers);
      
      // Intentar leer el cuerpo de la respuesta como texto primero para ver si hay errores
      const responseText = await response.text();
      console.log('Response text (raw):', responseText);

      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Response data (parsed):', data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Raw response:', responseText);
        throw new Error('La respuesta del servidor no es un JSON válido');
      }

      if (data.success) {
        console.log('Procesando datos recibidos...');
        processData(data.reports);
        console.log('Datos procesados exitosamente');
      } else {
        console.error('Respuesta con error:', data.message);
        setError(data.message || 'Error al generar reporte');
      }
    } catch (err) {
      console.error('Error completo en la solicitud:', err);
      console.error('Tipo de error:', typeof err);
      console.error('Mensaje de error:', err.message);
      console.error('Stack de error:', err.stack);
      
      if (err.message.includes('fetch')) {
        setError('No se puede conectar con el servidor. Verifica que el servidor esté corriendo.');
      } else if (err.message.includes('404')) {
        setError('Endpoint no encontrado. Verifica que el endpoint esté correctamente registrado en el servidor.');
      } else if (err.message.includes('JSON')) {
        setError('La respuesta del servidor no es válida. Verifica el formato de la respuesta.');
      } else {
        setError('Error de conexión con el servidor: ' + err.message);
      }
    } finally {
      console.log('Finalizando solicitud');
      setLoading(false);
    }
  };

  const processData = (rawData) => {
    console.log('Procesando datos:', rawData);
    
    if (!rawData || !Array.isArray(rawData)) {
      console.error('Datos inválidos para procesar:', rawData);
      return;
    }

    // Obtener fechas únicas
    const uniqueDates = [...new Set(rawData.map(item => item.date))].sort();
    console.log('Fechas encontradas:', uniqueDates);
    
    // Agrupar datos por empleado
    const groupedByEmployee = rawData.reduce((acc, item) => {
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
          hours_worked: item.hours_worked || 0,
          efficiency_percentage: item.efficiency_percentage || 0,
          shift_info: item.shift_name || 'N/A'
        };
      }
      
      return acc;
    }, {});

    console.log('Agrupado por empleado:', groupedByEmployee);

    // Convertir a array para la tabla
    const processedData = Object.values(groupedByEmployee);

    console.log('Datos procesados finalizados:', processedData);
    setDates(uniqueDates);
    setReportData(processedData);
  };

  const exportToExcel = () => {
    alert('Funcionalidad de exportación a Excel pendiente de implementar');
  };

  // Función para determinar el tipo de turno basado en la información disponible
  const getShiftType = (dayData) => {
    if (!dayData) {
      return 'LIBRE'; // No tiene registros, está libre
    }
    
    const hours = dayData.hours_worked || 0;
    const shiftName = dayData.shift_info || '';
    
    if (hours === 0) {
      return 'LIBRE'; // No trabajó, está libre
    } else if (shiftName.toLowerCase().includes('mañana') || shiftName.toLowerCase().includes('morning') || hours <= 8) {
      return 'MAÑANA'; // Turno de mañana
    } else if (shiftName.toLowerCase().includes('noche') || shiftName.toLowerCase().includes('night') || hours > 8) {
      return 'NOCHE'; // Turno de noche
    } else {
      return 'MAÑANA'; // Por defecto, turno de mañana
    }
  };

  // Función para obtener el estilo de celda según el turno
  const getCellStyle = (shiftType) => {
    switch (shiftType) {
      case 'MAÑANA':
        return {
          backgroundColor: '#add8e6', // Celeste claro
          color: '#000080' // Azul oscuro para el texto
        };
      case 'NOCHE':
        return {
          backgroundColor: '#d3d3d3', // Gris claro
          color: '#2f4f4f' // Gris oscuro para el texto
        };
      case 'LIBRE':
        return {
          backgroundColor: '#ffffcc', // Amarillo claro
          color: '#8b4513', // Marrón oscuro para el texto
          fontWeight: 'bold'
        };
      default:
        return {
          backgroundColor: '#ffffff', // Blanco por defecto
          color: '#000000'
        };
    }
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
                      const shiftType = getShiftType(dayData);
                      const cellStyle = getCellStyle(shiftType);
                      
                      return (
                        <td 
                          key={date} 
                          className={styles.dataCell}
                          style={cellStyle}
                        >
                          {shiftType === 'LIBRE' ? (
                            <div className={styles.cellContent}>
                              <div className={styles.freeDay}>LIBRE</div>
                            </div>
                          ) : dayData ? (
                            <div className={styles.cellContent}>
                              <div className={styles.hours}>Horas: {dayData.hours_worked}</div>
                              <div className={styles.efficiency}>Eficiencia: {dayData.efficiency_percentage}%</div>
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