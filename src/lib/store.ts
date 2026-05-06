import { create } from 'zustand';
import { Tab, AgentStep } from '../types';

interface ZenythStore {
  // Workspace
  workspaceRoot: string | null;
  setWorkspaceRoot: (path: string) => void;

  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (path: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  markDirty: (id: string, dirty: boolean) => void;
  updateContent: (id: string, content: string) => void;
  setOriginalContent: (id: string, content: string) => void;

  // UI state
  agentPanelOpen: boolean;
  terminalOpen: boolean;
  commandPaletteOpen: boolean;
  settingsOpen: boolean;
  toggleAgentPanel: () => void;
  toggleTerminal: () => void;
  toggleCommandPalette: () => void;
  toggleSettings: () => void;

  // Agent
  agentMessages: AgentStep[];
  agentRunning: boolean;
  addAgentStep: (step: AgentStep) => void;
  updateAgentStep: (id: string, partial: Partial<AgentStep>) => void;
  setAgentRunning: (running: boolean) => void;
  clearAgent: () => void;
}

export const useStore = create<ZenythStore>((set, get) => ({
  workspaceRoot: null,
  setWorkspaceRoot: (path) => set({ workspaceRoot: path }),

  tabs: [],
  activeTabId: null,
  openTab: (path) => {
    const { tabs } = get();
    const existing = tabs.find(t => t.id === path);
    if (existing) {
      set({ activeTabId: path });
    } else {
      const name = path.split('/').pop() || path;
      const newTab: Tab = {
        id: path,
        title: name,
        path,
        content: '',
        originalContent: '',
        isDirty: false,
      };
      set({ tabs: [...tabs, newTab], activeTabId: path });
    }
  },
  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.filter(t => t.id !== id);
    let newActive = activeTabId;
    if (activeTabId === id) {
      newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
    }
    set({ tabs: newTabs, activeTabId: newActive });
  },
  setActiveTab: (id) => set({ activeTabId: id }),
  markDirty: (id, dirty) => set({
    tabs: get().tabs.map(t => t.id === id ? { ...t, isDirty: dirty } : t)
  }),
  updateContent: (id, content) => set({
    tabs: get().tabs.map(t => t.id === id ? { ...t, content, isDirty: content !== t.originalContent } : t)
  }),
  setOriginalContent: (id, content) => set({
    tabs: get().tabs.map(t => t.id === id ? { ...t, originalContent: content, content, isDirty: false } : t)
  }),

  agentPanelOpen: false,
  terminalOpen: false,
  commandPaletteOpen: false,
  settingsOpen: false,
  toggleAgentPanel: () => set(state => ({ agentPanelOpen: !state.agentPanelOpen })),
  toggleTerminal: () => set(state => ({ terminalOpen: !state.terminalOpen })),
  toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  toggleSettings: () => set(state => ({ settingsOpen: !state.settingsOpen })),

  agentMessages: [],
  agentRunning: false,
  addAgentStep: (step) => set(state => ({ agentMessages: [...state.agentMessages, step] })),
  updateAgentStep: (id, partial) => set(state => ({
    agentMessages: state.agentMessages.map(msg => msg.id === id ? { ...msg, ...partial } : msg)
  })),
  setAgentRunning: (running) => set({ agentRunning: running }),
  clearAgent: () => set({ agentMessages: [] }),
}));
