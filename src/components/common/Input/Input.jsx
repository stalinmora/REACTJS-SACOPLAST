import styles from './Input.module.css';

const Input = ({ label, type = 'text', value, onChange, required, ...props }) => {
  return (
    <div className={styles.inputContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={styles.input}
        {...props}
      />
    </div>
  );
};

export default Input;