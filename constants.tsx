
import React from 'react';

export const INITIAL_RESOURCES = {
  hull: 100,
  shields: 85,
  energy: 90,
  oxygen: 100,
  fuel: 75,
};

export const MOCK_FILES = [
  { name: 'mission_zeta_v1.log', type: 'log', content: 'Entry 001: Wormhole passage successful. Minimal radiation leak detected in sector 9.' },
  { name: 'crew_manifest.db', type: 'config', content: 'Captain Nova, XO Thorne, Med-Bot 402, AI Zeta (Core v4.2).' },
  { name: 'ship_specs.pdf', type: 'report', content: 'AEGIS-7: Class D Dreadnought. Dual Ion Pulse Thrusters. Mk IV Shield Generator.' },
  { name: 'security_overide.cfg', type: 'config', content: 'AUTH_CODE: DELTA-SIGMA-9. Restricted access to kernel level 4.' },
];

export const MOCK_SERVICES = [
  { id: 'comms', name: 'Comm Array', active: true, powerDrain: 2 },
  { id: 'sensors', name: 'Sensor Grid', active: true, powerDrain: 5 },
  { id: 'shields', name: 'Shield Gen', active: true, powerDrain: 10 },
  { id: 'gravity', name: 'Artificial Grav', active: true, powerDrain: 3 },
  { id: 'stealth', name: 'Cloak Module', active: false, powerDrain: 15 },
];

export const LOG_SAMPLES = [
  "Kernel: Booting sequence complete.",
  "NetStack: Handshake established with Sector Relay.",
  "Security: No unauthorized breaches detected.",
  "MemMgr: GC cycle completed in 1.2ms.",
  "Driver: Comms Array v8.4 synchronized.",
  "Fault: Sensor latency spike detected in Sector 7G.",
  "Process: Background analytics thread initialized.",
];

export const FLEET_SAMPLES = [
  { sender: "USS VALIANT", content: "Neutral zone clear. Proceeding to Starbase 12.", priority: "LOW" },
  { sender: "STATION K-7", content: "Trading routes congested near Rigel. Caution advised.", priority: "MED" },
  { sender: "FLEET COMMAND", content: "All vessels: Periodic maintenance required for jump-gates.", priority: "LOW" },
  { sender: "DEEP SPACE 9", content: "Unidentified signal detected in Gamma Quadrant.", priority: "HIGH" },
  { sender: "ECLIPSE", content: "Resources low. Requesting docking at nearest hub.", priority: "MED" },
];

export const SECTORS = [
  "Sol - Terra Orbit",
  "Alpha Centauri - Proxima B",
  "Rigel System - Ice Belt",
  "Nebula-9 - Gas Giant",
  "Orion Arm - Void Space",
  "Vulcan - Forge Core"
];

export const INITIAL_MISSION: any[] = [
  {
    id: 'm1',
    title: 'Alpha Centauri Recon',
    description: 'Gather data on unusual radiation spikes in Sector 7G.',
    status: 'active',
    rewards: '500 Credits',
  }
];

export const THEMES = {
  cyan: {
    primary: 'text-cyan-400',
    border: 'border-cyan-900/50',
    bg: 'bg-cyan-900/10',
    glow: 'shadow-[0_0_10px_rgba(34,211,238,0.5)]',
    accent: 'cyan'
  },
  red: {
    primary: 'text-red-400',
    border: 'border-red-900/50',
    bg: 'bg-red-900/10',
    glow: 'shadow-[0_0_10px_rgba(248,113,113,0.5)]',
    accent: 'red'
  },
  emerald: {
    primary: 'text-emerald-400',
    border: 'border-emerald-900/50',
    bg: 'bg-emerald-900/10',
    glow: 'shadow-[0_0_10px_rgba(52,211,153,0.5)]',
    accent: 'emerald'
  }
};

export const ICONS = {
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Battery: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  Database: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  ),
  Compass: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
  ),
  Terminal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  Folder: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  Share: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
  ),
  Radio: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
  ),
};
