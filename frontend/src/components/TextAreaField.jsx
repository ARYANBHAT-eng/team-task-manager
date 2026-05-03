function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-500">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50"
      />
    </label>
  );
}

export default TextAreaField;
