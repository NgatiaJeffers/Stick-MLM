import React from 'react';
import clsx from 'clsx';
import { MenuItem } from '@domain/Entities/MenuItem';

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  isActive: boolean;
  isInActiveTrail: boolean;
  isHovered: boolean;
  onClick: (itemId: string) => void;
  onHover: (itemId: string | null) => void;
  className?: string;
}

/**
 * Presentation Component: Individual Menu Item
 * Renders a single menu item with proper accessibility and interactions
 */
export const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  level,
  isActive,
  isInActiveTrail,
  isHovered,
  onClick,
  onHover,
  className,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(item.id);
    
    // If it's a real URL (not just #), navigate after state update
    if (item.url && item.url !== '#') {
      setTimeout(() => {
        if (item.target === '_blank') {
          window.open(item.url, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = item.url;
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item.id);
    }
  };

  const handleMouseEnter = () => {
    onHover(item.id);
  };

  const handleMouseLeave = () => {
    onHover(null);
  };

  const handleFocus = () => {
    onHover(item.id);
  };

  const handleBlur = () => {
    // Don't clear hover on blur immediately, let mouse events handle it
  };

  const itemClasses = clsx(
    'sticky-mlm-menu-item',
    `sticky-mlm-menu-item--level-${level}`,
    {
      'sticky-mlm-menu-item--active': isActive,
      'sticky-mlm-menu-item--in-trail': isInActiveTrail,
      'sticky-mlm-menu-item--hovered': isHovered,
      'sticky-mlm-menu-item--has-children': item.hasChildren(),
    },
    item.cssClasses,
    className
  );

  const linkClasses = clsx(
    'sticky-mlm-menu-link',
    `sticky-mlm-menu-link--level-${level}`,
    {
      'sticky-mlm-menu-link--active': isActive,
      'sticky-mlm-menu-link--has-children': item.hasChildren(),
    }
  );

  return (
    <li
      className={itemClasses}
      role="none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={item.url || '#'}
        className={linkClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="menuitem"
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={item.hasChildren() ? (isHovered || isActive) : undefined}
        aria-describedby={item.description ? `${item.id}-desc` : undefined}
        target={item.target}
        tabIndex={0}
      >
        <span className="sticky-mlm-menu-text">
          {item.title}
        </span>
        
        {item.hasChildren() && (
          <span 
            className="sticky-mlm-menu-indicator"
            aria-hidden="true"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              className="sticky-mlm-chevron"
            >
              <path d="M4.7 10c-.2 0-.4-.1-.5-.2-.3-.3-.3-.8 0-1.1L6.9 6 4.2 3.3c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0l3.2 3.2c.3.3.3.8 0 1.1L5.3 9.7c-.2.2-.4.3-.6.3z"/>
            </svg>
          </span>
        )}
      </a>
      
      {item.description && (
        <span 
          id={`${item.id}-desc`}
          className="sticky-mlm-menu-description sr-only"
        >
          {item.description}
        </span>
      )}
    </li>
  );
};
