use crate::utils;
use crate::entries::list::handlers::*;

use super::*;
use juniper::FieldResult;
use utils::generate_short_id;

pub fn item(id: juniper::ID) -> FieldResult<Item> {
    Ok(Item::new_from_entry(item_entry(id)?))
}

pub fn item_entry(id: juniper::ID) -> FieldResult<ItemEntry> {
    Ok(utils::try_get_and_convert(item_entry_hash(id)?)?)
}

pub fn item_entry_hash(id: juniper::ID) -> FieldResult<EntryHash> {
    let (list_id, item_id) = utils::id_parts(id);

    let list_entry_hash = list_entry_hash(list_id)?;
    let item_links = get_links(list_entry_hash.into(), Some(utils::link_tag("item")?))?
    .into_inner()
    .into_iter();

    for item_link in item_links {
        let item_entry: ItemEntry = utils::try_get_and_convert(item_link.target.clone())?;
        let (_, link_item_id) = utils::id_parts(item_entry.id);
        if link_item_id == item_id {
            return Ok(item_link.target);
        }
    }

    Err(utils::err("Item not found.").into())
}

pub fn items(list_id: juniper::ID) -> FieldResult<ItemConnection> {

    let list_entry_hash = list_entry_hash(list_id)?;
    let item_links = get_links(list_entry_hash.into(), None)?
    .into_inner()
    .into_iter();

    let mut edges = Vec::with_capacity(item_links.len());

    for item_link in item_links {
        let item_entry: ItemEntry = utils::try_get_and_convert(item_link.target)?;
        let item = Item::new_from_entry(item_entry);
        let edge = ItemEdge::new(item);
        edges.push(edge);
    }

    let items = ItemConnection {
        edges,
        page_info: PageInfo::new(),
    };

    Ok(items)
}

pub fn item_create(input: CreateItemInput) -> FieldResult<CrudItemPayload> {
    let id: juniper::ID = generate_short_id().into();

    let item_entry = ItemEntry::new(
        input.list_id.clone(),
        id.clone(),
        input.description.clone(),
        false
    );
    let item_entry_hash = hash_entry(&item_entry)?;
    create_entry(&item_entry)?;

    // Create link: List -> Entry
    let list_entry_hash = list_entry_hash(input.list_id)?;
    create_link(
        list_entry_hash.clone(),
        item_entry_hash.clone(),
        utils::link_tag("item")?,
    )?;

    let item = Item::new_from_entry(item_entry);

    Ok(CrudItemPayload::new(item))
}

pub fn item_update(input: UpdateItemInput) -> FieldResult<CrudItemPayload> {

    let (list_id, item_id) = utils::id_parts(input.id.clone());
    let list_entry_hash = list_entry_hash(list_id.clone())?;
    let item_entry_hash = item_entry_hash(input.id.clone())?;

    // Delete link: List -> Entry
    let links_iter = get_links(list_entry_hash.clone().into(), None)?
    .into_inner()
    .into_iter();
    for item_link in links_iter {
        if item_link.target == item_entry_hash {
            delete_link(item_link.create_link_hash)?;
        }
    }

    // Create updated Entry
    let element = get(item_entry_hash, GetOptions::default())?.unwrap();
    let item_entry_header_hash = element.signed_header().as_hash().clone();
    let item_entry_new = ItemEntry::new(
        list_id,
        item_id,
        input.description,
        input.done
    );
    update_entry(item_entry_header_hash, item_entry_new.clone())?;

    // Create link: List -> Entry
    let item_entry_hash_new = hash_entry(&item_entry_new)?;
    create_link(
        list_entry_hash,
        item_entry_hash_new,
        utils::link_tag("item")?,
    )?;

    let item = Item::new_from_entry(item_entry_new);
    Ok(CrudItemPayload::new(item))
}

pub fn item_toggle_done(input: ToggleItemDoneInput) -> FieldResult<CrudItemPayload> {

    let old_item = item(input.id.clone())?;

    let item_input = UpdateItemInput {
        id: input.id,
        description: old_item.description,
        done: !old_item.done,
    };

    item_update(item_input)
}

pub fn item_delete(input: DeleteItemInput) -> FieldResult<CrudItemPayload> {

    let old_item = item(input.id.clone())?;

    let (list_id, _) = utils::id_parts(input.id.clone());

    let list_entry_hash = list_entry_hash(list_id)?;
    let item_entry_hash = item_entry_hash(input.id)?;

    // Delete link: List -> Entry
    let links_iter = get_links(list_entry_hash.clone().into(), None)?
    .into_inner()
    .into_iter();
    for item_link in links_iter {
        if item_link.target == item_entry_hash {
            delete_link(item_link.create_link_hash)?;
        }
    }

    // Delete Entry
    let element = get(item_entry_hash, GetOptions::default())?.unwrap();
    let item_entry_header_hash = element.signed_header().as_hash().clone();
    delete_entry(item_entry_header_hash)?;

    Ok(CrudItemPayload::new(old_item))
}
