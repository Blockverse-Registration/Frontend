export default function Button({ text, loading }) {
  return (
    <button type="submit" disabled={loading}>
      {loading ? "Registering..." : text}
    </button>
  );
}