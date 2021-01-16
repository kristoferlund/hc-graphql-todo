//! Utility functions

use hdk3::prelude::*;

pub fn error<T>(reason: &str) -> ExternResult<T> {
    Err(err(reason))
}

pub fn err(reason: &str) -> HdkError {
    HdkError::Wasm(WasmError::Zome(String::from(reason)))
}

pub fn try_get_and_convert<T: TryFrom<SerializedBytes>>(entry_hash: EntryHash) -> ExternResult<T> {
    match get(entry_hash.clone(), GetOptions::default())? {
        Some(element) => try_from_element(element),
        None => error("Entry not found"),
    }
}

pub fn try_from_element<T: TryFrom<SerializedBytes>>(element: Element) -> ExternResult<T> {
    match element.entry() {
        element::ElementEntry::Present(entry) => try_from_entry::<T>(entry.clone()),
        _ => error("Could not convert element"),
    }
}

pub fn try_from_entry<T: TryFrom<SerializedBytes>>(entry: Entry) -> ExternResult<T> {
    match entry {
        Entry::App(content) => match T::try_from(content.into_sb()) {
            Ok(e) => Ok(e),
            Err(_) => error("Could not convert entry"),
        },
        _ => error("Could not convert entry"),
    }
}
#[derive(Serialize, Deserialize, SerializedBytes)]
struct StringLinkTag(String);
pub fn link_tag(tag: &str) -> ExternResult<LinkTag> {
    let sb: SerializedBytes = StringLinkTag(tag.into()).try_into()?;
    Ok(LinkTag(sb.bytes().clone()))
}

pub fn generate_short_id() -> String {
    let bytes = random_bytes(6).unwrap();

    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
    abcdefghijklmnopqrstuvwxyz\
    0123456789";
    const CHARSET_LEN: f32 = CHARSET.len() as f32;

    (0..bytes.len())
        .map(|i| {
            let ci = bytes[i] as f32 / 255.0 * CHARSET_LEN;
            CHARSET[ci as usize] as char
        })
        .collect()
}

pub fn id_parts(id: juniper::ID) -> (juniper::ID, juniper::ID) {
    let id_string = id.to_string();
    // 0 = list id
    // 1 = item id
    let id_parts: Vec<&str> = id_string.split_terminator('.').collect();
    (String::from(id_parts[0]).into(), String::from(id_parts[1]).into())
}
