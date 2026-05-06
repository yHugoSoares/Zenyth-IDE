use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tokio::fs as tokio_fs;
use walkdir::WalkDir;
use grep_regex::RegexMatcher;
use grep_searcher::Searcher;
use grep_searcher::sinks::UTF8;

#[derive(Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    pub file: String,
    pub line: u32,
    pub content: String,
}

#[derive(Serialize, Deserialize)]
pub struct FileMeta {
    pub size: u64,
    pub modified: u64,
}

#[tauri::command]
pub async fn list_files(root: String) -> Result<Vec<FileEntry>, String> {
    fn build_tree(dir: &Path) -> Result<Vec<FileEntry>, String> {
        let mut entries = Vec::new();
        let read_dir = fs::read_dir(dir).map_err(|e| e.to_string())?;

        for entry in read_dir {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let file_name = entry.file_name().to_string_lossy().to_string();

            if file_name == "node_modules" || file_name == ".git" || file_name == "target" {
                continue;
            }

            let is_dir = entry.file_type().map_err(|e| e.to_string())?.is_dir();
            let children = if is_dir {
                Some(build_tree(&path)?)
            } else {
                None
            };

            entries.push(FileEntry {
                name: file_name,
                path: path.to_string_lossy().to_string(),
                is_dir,
                children,
            });
        }

        // Sort: directories first, then files alphabetically
        entries.sort_by(|a, b| {
            b.is_dir.cmp(&a.is_dir).then_with(|| a.name.cmp(&b.name))
        });

        Ok(entries)
    }

    build_tree(Path::new(&root))
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    tokio_fs::read_to_string(&path).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        tokio_fs::create_dir_all(parent).await.map_err(|e| e.to_string())?;
    }
    tokio_fs::write(&path, content).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        tokio_fs::remove_dir(p).await.map_err(|e| e.to_string())
    } else {
        tokio_fs::remove_file(p).await.map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn rename_file(from: String, to: String) -> Result<(), String> {
    tokio_fs::rename(from, to).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_files(root: String, query: String) -> Result<Vec<SearchResult>, String> {
    // We use tokio::task::spawn_blocking because walkdir and grep are sync
    tokio::task::spawn_blocking(move || {
        let mut results = Vec::new();
        let matcher = RegexMatcher::new(&query).map_err(|e| e.to_string())?;
        
        for result in WalkDir::new(&root).into_iter().filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            name != "node_modules" && name != ".git" && name != "target"
        }) {
            let entry = match result {
                Ok(e) => e,
                Err(_) => continue,
            };
            if !entry.file_type().is_file() {
                continue;
            }
            let path = entry.path();
            let mut searcher = Searcher::new();
            let path_str = path.to_string_lossy().to_string();
            
            let _ = searcher.search_path(
                &matcher,
                path,
                UTF8(|line_num, line| {
                    results.push(SearchResult {
                        file: path_str.clone(),
                        line: line_num as u32,
                        content: line.to_string(),
                    });
                    Ok(true)
                }),
            );
        }
        Ok(results)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn get_file_meta(path: String) -> Result<FileMeta, String> {
    let meta = tokio_fs::metadata(&path).await.map_err(|e| e.to_string())?;
    let modified = meta.modified()
        .map_err(|e| e.to_string())?
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();
    Ok(FileMeta {
        size: meta.len(),
        modified,
    })
}

#[tauri::command]
pub async fn create_dir(path: String) -> Result<(), String> {
    tokio_fs::create_dir_all(&path).await.map_err(|e| e.to_string())
}
