import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalStyles } from './adminStyles';

/**
 * Reusable Modal Component for Admin Pages
 *
 * @param {Object} props
 * @param {Boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {String} props.title - Modal title
 * @param {ReactNode} props.children - Modal content
 * @param {ReactNode} props.footer - Modal footer
 * @param {String} props.size - Modal size (sm, md, lg, xl, full)
 * @param {String} props.icon - Optional icon to display in the header
 * @param {String} props.iconColor - Color of the icon (primary, success, warning, danger, info)
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  icon,
  iconColor = 'primary'
}) {
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal when pressing Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Determine modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-lg';
    }
  };

  // Get icon color classes
  const getIconColorClasses = () => {
    switch (iconColor) {
      case 'primary': return 'bg-indigo-100 text-indigo-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-amber-100 text-amber-600';
      case 'danger': return 'bg-red-100 text-red-600';
      case 'info': return 'bg-blue-100 text-blue-600';
      default: return 'bg-indigo-100 text-indigo-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={modalStyles.container}>
          <div className={modalStyles.content}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={modalStyles.overlay}
              aria-hidden="true"
              onClick={onClose}
            >
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"></div>
            </motion.div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`${modalStyles.panel} ${getModalWidth()} w-full`}
            >
              {/* Header */}
              <div className={modalStyles.header}>
                <div className="flex items-center">
                  {icon && (
                    <div className={`mr-3 rounded-full p-2 ${getIconColorClasses()}`}>
                      <i className={`fas fa-${icon}`}></i>
                    </div>
                  )}
                  <h3 className={modalStyles.title}>{title}</h3>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Body */}
              <div className={modalStyles.body}>{children}</div>

              {/* Footer */}
              {footer && (
                <div className={modalStyles.footer}>
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
