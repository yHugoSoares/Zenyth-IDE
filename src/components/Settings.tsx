import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useStore } from '../lib/store';
import { readFile, writeFile, runCommand } from '../lib/tools';
import { X, Save } from 'lucide-react';

export default function Settings() {
  const { settingsOpen, toggleSettings } = useStore();
  const [content, setContent] = useState('{\n  "theme": "dark",\n  "model": "llama3"\n}');
  const [path, setPath] = useState('');

  useEffect(() => {
    if (settingsOpen) {
      // Find home directory
      runCommand('echo $HOME', '/').then(out => {
        const p = `${out.stdout.trim()}/.zenyth/settings.json`;
        setPath(p);
        readFile(p).then(setContent).catch(() => {
          // Defaults if not exists
          const defaultSettings = '{\n  "theme": "dark",\n  "model": "llama3"\n}';
          setContent(defaultSettings);
        });
      });
    }
  }, [settingsOpen]);

  const handleSave = async () => {
    if (path) {
      await writeFile(path, content);
      toggleSettings();
    }
  };

  if (!settingsOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }} onClick={toggleSettings}>
      <div 
        style={{ width: 800, height: 600, backgroundColor: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 14 }}>Settings</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'var(--accent)', color: '#fff', padding: '4px 12px', borderRadius: 4 }}>
              <Save size={14} /> Save
            </button>
            <button onClick={toggleSettings}><X size={16} /></button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <MonacoEditor
            language="json"
            theme="zenyth-dark"
            value={content}
            onChange={(val) => setContent(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 13 }}
          />
        </div>
      </div>
    </div>
  );
}
