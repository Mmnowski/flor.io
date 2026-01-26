import React from 'react';
import {
  createMockPlantWithWatering,
  createMockPlantWithDetails,
  createMockRooms,
} from '../../__tests__/factories';
import type { PlantWithWatering, PlantWithDetails, Room } from '~/types/plant.types';

/**
 * PlantCard Props Factory
 */
export function createMockPlantCardProps(
  overrides?: Partial<PlantWithWatering>
): PlantWithWatering {
  return createMockPlantWithWatering(overrides);
}

/**
 * RoomFilter Props Factory
 */
export interface MockRoomFilterProps {
  rooms: Room[];
  activeRoomId: string | null;
  onFilterChange: (roomId: string | null) => void;
  plantCounts?: Record<string, number>;
}

export function createMockRoomFilterProps(
  overrides?: Partial<MockRoomFilterProps>
): MockRoomFilterProps {
  return {
    rooms: createMockRooms(3),
    activeRoomId: null,
    onFilterChange: vi.fn(),
    plantCounts: {
      'room-0': 5,
      'room-1': 3,
      'room-2': 2,
    },
    ...overrides,
  };
}

/**
 * PlantForm Props Factory
 */
export interface MockPlantFormProps {
  plant?: PlantWithDetails;
  rooms: Room[];
  error?: string | null;
  mode: 'create' | 'edit';
}

export function createMockPlantFormProps(
  overrides?: Partial<MockPlantFormProps>
): MockPlantFormProps {
  return {
    plant: undefined,
    rooms: createMockRooms(3),
    error: null,
    mode: 'create',
    ...overrides,
  };
}

/**
 * ImageUpload Props Factory
 */
export interface MockImageUploadProps {
  currentPhotoUrl?: string | null;
  onFileChange?: (file: File | null) => void;
}

export function createMockImageUploadProps(
  overrides?: Partial<MockImageUploadProps>
): MockImageUploadProps {
  return {
    currentPhotoUrl: null,
    onFileChange: vi.fn(),
    ...overrides,
  };
}

/**
 * WateringButton Props Factory
 */
export interface MockWateringButtonProps {
  plantId: string;
  nextWateringDate: Date | null;
  lastWateredDate: Date | null;
}

export function createMockWateringButtonProps(
  overrides?: Partial<MockWateringButtonProps>
): MockWateringButtonProps {
  const now = new Date();
  const nextWatering = new Date(now);
  nextWatering.setDate(nextWatering.getDate() + 3);

  return {
    plantId: 'plant-123',
    nextWateringDate: nextWatering,
    lastWateredDate: now,
    ...overrides,
  };
}

/**
 * PlantInfoSection Props Factory
 */
export interface MockPlantInfoSectionProps {
  title: string;
  content: string | null;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
}

export function createMockPlantInfoSectionProps(
  overrides?: Partial<MockPlantInfoSectionProps>
): MockPlantInfoSectionProps {
  // Import a mock icon - we'll use a simple SVG component
  const MockIcon = () => <svg />;

  return {
    title: 'Light Requirements',
    content: 'Bright indirect light',
    icon: MockIcon,
    defaultOpen: false,
    ...overrides,
  };
}

/**
 * DeletePlantDialog Props Factory
 */
export interface MockDeletePlantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantName: string;
  plantId: string;
}

export function createMockDeletePlantDialogProps(
  overrides?: Partial<MockDeletePlantDialogProps>
): MockDeletePlantDialogProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    plantName: 'Test Plant',
    plantId: 'plant-123',
    ...overrides,
  };
}

/**
 * Navigation Props Factory (if it takes props)
 */
export interface MockNavigationProps {
  isAuthenticated: boolean;
  userEmail?: string;
}

export function createMockNavigationProps(
  overrides?: Partial<MockNavigationProps>
): MockNavigationProps {
  return {
    isAuthenticated: true,
    userEmail: 'test@example.com',
    ...overrides,
  };
}

/**
 * EmptyState Props Factory
 */
export interface MockEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function createMockEmptyStateProps(
  overrides?: Partial<MockEmptyStateProps>
): MockEmptyStateProps {
  const MockIcon = () => <svg />;

  return {
    icon: MockIcon,
    title: 'No items',
    description: 'You haven\'t created anything yet',
    actionLabel: 'Create',
    onAction: vi.fn(),
    ...overrides,
  };
}

/**
 * LoadingSpinner Props Factory
 */
export interface MockLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function createMockLoadingSpinnerProps(
  overrides?: Partial<MockLoadingSpinnerProps>
): MockLoadingSpinnerProps {
  return {
    size: 'md',
    label: 'Loading...',
    ...overrides,
  };
}

/**
 * FormError Props Factory
 */
export interface MockFormErrorProps {
  message?: string | null;
}

export function createMockFormErrorProps(
  overrides?: Partial<MockFormErrorProps>
): MockFormErrorProps {
  return {
    message: 'An error occurred',
    ...overrides,
  };
}

// Note: Import vi from vitest to use mock functions in factories
// This should be imported at the top when using these factories
import { vi } from 'vitest';
