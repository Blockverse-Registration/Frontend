export default function InputField({
  type,
  name,
  value,
  onChange,
  placeholder,
  readOnly = false
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      readOnly={readOnly}
    />
  );
}