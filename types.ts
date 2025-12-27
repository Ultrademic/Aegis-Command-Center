
export enum ShipSystemStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED = 'DEGRADED',
  CRITICAL = 'CRITICAL',
  OFFLINE = 'OFFLINE'
}

export type UITheme = 'cyan' | 'red' | 'emerald';
export type ViewMode = 'SHIP' | 'SYSTEM';

export interface FleetMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  priority: 'LOW' | 'MED' | 'HIGH';
}

export interface ShipResources {
  hull: number;
  shields: number;
  energy: number;
  oxygen: number;
  fuel: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  rewards: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ShipFile {
  name: string;
  content: string;
  type: 'log' | 'report' | 'config';
}

export interface SystemService {
  id: string;
  name: string;
  active: boolean;
  powerDrain: number;
}

export interface GameState {
  captainName: string;
  shipName: string;
  resources: ShipResources;
  missions: Mission[];
  messages: ChatMessage[];
  currentSector: string;
  credits: number;
  theme: UITheme;
  systemLogs: string[];
  services: SystemService[];
  files: ShipFile[];
  activeModule: 'NAV' | 'FILE' | 'SEC' | 'KERN';
  viewMode: ViewMode;
  fleetMessages: FleetMessage[];
}
