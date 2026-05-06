import { useState } from 'react';
import { useStore } from '../lib/store';
import { runAgent } from '../lib/agent';
import { Send, Bot, User, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AgentPanel() {
  const { agentPanelOpen, toggleAgentPanel, agentMessages, agentRunning } = useStore();
  const [prompt, setPrompt] = useState('');

  if (!agentPanelOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || agentRunning) return;
    runAgent(prompt);
    setPrompt('');
  };

  return (
    <div style={{ width: 350, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>AI Agent</h3>
        <button onClick={toggleAgentPanel}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {agentMessages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ 
              width: 28, height: 28, borderRadius: 14, 
              backgroundColor: msg.role === 'user' ? 'var(--surface-3)' : 'var(--agent-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div style={{ 
              backgroundColor: msg.role === 'user' ? 'var(--surface-2)' : 'var(--agent-bg)',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: msg.role === 'user' ? 'var(--border)' : 'var(--agent-purple)',
              maxWidth: '85%',
              wordBreak: 'break-word',
              fontSize: 13,
              lineHeight: 1.5
            }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {agentRunning && <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>Agent is thinking...</div>}
      </div>

      <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask the agent..."
            style={{ flex: 1 }}
            disabled={agentRunning}
          />
          <button 
            type="submit" 
            disabled={agentRunning}
            style={{ 
              backgroundColor: 'var(--accent)', 
              color: '#fff', 
              width: 32, 
              height: 32, 
              borderRadius: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: agentRunning ? 0.5 : 1
            }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
