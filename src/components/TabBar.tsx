import { useStore } from '../lib/store';
import { X, Circle } from 'lucide-react';

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useStore();

  return (
    <div style={{ display: 'flex', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: activeTabId === tab.id ? 'var(--bg)' : 'transparent',
            borderRight: '1px solid var(--border)',
            borderTop: `2px solid ${activeTabId === tab.id ? 'var(--accent)' : 'transparent'}`,
            cursor: 'pointer',
            minWidth: 120,
            maxWidth: 200,
            color: activeTabId === tab.id ? 'var(--text)' : 'var(--text-muted)'
          }}
        >
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13 }}>
            {tab.title}
          </span>
          <div 
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            style={{ marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 4 }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {tab.isDirty ? <Circle size={10} fill="currentColor" /> : <X size={14} />}
          </div>
        </div>
      ))}
    </div>
  );
}
