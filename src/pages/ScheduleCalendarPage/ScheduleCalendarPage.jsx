import { useState, useEffect } from 'react';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import styles from './ScheduleCalendarPage.module.css';

const API_BASE_URL = 'http://localhost:5000/api/schedule';

const ScheduleCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workGroups, setWorkGroups] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [exceptionData, setExceptionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySchedules, setDaySchedules] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExceptions, setShowExceptions] = useState(false);

  // Turnos fijos
  const fixedShifts = [
    { id: 1, name: 'Día', startTime: '07:00', endTime: '19:00' },
    { id: 2, name: 'Noche', startTime: '19:00', endTime: '07:00' },
    { id: 3, name: 'Libre', startTime: null, endTime: null }
  ];

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const [groupsRes, shiftsRes, scheduleRes, exceptionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/groups`),
        fetch(`${API_BASE_URL}/shifts`),
        fetch(`${API_BASE_URL}/calendar?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`),
        fetch(`${API_BASE_URL}/exceptions?year=${currentDate.getFullYear()}&month=${currentDate.getMonth() + 1}`)
      ]);

      const groupsData = await groupsRes.json();
      const shiftsData = await shiftsRes.json();
      const scheduleData = await scheduleRes.json();
      const exceptionsData = await exceptionsRes.json();

      if (groupsData.success && shiftsData.success && scheduleData.success && exceptionsData.success) {
        setWorkGroups(groupsData.groups);
        setShifts(shiftsData.shifts);
        
        // Convertir array de horarios a objeto por fecha y turno
        const calendarMap = {};
        scheduleData.schedules.forEach(schedule => {
          const dateKey = schedule.day_date.split('T')[0]; // YYYY-MM-DD
          if (!calendarMap[dateKey]) {
            calendarMap[dateKey] = {};
          }
          // Agrupar por shift_id
          calendarMap[dateKey][schedule.shift_id] = schedule;
        });
        setCalendarData(calendarMap);

        // Convertir array de excepciones a objeto por fecha y turno
        const exceptionMap = {};
        exceptionsData.exceptions.forEach(ex => {
          const dateKey = ex.exception_date.split('T')[0]; // YYYY-MM-DD
          if (!exceptionMap[dateKey]) {
            exceptionMap[dateKey] = {};
          }
          // Agrupar por shift_id
          exceptionMap[dateKey][ex.shift_id] = ex;
        });
        setExceptionData(exceptionMap);
      } else {
        setError(groupsData.message || shiftsData.message || scheduleData.message || exceptionsData.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const calendar = [];
    let dayCounter = 1;

    // Días de la semana (Domingo a Sábado)
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // Encabezado de días de la semana
    calendar.push(weekDays.map((day, index) => (
      <div key={`header-${index}`} className={styles.calendarHeader}>
        {day}
      </div>
    )));

    // Filas del calendario
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < firstDay) || dayCounter > daysInMonth) {
          // Día fuera del mes
          calendar.push(<div key={`empty-${week}-${day}`} className={styles.emptyDay}></div>);
        } else {
          // Día dentro del mes
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
          const daySchedulesForDay = calendarData[dateStr] || {};
          const dayExceptionsForDay = exceptionData[dateStr] || {};
          
          calendar.push(
            <div 
              key={`day-${dayCounter}`} 
              className={`${styles.calendarDay} ${Object.keys(daySchedulesForDay).length > 0 ? styles.hasSchedules : ''}`}
              onClick={() => openDayModal(dateStr, daySchedulesForDay)}
            >
              <div className={styles.dayNumber}>{dayCounter}</div>
              <div className={styles.schedules}>
                {fixedShifts.map(shift => {
                  const schedule = daySchedulesForDay[shift.id];
                  const exception = dayExceptionsForDay[shift.id];
                  
                  if (schedule || exception) {
                    return (
                      <div key={shift.id} className={`${styles.scheduleItem} ${styles[shift.name.toLowerCase()]} ${exception ? styles.exception : ''}`}>
                        <span className={styles.shiftName}>{shift.name}</span>
                        <span className={styles.groupName}>
                          {exception 
                            ? `${workGroups.find(g => g.id === exception.original_group_id)?.name || 'Sin grupo'} (Excepción)`
                            : workGroups.find(g => g.id === schedule?.group_id)?.name || 'Sin grupo'
                          }
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
          dayCounter++;
        }
      }
    }

    return calendar;
  };

  const openDayModal = (dateStr, schedules) => {
    // Inicializar todos los turnos con null si no existen
    const initialSchedules = {};
    fixedShifts.forEach(shift => {
      initialSchedules[shift.id] = schedules[shift.id] || {
        id: null,
        day_date: dateStr,
        shift_id: shift.id,
        group_id: '',
        notes: ''
      };
    });
    
    setSelectedDay(dateStr);
    setDaySchedules(initialSchedules);
    setIsModalOpen(true);
  };

  const closeDayModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
    setDaySchedules({});
  };

  const updateScheduleForShift = (shiftId, field, value) => {
    setDaySchedules(prev => ({
      ...prev,
      [shiftId]: {
        ...prev[shiftId],
        [field]: value
      }
    }));
  };

  const saveDaySchedules = async () => {
    try {
      // Procesar cada turno
      for (const shiftId in daySchedules) {
        const schedule = daySchedules[shiftId];
        
        if (schedule.id) {
          // Actualizar existente
          if (schedule.group_id) {
            // Solo actualizar si hay grupo
            await fetch(`${API_BASE_URL}/${schedule.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                day_date: schedule.day_date,
                shift_id: schedule.shift_id,
                group_id: schedule.group_id,
                notes: schedule.notes
              })
            });
          } else {
            // Si no hay grupo, eliminar el registro
            await fetch(`${API_BASE_URL}/${schedule.id}`, {
              method: 'DELETE'
            });
          }
        } else if (schedule.group_id) {
          // Crear nuevo si hay grupo
          await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              day_date: schedule.day_date,
              shift_id: schedule.shift_id,
              group_id: schedule.group_id,
              notes: schedule.notes
            })
          });
        }
      }

      closeDayModal();
      fetchData(); // Refrescar calendario
    } catch (err) {
      setError('Error al guardar horarios');
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (loading) return <div>Cargando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Calendario de Horarios</h2>
        <div className={styles.navigation}>
          <Button variant="secondary" onClick={() => navigateMonth(-1)}>← Anterior</Button>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <Button variant="secondary" onClick={() => navigateMonth(1)}>Siguiente →</Button>
        </div>
      </div>
      
      {error && <p className={styles.error}>{error}</p>}
      
      <div className={styles.controls}>
        <Button variant="secondary" onClick={() => setShowExceptions(!showExceptions)}>
          {showExceptions ? 'Ocultar Excepciones' : 'Ver Excepciones'}
        </Button>
      </div>
      
      <div className={styles.calendar}>
        {generateCalendar()}
      </div>

      {/* Modal para editar horarios del día */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Horarios para {new Date(selectedDay).toLocaleDateString()}</h3>
              <button onClick={closeDayModal} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.modalContent}>
              {fixedShifts.map(shift => {
                const schedule = daySchedules[shift.id];
                return (
                  <div key={shift.id} className={`${styles.scheduleRow} ${styles[shift.name.toLowerCase()]}`}>
                    <h4>{shift.name} {shift.startTime && shift.endTime ? `(${shift.startTime} - ${shift.endTime})` : '(Libre)'}</h4>
                    <div className={styles.row}>
                      <Select
                        label="Grupo de Trabajo"
                        value={schedule.group_id}
                        onChange={(e) => updateScheduleForShift(shift.id, 'group_id', e.target.value)}
                        options={[
                          { value: '', label: 'Sin grupo...' },
                          ...workGroups.map(group => ({ value: group.id, label: group.name }))
                        ]}
                        required
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={styles.modalFooter}>
              <Button variant="secondary" onClick={closeDayModal}>Cancelar</Button>
              <Button variant="primary" onClick={saveDaySchedules}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendarPage;