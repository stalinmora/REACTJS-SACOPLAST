import { useState } from 'react';
import Input from '../../../common/Input/Input';
import Button from '../../../common/Button/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';

const API_BASE_URL = 'http://localhost:5000/api/auth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // ✅ Ahora sí funciona
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.token, data.user.permissions, data.user.role);
        navigate('/welcome');
      } else {
        setError(data.message || 'Error en inicio de sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        {error && <p className={styles.error}>{error}</p>}
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button variant="primary" type="submit">
          Entrar
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;