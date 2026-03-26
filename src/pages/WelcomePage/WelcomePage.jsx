import styles from './WelcomePage.module.css';

const WelcomePage = () => {
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>¡Bienvenido!</h1>
      <p>Has iniciado sesión correctamente.</p>
      <p>Navega usando la barra superior.</p>
    </div>
  );
};

export default WelcomePage;