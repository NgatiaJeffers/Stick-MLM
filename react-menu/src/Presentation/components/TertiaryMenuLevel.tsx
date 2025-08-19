import React from 'react';
import { MenuItem } from '@domain/Entities/MenuItem';
import { MenuItemComponent } from './MenuItemComponent';
import clsx from 'clsx';

interface TertiaryMenuLevelProps {
  items: MenuItem[];
  activeItemId: string | null;
  hoveredItemId: string | null;
  onItemClick: (itemId: string) => void;
  onItemHover: (itemId: string | null) => void;
  isInActiveTrail: (itemId: string) => boolean;
}

/**
 * Presentation Component: Tertiary Menu Level (Level 3)
 * Renders the tertiary navigation level
 */
export const TertiaryMenuLevel: React.FC<TertiaryMenuLevelProps> = ({
  items,
  activeItemId,
  hoveredItemId,
  onItemClick,
  onItemHover,
  isInActiveTrail,
}) => {
  const levelClasses = clsx(
    'sticky-multilayer-menu-level',
    'sticky-multilayer-menu-level--tertiary'
  );

  return (
    <ul 
      className={levelClasses}
      role="menu"
      aria-label="Tertiary navigation"
    >
      {items.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          level={3}
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
