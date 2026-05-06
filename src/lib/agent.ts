import { useStore } from './store';
import { streamChat } from './ollama';
import { OllamaMessage } from '../types';

export async function runAgent(prompt: string, model: string = "llama3") {
  const store = useStore.getState();
  store.setAgentRunning(true);
  
  const stepId = Math.random().toString(36).substring(7);
  store.addAgentStep({
    id: stepId,
    role: 'user',
    content: prompt,
  });

  const assistantStepId = Math.random().toString(36).substring(7);
  store.addAgentStep({
    id: assistantStepId,
    role: 'assistant',
    content: '',
  });

  try {
    const messages: OllamaMessage[] = store.agentMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));
      
    // Add the new prompt if it wasn't already in the store array
    if (!messages.find(m => m.content === prompt)) {
      messages.push({ role: 'user', content: prompt });
    }

    // Insert system prompt
    messages.unshift({
      role: 'system',
      content: `You are an AI coding assistant. You have access to the file system.
If the user asks to perform file operations, format your response to indicate the tool call.
(For now, this is a basic stub of the agentic loop that streams responses).`
    });

    let fullContent = '';
    await streamChat(messages, model, (token) => {
      fullContent += token;
      useStore.getState().updateAgentStep(assistantStepId, { content: fullContent });
    });
  } catch (error: any) {
    store.addAgentStep({
      id: Math.random().toString(36).substring(7),
      role: 'error',
      content: error.toString(),
    });
  } finally {
    useStore.getState().setAgentRunning(false);
  }
}
