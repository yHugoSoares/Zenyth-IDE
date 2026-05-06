import { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { searchFiles, readFile } from '../lib/tools';
import { Search } from 'lucide-react';

export default function CommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, workspaceRoot, openTab, setOriginalContent } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{file: string, line: number, content: string}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, toggleCommandPalette]);

  useEffect(() => {
    if (!query.trim() || !workspaceRoot) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchFiles(workspaceRoot, query).then(setResults).catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, workspaceRoot]);

  if (!commandPaletteOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', paddingTop: '10vh'
    }} onClick={toggleCommandPalette}>
      <div 
        style={{ width: 600, maxHeight: '80vh', backgroundColor: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', marginRight: 12 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search files by content..."
            style={{ flex: 1, border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: 16 }}
          />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {results.map((r, i) => (
            <div 
              key={`${r.file}-${r.line}-${i}`}
              onClick={async () => {
                try {
                  const content = await readFile(r.file);
                  openTab(r.file);
                  setOriginalContent(r.file, content);
                  toggleCommandPalette();
                } catch (e) {
                  console.error(e);
                }
              }}
              style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.file.split('/').pop()} <span style={{ color: 'var(--text-muted)' }}>:{r.line}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.content.trim()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
