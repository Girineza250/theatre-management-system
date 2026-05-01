import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import classNames from 'classnames';

/**
 * Input component with various styles and validation states
 */
const Input = forwardRef(({
  type = 'text',
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  readOnly = false,
  required = false,
  error = null,
  touched = false,
  helperText = null,
  size = 'md',
  startIcon = null,
  endIcon = null,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}, ref) => {
  // Define input sizes
  const sizeClasses = {
    sm: 'py-1.5 text-sm',
    md: 'py-2 text-sm',
    lg: 'py-2.5 text-base'
  };

  // Handle error state
  const hasError = error && touched;

  // Input element classes
  const inputClasses = classNames(
    'block w-full rounded-md',
    'border shadow-sm',
    'focus:outline-none focus:ring-1',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      'pr-10': endIcon && !startIcon,
      'pl-10': startIcon && !endIcon,
      'pl-10 pr-10': startIcon && endIcon,
      'border-red-300 focus:ring-red-500 focus:border-red-500': hasError,
      'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !hasError
    },
    sizeClasses[size],
    inputClassName
  );

  return (
    <div className={classNames('relative mb-4', containerClassName)}>
      {label && (
        <label
          htmlFor={id || name}
          className={classNames(
            'block text-sm font-medium text-gray-700 mb-1',
            { 'text-red-500': hasError },
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          className={inputClasses}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          {...props}
        />

        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>

      {/* Error or helper text */}
      {hasError ? (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  helperText: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string
};

export default Input;