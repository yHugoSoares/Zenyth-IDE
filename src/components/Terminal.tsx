import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useStore } from '../lib/store';
import { spawnPty, ptyWrite, ptyResize, ptyKill } from '../lib/tools';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import '@xterm/xterm/css/xterm.css';
import { X } from 'lucide-react';

export default function Terminal() {
  const { terminalOpen, toggleTerminal, workspaceRoot } = useStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const ptyIdRef = useRef<string | null>(null);
  const [unlisten, setUnlisten] = useState<UnlistenFn | null>(null);

  useEffect(() => {
    if (!terminalOpen || !terminalRef.current || !workspaceRoot) return;

    const term = new XTerm({
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
      theme: {
        background: '#141414',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        black: '#141414',
        red: '#f47067',
        green: '#4ec994',
        yellow: '#e5c07b',
        blue: '#4f9cf9',
        magenta: '#9d7fea',
        cyan: '#56b6c2',
        white: '#d4d4d4',
      }
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const initPty = async () => {
      try {
        const id = await spawnPty(term.cols, term.rows, workspaceRoot);
        ptyIdRef.current = id;

        const unlistenFn = await listen<string>(`pty://output/${id}`, (e) => {
          term.write(e.payload);
        });
        setUnlisten(() => unlistenFn);

        term.onData((data) => {
          ptyWrite(id, data);
        });

        term.onResize(({ cols, rows }) => {
          ptyResize(id, cols, rows);
        });
      } catch (err) {
        console.error('Failed to spawn PTY', err);
        term.write(`\r\nFailed to start terminal: ${err}\r\n`);
      }
    };

    initPty();

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      if (ptyIdRef.current) {
        ptyKill(ptyIdRef.current);
      }
      if (unlisten) unlisten();
    };
  }, [terminalOpen, workspaceRoot]);

  if (!terminalOpen) return null;

  return (
    <div style={{ height: 250, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>TERMINAL</span>
        <button onClick={toggleTerminal}><X size={14} /></button>
      </div>
      <div ref={terminalRef} style={{ flex: 1, padding: 8, overflow: 'hidden' }} />
    </div>
  );
}
