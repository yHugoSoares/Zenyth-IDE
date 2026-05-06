import { useEffect } from 'react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { useStore } from '../lib/store';
import { writeFile } from '../lib/tools';

export default function Editor() {
  const { tabs, activeTabId, updateContent } = useStore();
  const monaco = useMonaco();
  
  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('zenyth-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#141414',
          'editor.lineHighlightBackground': '#1c1c1c',
        }
      });
      monaco.editor.setTheme('zenyth-dark');
    }
  }, [monaco]);

  if (!activeTab) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
        Open a file to start editing
      </div>
    );
  }

  const handleSave = async (content: string) => {
    if (activeTab) {
      await writeFile(activeTab.path, content);
      useStore.getState().setOriginalContent(activeTab.id, content);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', flex: 1 }}>
      <MonacoEditor
        path={activeTab.path}
        value={activeTab.content}
        language={getLanguageFromPath(activeTab.path)}
        theme="zenyth-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          wordWrap: 'on',
          scrollBeyondLastLine: false,
        }}
        onChange={(value) => {
          if (value !== undefined) {
            updateContent(activeTab.id, value);
          }
        }}
        onMount={(editor) => {
          editor.addCommand(monaco!.KeyMod.CtrlCmd | monaco!.KeyCode.KeyS, () => {
            handleSave(editor.getValue());
          });
        }}
      />
    </div>
  );
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts': case 'tsx': return 'typescript';
    case 'js': case 'jsx': return 'javascript';
    case 'json': return 'json';
    case 'css': return 'css';
    case 'html': return 'html';
    case 'rs': return 'rust';
    case 'md': return 'markdown';
    default: return 'plaintext';
  }
}
