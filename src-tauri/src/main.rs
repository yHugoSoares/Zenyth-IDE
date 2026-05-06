#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

mod fs_commands;
mod shell;
mod ollama_proxy;

fn main() {
    tauri::Builder::default()
        .manage(shell::PtyState {
            sessions: Arc::new(Mutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            fs_commands::list_files,
            fs_commands::read_file,
            fs_commands::write_file,
            fs_commands::delete_file,
            fs_commands::rename_file,
            fs_commands::search_files,
            fs_commands::get_file_meta,
            fs_commands::create_dir,
            shell::run_command,
            shell::spawn_pty,
            shell::pty_write,
            shell::pty_resize,
            shell::pty_kill,
            ollama_proxy::ollama_chat,
            ollama_proxy::ollama_list_models,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Zenyth");
}
