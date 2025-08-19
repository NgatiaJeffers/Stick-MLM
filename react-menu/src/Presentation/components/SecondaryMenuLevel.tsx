import React from 'react';
import { MenuItem } from '@domain/Entities/MenuItem';
import { MenuItemComponent } from './MenuItemComponent';
import clsx from 'clsx';

interface SecondaryMenuLevelProps {
  items: MenuItem[];
  activeItemId: string | null;
  hoveredItemId: string | null;
  onItemClick: (itemId: string) => void;
  onItemHover: (itemId: string | null) => void;
  isInActiveTrail: (itemId: string) => boolean;
}

/**
 * Presentation Component: Secondary Menu Level (Level 2)
 * Renders the secondary navigation level
 */
export const SecondaryMenuLevel: React.FC<SecondaryMenuLevelProps> = ({
  items,
  activeItemId,
  hoveredItemId,
  onItemClick,
  onItemHover,
  isInActiveTrail,
}) => {
  const levelClasses = clsx(
    'sticky-multilayer-menu-level',
    'sticky-multilayer-menu-level--secondary'
  );

  return (
    <ul 
      className={levelClasses}
      role="menu"
      aria-label="Secondary navigation"
    >
      {items.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          level={2}
          isActive={item.id === activeItemId}
          isInActiveTrail={isInActiveTrail(item.id)}
          isHovered={item.id === hoveredItemId}
          onClick={onItemClick}
          onHover={onItemHover}
        />
      ))}
    </ul>
  );
};
