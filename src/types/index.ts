export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileEntry[] | null;
}

export interface SearchResult {
  file: string;
  line: number;
  content: string;
}

export interface FileMeta {
  size: number;
  modified: number;
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exit_code: number;
}

export interface OllamaMessage {
  role: string;
  content: string;
}

export interface Tab {
  id: string; // usually the file path
  title: string;
  path: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

export interface AgentStep {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'error';
  content: string;
  toolName?: string;
  toolArgs?: string;
}
