import { useState } from 'react';
import styles from './ChangePasswordModal.module.css';

const ChangePasswordModal = ({ isOpen, onClose, onSave, userId }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('Debe tener al menos 6 caracteres');
      return;
    }

    onSave(userId, password);
    onClose(); // Cierra el modal tras guardar
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Cambiar Contraseña</h3>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.inputGroup}>
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className={styles.buttonGroup}>
          <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          <button onClick={handleSave} className={styles.saveButton}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;