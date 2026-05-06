import { useEffect } from 'react';
import { useStore } from './lib/store';
import FileTree from './components/FileTree';
import TabBar from './components/TabBar';
import Editor from './components/Editor';
import AgentPanel from './components/AgentPanel';
import Terminal from './components/Terminal';
import CommandPalette from './components/CommandPalette';
import Settings from './components/Settings';
import { Bot, TerminalSquare, Search, Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const { 
    workspaceRoot, setWorkspaceRoot, 
    toggleAgentPanel, toggleTerminal, toggleCommandPalette, toggleSettings 
  } = useStore();

  useEffect(() => {
    // For now, set workspace to current directory or prompt user
    setWorkspaceRoot('/Users/hugo/Documents/Personal/Zenyth-IDE');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', overflow: 'hidden' }}>
      {/* Title / Toolbar */}
      <div style={{ height: 40, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 16px', backgroundColor: 'var(--surface)', WebkitAppRegion: 'drag' } as any}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
          Zenyth IDE {workspaceRoot && `- ${workspaceRoot.split('/').pop()}`}
        </div>
        <div style={{ display: 'flex', gap: 16, WebkitAppRegion: 'no-drag' } as any}>
          <button onClick={toggleCommandPalette}><Search size={16} /></button>
          <button onClick={toggleTerminal}><TerminalSquare size={16} /></button>
          <button onClick={toggleAgentPanel}><Bot size={16} /></button>
          <button onClick={toggleSettings}><SettingsIcon size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 250, borderRight: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>EXPLORER</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <FileTree />
          </div>
        </div>

        {/* Main Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TabBar />
          <Editor />
          <Terminal />
        </div>

        {/* Right Sidebar */}
        <AgentPanel />
      </div>

      <CommandPalette />
      <Settings />
    </div>
  );
}
