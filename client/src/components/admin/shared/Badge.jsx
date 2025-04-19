import React from 'react';
import { badgeStyles } from './adminStyles';

/**
 * Reusable Badge Component for Admin Pages
 * 
 * @param {Object} props
 * @param {String} props.type - Badge type (active, inactive, pending, completed, cancelled, admin, user, provider)
 * @param {String} props.text - Badge text
 * @param {String} props.icon - Optional icon name (FontAwesome)
 * @param {String} props.className - Additional CSS classes
 */
function Badge({ type, text, icon, className = '' }) {
  const getBadgeClasses = () => {
    switch (type) {
      case 'active':
        return badgeStyles.active;
      case 'inactive':
        return badgeStyles.inactive;
      case 'pending':
        return badgeStyles.pending;
      case 'completed':
        return badgeStyles.completed;
      case 'cancelled':
        return badgeStyles.cancelled;
      case 'admin':
        return badgeStyles.admin;
      case 'user':
        return badgeStyles.user;
      case 'provider':
        return badgeStyles.provider;
      default:
        return badgeStyles.active;
    }
  };

  return (
    <span className={`${badgeStyles.base} ${getBadgeClasses()} ${className}`}>
      {icon && <i className={`fas fa-${icon} mr-1 text-xs`}></i>}
      {text}
    </span>
  );
}

export default Badge;
