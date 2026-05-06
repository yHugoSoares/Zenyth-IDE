import { invoke } from '@tauri-apps/api/core';
import { FileEntry, SearchResult, FileMeta, CommandOutput } from '../types';

export async function listFiles(root: string): Promise<FileEntry[]> {
  return invoke('list_files', { root });
}

export async function readFile(path: string): Promise<string> {
  return invoke('read_file', { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke('write_file', { path, content });
}

export async function deleteFile(path: string): Promise<void> {
  return invoke('delete_file', { path });
}

export async function renameFile(from: string, to: string): Promise<void> {
  return invoke('rename_file', { from, to });
}

export async function searchFiles(root: string, query: string): Promise<SearchResult[]> {
  return invoke('search_files', { root, query });
}

export async function getFileMeta(path: string): Promise<FileMeta> {
  return invoke('get_file_meta', { path });
}

export async function createDir(path: string): Promise<void> {
  return invoke('create_dir', { path });
}

export async function runCommand(command: string, cwd: string): Promise<CommandOutput> {
  return invoke('run_command', { command, cwd });
}

export async function spawnPty(cols: number, rows: number, cwd: string): Promise<string> {
  return invoke('spawn_pty', { cols, rows, cwd });
}

export async function ptyWrite(id: string, data: string): Promise<void> {
  return invoke('pty_write', { id, data });
}

export async function ptyResize(id: string, cols: number, rows: number): Promise<void> {
  return invoke('pty_resize', { id, cols, rows });
}

export async function ptyKill(id: string): Promise<void> {
  return invoke('pty_kill', { id });
}
