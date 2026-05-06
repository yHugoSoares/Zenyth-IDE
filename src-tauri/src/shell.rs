use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::process::Command as TokioCommand;
use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use tauri::{AppHandle, Emitter, State};
use std::io::{Read, Write};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct CommandOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

pub struct PtySession {
    pub master: Box<dyn portable_pty::MasterPty + Send>,
    pub writer: Box<dyn std::io::Write + Send>,
}

pub struct PtyState {
    pub sessions: Arc<Mutex<HashMap<String, PtySession>>>,
}

#[tauri::command]
pub async fn run_command(command: String, cwd: String) -> Result<CommandOutput, String> {
    let output = TokioCommand::new("sh")
        .arg("-c")
        .arg(command)
        .current_dir(cwd)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    Ok(CommandOutput {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}

#[tauri::command]
pub async fn spawn_pty(
    cols: u16,
    rows: u16,
    cwd: String,
    app: AppHandle,
    state: State<'_, PtyState>,
) -> Result<String, String> {
    let pty_system = NativePtySystem::default();
    
    let pair = pty_system.openpty(PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    }).map_err(|e| e.to_string())?;

    let id = Uuid::new_v4().to_string();

    #[cfg(target_os = "windows")]
    let mut cmd = CommandBuilder::new("cmd.exe");
    #[cfg(not(target_os = "windows"))]
    let mut cmd = CommandBuilder::new(std::env::var("SHELL").unwrap_or_else(|_| "bash".to_string()));

    cmd.cwd(&cwd);

    let _child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;

    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    
    let id_clone = id.clone();
    
    // Spawn a thread to read from PTY
    std::thread::spawn(move || {
        let mut buf = [0u8; 1024];
        while let Ok(n) = reader.read(&mut buf) {
            if n == 0 {
                break;
            }
            let data = String::from_utf8_lossy(&buf[..n]).to_string();
            let event_name = format!("pty://output/{}", id_clone);
            let _ = app.emit(&event_name, data);
        }
    });

    state.sessions.lock().unwrap().insert(id.clone(), PtySession {
        master: pair.master,
        writer,
    });

    Ok(id)
}

#[tauri::command]
pub async fn pty_write(id: String, data: String, state: State<'_, PtyState>) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();
    if let Some(session) = sessions.get_mut(&id) {
        let _ = session.writer.write_all(data.as_bytes());
    }
    Ok(())
}

#[tauri::command]
pub async fn pty_resize(id: String, cols: u16, rows: u16, state: State<'_, PtyState>) -> Result<(), String> {
    let sessions = state.sessions.lock().unwrap();
    if let Some(session) = sessions.get(&id) {
        let _ = session.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        });
    }
    Ok(())
}

#[tauri::command]
pub async fn pty_kill(id: String, state: State<'_, PtyState>) -> Result<(), String> {
    let mut sessions = state.sessions.lock().unwrap();
    sessions.remove(&id);
    Ok(())
}
