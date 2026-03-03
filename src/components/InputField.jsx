export default function InputField({
  type,
  name,
  value,
  onChange,
  placeholder
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
    />
  );
}