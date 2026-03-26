import { Routes, Route, Navigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import LoginPage from '../pages/LoginPage/LoginPage';
import WelcomePage from '../pages/WelcomePage/WelcomePage';
import CreateUserPage from '../pages/CreateUserPage/CreateUserPage';
import ManageUsersPage from '../pages/ManageUsersPage/ManageUsersPage';
import AssignRolesPage from '../pages/AssignRolesPage/AssignRolesPage';
import AssignPermissionsPage from '../pages/AssignPermissionsPage/AssignPermissionsPage';
import CreateRolePage from '../pages/CreateRolePage/CreateRolePage';
import AreasPage from '../pages/AreasPage/AreasPage';
import TasksPage from '../pages/TasksPage/TasksPage';
import MachineTypesPage from '../pages/MachineTypesPage/MachineTypesPage';
import AddMachinePage from '../pages/AddMachinePage/AddMachinePage';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout/MainLayout';
import AuditLogPage from '../pages/AuditLogPage/AuditLogPage';
import ScheduleDaysPage from '../pages/ScheduleDaysPage/ScheduleDaysPage';
// ... otros imports
import ScheduleCalendarPage from '../pages/ScheduleCalendarPage/ScheduleCalendarPage';
import EmployeeSyncPage from '../pages/EmployeeSyncPage/EmployeeSyncPage';
import EmployeeGroupAssignmentPage from '../pages/EmployeeGroupAssignmentPage/EmployeeGroupAssignmentPage';
import EfficiencyPage from '../pages/EfficiencyPage/EfficiencyPage';
import WorkReportPage from '../pages/WorkReportPage/WorkReportPage';
import ScheduleExceptionPage from '../pages/ScheduleExceptionPage/ScheduleExceptionPage';



const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const PermissionRoute = ({ children, permission }) => {
  const hasPerm = usePermission(permission);
  return hasPerm ? children : <Navigate to="/welcome" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/welcome" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/welcome" element={<ProtectedRoute><MainLayout><WelcomePage /></MainLayout></ProtectedRoute>} />
      
      <Route path="/ingresos" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_view_ingresos">
            <MainLayout><div>Ingresos</div></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />

      // ... dentro del componente AppRoutes
<Route path="/mantenimiento/horarios" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_manage_schedule">
      <MainLayout><ScheduleCalendarPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />

<Route path="/mantenimiento/horarios/excepciones" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_manage_schedule">
      <MainLayout><ScheduleExceptionPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />

<Route path="/reportes/dias-trabajados" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_view_work_reports">
      <MainLayout><WorkReportPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />
      
      <Route path="/mantenimiento/empleados/grupos" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_assign_employee_groups">
      <MainLayout><EmployeeGroupAssignmentPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />

<Route path="/ingresos/eficiencias" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_view_efficiency">
      <MainLayout><EfficiencyPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />

      <Route path="/reportes" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_view_reportes">
            <MainLayout><div>Reportes</div></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />

      <Route path="/mantenimiento/empleados" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_sync_employees">
      <MainLayout><EmployeeSyncPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />

      <Route path="/mantenimiento/horarios" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_manage_schedule"> {/* Nuevo permiso */}
      <MainLayout><ScheduleDaysPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />
      
      <Route path="/reportes/auditoria" element={
  <ProtectedRoute>
    <PermissionRoute permission="can_view_audit_logs"> {/* Nuevo permiso */}
      <MainLayout><AuditLogPage /></MainLayout>
    </PermissionRoute>
  </ProtectedRoute>
} />

      <Route path="/mantenimiento/usuarios/crear" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_create_users">
            <MainLayout><CreateUserPage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/usuarios/actualizar" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_edit_users">
            <MainLayout><ManageUsersPage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/usuarios/asignar-roles" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_assign_roles">
            <MainLayout><AssignRolesPage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/usuarios/asignar-permisos" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_assign_permissions">
            <MainLayout><AssignPermissionsPage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/usuarios/crear-rol" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_create_roles">
            <MainLayout><CreateRolePage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/tareas/areas" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_manage_tasks">
            <MainLayout><AreasPage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/tareas/gestionar" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_manage_tasks">
            <MainLayout><TasksPage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/maquinaria/tipos" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_manage_machines">
            <MainLayout><MachineTypesPage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/mantenimiento/maquinaria/agregar" element={
        <ProtectedRoute>
          <PermissionRoute permission="can_manage_machines">
            <MainLayout><AddMachinePage /></MainLayout>
          </PermissionRoute>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;