const InputField_Biens = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  multi = false,
  required = false,
  disabled = false,
  width = 'w-full',
  height = 'h-[38px]',
  min = null,
  max = null,
  placeholder = '',
  error, // Add error prop to receive error messages
}) => {
  // For datetime-local inputs, ensure placeholder shows format
  const resolvedPlaceholder = type === 'datetime-local' && !placeholder 
    ? 'YYYY-MM-DDTHH:MM' 
    : placeholder;

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-[15px] font-medium !text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {multi ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          rows={4}
          className={`block ${width} w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      ) : (
        <div className="relative">
          <input
            id={name}
            name={name}
            type={type}
            value={value !== undefined && value !== null ? value : ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            placeholder={resolvedPlaceholder}
            className={`block ${width} ${height} px-3 py-2 text-sm border ${
              error ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500 ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            style={type === 'datetime-local' ? {
              cursor: 'pointer',
              caretColor: 'transparent'
            } : {}}
            onFocus={(e) => {
              if (type === 'datetime-local') {
                e.target.showPicker();
              }
            }}
          />
        </div>
      )}
      {/* Error message display */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};