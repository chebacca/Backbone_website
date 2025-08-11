/**
 * Application Mode Types
 * Defines the two operational modes for the Dashboard application
 */

export type ApplicationMode = 'standalone' | 'shared_network';

export interface ApplicationModeConfig {
  mode: ApplicationMode;
  description: string;
  features: {
    autoLoadLastProject: boolean;
    requireProjectSelection: boolean;
    showEmptyState: boolean;
    enableProjectMenu: boolean;
    allowNetworkSharing: boolean;
    persistUserSettings: boolean;
  };
}

export interface ApplicationModeSettings {
  currentMode: ApplicationMode;
  allowModeSwitch: boolean;
  lastModeChange: string;
  configuredBy: string;
}

export const APPLICATION_MODE_CONFIGS: Record<ApplicationMode, ApplicationModeConfig> = {
  standalone: {
    mode: 'standalone',
    description: 'Desktop app mode - start empty, open/create projects like Numbers or Keynote',
    features: {
      autoLoadLastProject: false,
      requireProjectSelection: true,
      showEmptyState: true,
      enableProjectMenu: true,
      allowNetworkSharing: false,
      persistUserSettings: true,
    },
  },
  shared_network: {
    mode: 'shared_network',
    description: 'Network collaboration mode - auto-load last project, shared environment',
    features: {
      autoLoadLastProject: true,
      requireProjectSelection: false,
      showEmptyState: false,
      enableProjectMenu: false,
      allowNetworkSharing: true,
      persistUserSettings: true,
    },
  },
};

export const DEFAULT_APPLICATION_MODE: ApplicationMode = 'shared_network';