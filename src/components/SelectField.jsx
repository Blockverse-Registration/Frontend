export default function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="input-field"
      required
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}