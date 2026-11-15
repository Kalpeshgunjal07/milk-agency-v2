use std::fs;
use std::path::Path;

use keyring::Entry;
use rand::{rngs::OsRng, RngCore};

pub fn key_storage_mode() -> String {
    if Entry::new("milk-agency-v2", "db_key").is_ok() {
        "system-keychain".to_string()
    } else {
        "app-data-fallback".to_string()
    }
}

pub fn load_or_create_key(app_data_dir: &Path) -> Result<String, String> {
    if let Ok(key_entry) = Entry::new("milk-agency-v2", "db_key") {
        if let Ok(existing_key) = key_entry.get_password() {
            let cleaned = existing_key.trim();
            if !cleaned.is_empty() {
                return Ok(cleaned.to_string());
            }
        }

        let generated_key = generate_key();
        if key_entry.set_password(&generated_key).is_ok() {
            return Ok(generated_key);
        }
    }

    let key_path = app_data_dir.join("db_key.bin");
    if key_path.exists() {
        let key = fs::read_to_string(&key_path).map_err(|err| format!("Failed to read key file: {err}"))?;
        let cleaned = key.trim();
        if !cleaned.is_empty() {
            return Ok(cleaned.to_string());
        }
    }

    let generated_key = generate_key();
    write_key_file(&key_path, &generated_key)?;
    Ok(generated_key)
}

fn generate_key() -> String {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    bytes
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<Vec<_>>()
        .join("")
}

fn write_key_file(key_path: &Path, key: &str) -> Result<(), String> {
    fs::write(key_path, key)
        .map_err(|err| format!("Failed to write secure key file: {err}"))?;

    #[cfg(unix)]
    {
        use std::fs::Permissions;
        use std::os::unix::fs::PermissionsExt;

        let mut perms = fs::metadata(key_path)
            .map_err(|err| format!("Failed to read key permissions: {err}"))?
            .permissions();
        perms.set_mode(0o600);
        fs::set_permissions(key_path, perms)
            .map_err(|err| format!("Failed to restrict secure key file permissions: {err}"))?;
    }

    Ok(())
}
