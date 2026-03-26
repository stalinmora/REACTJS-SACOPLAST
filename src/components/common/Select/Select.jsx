import styles from './Select.module.css';

const Select = ({ label, value, onChange, options, required, ...props }) => {
  return (
    <div className={styles.selectContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={styles.select}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;