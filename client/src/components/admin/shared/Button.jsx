import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button Component for Admin Pages
 *
 * @param {Object} props
 * @param {String} props.variant - Button variant (primary, secondary, success, danger, warning, info)
 * @param {String} props.size - Button size (sm, md, lg)
 * @param {Boolean} props.isLoading - Loading state
 * @param {Boolean} props.disabled - Disabled state
 * @param {String} props.icon - Optional icon name (FontAwesome)
 * @param {String} props.iconPosition - Icon position (left, right)
 * @param {String} props.type - Button type (button, submit, reset)
 * @param {String} props.to - Link destination (if button should be a Link)
 * @param {Function} props.onClick - Click handler
 * @param {String} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Button content
 */
function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  to,
  onClick,
  className = '',
  children,
  ...rest
}) {
  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-white hover:bg-opacity-90';
      case 'secondary':
        return 'bg-secondary text-white hover:bg-opacity-90';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'info':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-primary text-white hover:bg-opacity-90';
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1 px-3 text-sm';
      case 'md':
        return 'py-2 px-4 text-base';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  // Combine all classes
  const buttonClasses = `
    ${getVariantClasses()} 
    ${getSizeClasses()} 
    rounded 
    font-medium 
    transition-colors 
    duration-200 
    focus:outline-none 
    focus:ring-2 
    focus:ring-opacity-50 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
    ${className}
  `.trim().replace(/\s+/g, ' ');
  // Render loading spinner
  const renderSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Render icon
  const renderIcon = () => icon && <i className={`fas fa-${icon} ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`}></i>;

  // Render button content
  const renderContent = () => (
    <>
      {isLoading && renderSpinner()}
      {icon && iconPosition === 'left' && !isLoading && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </>
  );

  // If it's a link
  if (to) {
    return (
      <Link
        to={to}
        className={`${buttonClasses} ${disabled ? 'pointer-events-none' : ''} inline-block text-center`}
        {...rest}
      >
        {renderContent()}
      </Link>
    );
  }

  // Regular button
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {renderContent()}
    </button>
  );
}

export default Button;
