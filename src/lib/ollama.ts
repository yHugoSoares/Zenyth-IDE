import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { OllamaMessage } from '../types';

export async function streamChat(
  messages: OllamaMessage[],
  model: string,
  onToken: (token: string) => void
): Promise<void> {
  let unlisten: UnlistenFn | null = null;
  
  try {
    unlisten = await listen<string>('ollama://token', (event) => {
      onToken(event.payload);
    });
    
    await invoke('ollama_chat', { messages, model });
  } finally {
    if (unlisten) {
      unlisten();
    }
  }
}

export async function listModels(): Promise<string[]> {
  return invoke('ollama_list_models');
}
