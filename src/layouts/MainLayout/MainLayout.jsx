import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './MainLayout.module.css';

// Iconos SVG simples
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();
  const [showIngresosMenu, setShowIngresosMenu] = useState(false);
  const [showMantenimientoMenu, setShowMantenimientoMenu] = useState(false);
  const [showReportesMenu, setShowReportesMenu] = useState(false);

  // Referencias para cada dropdown
  const ingresosRef = useRef(null);
  const mantenimientoRef = useRef(null);
  const reportesRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goTo = (path) => {
    navigate(path);
  };

  // Función para cerrar todos los menús
  const closeAllMenus = () => {
    setShowIngresosMenu(false);
    setShowMantenimientoMenu(false);
    setShowReportesMenu(false);
  };

  // Efecto para cerrar menús cuando se hace clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ingresosRef.current && !ingresosRef.current.contains(event.target)) {
        setShowIngresosMenu(false);
      }
      if (mantenimientoRef.current && !mantenimientoRef.current.contains(event.target)) {
        setShowMantenimientoMenu(false);
      }
      if (reportesRef.current && !reportesRef.current.contains(event.target)) {
        setShowReportesMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navTitle}>Sacoplast Eficiencias</div>
        <ul className={styles.navLinks}>
          <li className={styles.dropdown} ref={ingresosRef}>
            <button
              onClick={() => setShowIngresosMenu(!showIngresosMenu)}
              disabled={!hasPermission('can_view_ingresos')}
              className={`${styles.navButton} ${!hasPermission('can_view_ingresos') ? styles.disabledButton : ''}`}
            >
              Ingresos
            </button>
            {showIngresosMenu && (
              <ul className={styles.dropdownMenu}>
                {hasPermission('can_view_efficiency') && (
                  <li><button onClick={() => { goTo('/ingresos/eficiencias'); closeAllMenus(); }} className={styles.dropdownItem}>Eficiencias</button></li>
                )}
              </ul>
            )}
          </li>
          <li className={styles.dropdown} ref={reportesRef}>
            <button
              onClick={() => setShowReportesMenu(!showReportesMenu)}
              disabled={!hasPermission('can_view_reports')}
              className={`${styles.navButton} ${!hasPermission('can_view_reports') ? styles.disabledButton : ''}`}
            >
              Reportes
            </button>
            {showReportesMenu && (
              <ul className={styles.dropdownMenu}>
                {hasPermission('can_view_audit_logs') && (
                  <li><button onClick={() => { goTo('/reportes/auditoria'); closeAllMenus(); }} className={styles.dropdownItem}>Auditoría</button></li>
                )}
                {hasPermission('can_view_work_reports') && (
                  <li><button onClick={() => { goTo('/reportes/dias-trabajados'); closeAllMenus(); }} className={styles.dropdownItem}>Días y Horarios Trabajados</button></li>
                )}
              </ul>
            )}
          </li>
          <li className={styles.dropdown} ref={mantenimientoRef}>
            <button
              onClick={() => setShowMantenimientoMenu(!showMantenimientoMenu)}
              disabled={!(
                hasPermission('can_create_users') || 
                hasPermission('can_edit_users') || 
                hasPermission('can_assign_roles') ||
                hasPermission('can_assign_permissions') ||
                hasPermission('can_create_roles') ||
                hasPermission('can_manage_machines') ||
                hasPermission('can_manage_tasks') ||
                hasPermission('can_manage_schedule') ||
                hasPermission('can_sync_employees') ||
                hasPermission('can_assign_employee_groups')
              )}
              className={`${styles.navButton} ${!(
                hasPermission('can_create_users') || 
                hasPermission('can_edit_users') || 
                hasPermission('can_assign_roles') ||
                hasPermission('can_assign_permissions') ||
                hasPermission('can_create_roles') ||
                hasPermission('can_manage_machines') ||
                hasPermission('can_manage_tasks') ||
                hasPermission('can_manage_schedule') ||
                hasPermission('can_sync_employees') ||
                hasPermission('can_assign_employee_groups')
              ) ? styles.disabledButton : ''}`}
            >
              Mantenimiento
            </button>
            {showMantenimientoMenu && (
              <ul className={styles.dropdownMenu}>
                <li className={styles.subDropdown}>
                  <button className={styles.dropdownHeader}>Usuarios</button>
                  <ul className={styles.subDropdownMenu}>
                    {hasPermission('can_create_users') && (
                      <li><button onClick={() => { goTo('/mantenimiento/usuarios/crear'); closeAllMenus(); }} className={styles.dropdownItem}>Crear</button></li>
                    )}
                    {hasPermission('can_edit_users') && (
                      <li><button onClick={() => { goTo('/mantenimiento/usuarios/actualizar'); closeAllMenus(); }} className={styles.dropdownItem}>Actualizar</button></li>
                    )}
                    {hasPermission('can_assign_roles') && (
                      <li><button onClick={() => { goTo('/mantenimiento/usuarios/asignar-roles'); closeAllMenus(); }} className={styles.dropdownItem}>Asignar Roles</button></li>
                    )}
                    {hasPermission('can_assign_permissions') && (
                      <li><button onClick={() => { goTo('/mantenimiento/usuarios/asignar-permisos'); closeAllMenus(); }} className={styles.dropdownItem}>Asignar Permisos</button></li>
                    )}
                    {hasPermission('can_create_roles') && (
                      <li><button onClick={() => { goTo('/mantenimiento/usuarios/crear-rol'); closeAllMenus(); }} className={styles.dropdownItem}>Crear Rol</button></li>
                    )}
                  </ul>
                </li>
                <li className={styles.subDropdown}>
                  <button className={styles.dropdownHeader}>Maquinaria</button>
                  <ul className={styles.subDropdownMenu}>
                    {hasPermission('can_manage_machines') && (
                      <>
                        <li><button onClick={() => { goTo('/mantenimiento/maquinaria/tipos'); closeAllMenus(); }} className={styles.dropdownItem}>Tipos de Máquina</button></li>
                        <li><button onClick={() => { goTo('/mantenimiento/maquinaria/agregar'); closeAllMenus(); }} className={styles.dropdownItem}>Agregar Máquina</button></li>
                      </>
                    )}
                  </ul>
                </li>
                <li className={styles.subDropdown}>
                  <button className={styles.dropdownHeader}>Tareas</button>
                  <ul className={styles.subDropdownMenu}>
                    {hasPermission('can_manage_tasks') && (
                      <>
                        <li><button onClick={() => { goTo('/mantenimiento/tareas/areas'); closeAllMenus(); }} className={styles.dropdownItem}>Áreas</button></li>
                        <li><button onClick={() => { goTo('/mantenimiento/tareas/gestionar'); closeAllMenus(); }} className={styles.dropdownItem}>Gestionar Tareas</button></li>
                      </>
                    )}
                  </ul>
                </li>
                <li className={styles.subDropdown}>
                  <button className={styles.dropdownHeader}>Horarios</button>
                  <ul className={styles.subDropdownMenu}>
                    {hasPermission('can_manage_schedule') && (
                      <>
                        <li><button onClick={() => { goTo('/mantenimiento/horarios'); closeAllMenus(); }} className={styles.dropdownItem}>Gestionar Horarios</button></li>
                        <li><button onClick={() => { goTo('/mantenimiento/horarios/excepciones'); closeAllMenus(); }} className={styles.dropdownItem}>Gestionar Excepciones</button></li>
                      </>
                    )}
                  </ul>
                </li>
                <li className={styles.subDropdown}>
                  <button className={styles.dropdownHeader}>Empleados</button>
                  <ul className={styles.subDropdownMenu}>
                    {hasPermission('can_sync_employees') && (
                      <li><button onClick={() => { goTo('/mantenimiento/empleados'); closeAllMenus(); }} className={styles.dropdownItem}>Actualizar Operadores y Supervisores</button></li>
                    )}
                    {hasPermission('can_assign_employee_groups') && (
                      <li><button onClick={() => { goTo('/mantenimiento/empleados/grupos'); closeAllMenus(); }} className={styles.dropdownItem}>Asignar a Grupos</button></li>
                    )}
                  </ul>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogoutIcon />
              <span>Salir</span>
            </button>
          </li>
        </ul>
      </nav>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;