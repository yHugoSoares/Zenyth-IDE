use serde::{Deserialize, Serialize};
use reqwest::Client;
use serde_json::json;
use tauri::{Emitter, Window};
use futures_util::StreamExt;

#[derive(Serialize, Deserialize)]
pub struct OllamaMessage {
    pub role: String,
    pub content: String,
}

#[derive(Deserialize)]
struct OllamaResponse {
    message: Option<OllamaMessage>,
    done: bool,
}

#[derive(Deserialize)]
struct OllamaModelsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Deserialize)]
struct OllamaModel {
    name: String,
}

#[tauri::command]
pub async fn ollama_chat(
    messages: Vec<OllamaMessage>,
    model: String,
    window: Window,
) -> Result<(), String> {
    let client = Client::new();
    
    let res = client.post("http://localhost:11434/api/chat")
        .json(&json!({
            "model": model,
            "messages": messages,
            "stream": true
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let mut stream = res.bytes_stream();

    while let Some(chunk) = stream.next().await {
        match chunk {
            Ok(bytes) => {
                let text = String::from_utf8_lossy(&bytes);
                // Ollama can return multiple JSON objects separated by newlines
                for line in text.lines() {
                    if line.trim().is_empty() {
                        continue;
                    }
                    if let Ok(parsed) = serde_json::from_str::<OllamaResponse>(line) {
                        if let Some(msg) = parsed.message {
                            let _ = window.emit("ollama://token", msg.content);
                        }
                    }
                }
            }
            Err(e) => {
                return Err(e.to_string());
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn ollama_list_models() -> Result<Vec<String>, String> {
    let client = Client::new();
    let res: OllamaModelsResponse = client.get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;
        
    Ok(res.models.into_iter().map(|m| m.name).collect())
}
