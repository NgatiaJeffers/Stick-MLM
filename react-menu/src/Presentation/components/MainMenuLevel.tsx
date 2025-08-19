import React from 'react';
import { MenuItem } from '@domain/Entities/MenuItem';
import { MenuItemComponent } from './MenuItemComponent';
import clsx from 'clsx';

interface MainMenuLevelProps {
  items: MenuItem[];
  activeItemId: string | null;
  hoveredItemId: string | null;
  onItemClick: (itemId: string) => void;
  onItemHover: (itemId: string | null) => void;
  isInActiveTrail: (itemId: string) => boolean;
}

/**
 * Presentation Component: Main Menu Level (Level 1)
 * Renders the primary navigation level
 */
export const MainMenuLevel: React.FC<MainMenuLevelProps> = ({
  items,
  activeItemId,
  hoveredItemId,
  onItemClick,
  onItemHover,
  isInActiveTrail,
}) => {
  const levelClasses = clsx(
    'sticky-multilayer-menu-level',
    'sticky-multilayer-menu-level--main'
  );

  return (
    <ul 
      className={levelClasses}
      role="menubar"
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          level={1}
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
