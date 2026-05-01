import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import classNames from 'classnames';

/**
 * Tab component for switching between different content sections
 */
const Tabs = ({ tabs, defaultTab = 0, onChange, className = '', tabClassName = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = useCallback((index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  }, [onChange]);

  return (
    <div className={classNames('w-full', className)}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={classNames(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                'focus:outline-none transition-colors duration-200',
                {
                  'border-primary-500 text-primary-600': activeTab === index,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== index
                },
                tabClassName
              )}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab.icon && (
                <span className={classNames('mr-2', { 'text-primary-500': activeTab === index })}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.badge && (
                <span className={classNames(
                  'ml-2 py-0.5 px-2 rounded-full text-xs font-medium',
                  activeTab === index ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  /**
   * Array of tab objects
   * {
   *   label: string,      // Tab label
   *   content: node,      // Tab content
   *   icon?: node,        // Optional tab icon
   *   badge?: string/number  // Optional badge content
   * }
   */
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  
  /** Index of the default active tab */
  defaultTab: PropTypes.number,
  
  /** Callback function when tab changes */
  onChange: PropTypes.func,
  
  /** Additional class name for the tabs container */
  className: PropTypes.string,
  
  /** Additional class name for individual tab buttons */
  tabClassName: PropTypes.string
};

export default Tabs;