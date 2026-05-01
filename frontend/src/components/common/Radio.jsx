import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import classNames from 'classnames';

/**
 * Radio component with customizable styling
 */
const Radio = forwardRef(({
  id,
  name,
  value,
  checked = false,
  label,
  disabled = false,
  required = false,
  error = null,
  onChange,
  className = '',
  ...props
}, ref) => {
  // Handle error state
  const hasError = !!error;

  return (
    <div className={classNames(
      'flex items-start',
      disabled && 'opacity-60 cursor-not-allowed',
      className
    )}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={id}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={classNames(
            'h-5 w-5 text-primary-600 border-gray-300 focus:ring-primary-500',
            hasError && 'border-red-300 focus:ring-red-500'
          )}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : undefined}
          {...props}
        />
      </div>
      
      {label && (
        <div className="ml-3 text-sm">
          <label 
            htmlFor={id} 
            className={classNames(
              'font-medium',
              disabled ? 'text-gray-400' : 'text-gray-700',
              hasError && 'text-red-500'
            )}
          >
            {label}
          </label>
          
          {/* Error message */}
          {hasError && (
            <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

Radio.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  label: PropTypes.node,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string
};

export default Radio;