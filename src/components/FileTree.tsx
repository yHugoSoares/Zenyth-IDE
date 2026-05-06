import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { listFiles, readFile } from '../lib/tools';
import { FileEntry } from '../types';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';

export default function FileTree() {
  const { workspaceRoot } = useStore();
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    if (workspaceRoot) {
      loadFiles();
    }
  }, [workspaceRoot]);

  const loadFiles = async () => {
    if (!workspaceRoot) return;
    try {
      const entries = await listFiles(workspaceRoot);
      setFiles(entries);
    } catch (e) {
      console.error(e);
    }
  };

  if (!workspaceRoot) {
    return <div style={{ padding: 16, color: 'var(--text-muted)' }}>No workspace open</div>;
  }

  return (
    <div style={{ padding: 8, overflowY: 'auto', height: '100%', fontSize: 13 }}>
      {files.map(f => <FileTreeNode key={f.path} entry={f} depth={0} />)}
    </div>
  );
}

function FileTreeNode({ entry, depth }: { entry: FileEntry; depth: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { openTab, setActiveTab, setOriginalContent, tabs } = useStore();

  const handleOpen = async () => {
    if (entry.is_dir) {
      setIsOpen(!isOpen);
    } else {
      const exists = tabs.find(t => t.id === entry.path);
      if (!exists) {
        try {
          const content = await readFile(entry.path);
          openTab(entry.path);
          setOriginalContent(entry.path, content);
        } catch (e) {
          console.error(e);
        }
      } else {
        setActiveTab(entry.path);
      }
    }
  };

  return (
    <div>
      <div 
        onClick={handleOpen}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '4px 8px',
          paddingLeft: depth * 12 + 8,
          cursor: 'pointer',
          color: 'var(--text)',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {entry.is_dir ? (
          <span style={{ marginRight: 4, display: 'flex', alignItems: 'center' }}>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {isOpen ? <FolderOpen size={14} style={{ marginLeft: 4, color: 'var(--accent-yellow)' }} /> : <Folder size={14} style={{ marginLeft: 4, color: 'var(--accent-yellow)' }} />}
          </span>
        ) : (
          <span style={{ marginLeft: 18, marginRight: 4, display: 'flex', alignItems: 'center' }}>
            <FileText size={14} style={{ color: 'var(--text-muted)' }} />
          </span>
        )}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.name}
        </span>
      </div>
      {isOpen && entry.children && (
        <div>
          {entry.children.map(c => <FileTreeNode key={c.path} entry={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}
