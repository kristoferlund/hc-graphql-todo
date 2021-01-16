use crate::utils;

use super::*;
use hdk3::prelude::*;
use juniper::FieldResult;

pub fn list(id: juniper::ID) -> FieldResult<List> {
    Ok(List::new_from_entry(list_entry(id)?))
}

pub fn list_entry(id: juniper::ID)  -> FieldResult<ListEntry> {
    Ok(utils::try_get_and_convert(list_entry_hash(id)?)?)
}

pub fn list_entry_hash(id: juniper::ID) -> FieldResult<EntryHash> {

    let agent_info = agent_info()?;
    let agent_address: AnyDhtHash = agent_info.agent_initial_pubkey.clone().into();

    let list_links = get_links(agent_address.into(), Some(utils::link_tag("list")?))?
        .into_inner()
        .into_iter();

    for list_link in list_links {
        let list_entry: ListEntry = utils::try_get_and_convert(list_link.target.clone())?;
        if list_entry.id == id {
            return Ok(list_link.target);
        }
    }

    Err(utils::err("List not found.").into())
}

pub fn lists() -> FieldResult<ListConnection> {

    // let app_type = AppEntryType::new(
    //     EntryDefIndex::from(0),
    //     ZomeId::from(0),
    //     EntryVisibility::Public,
    //  );
    //  let entry_type = EntryType::App(app_type);
    // let inmail_query_args = ChainQueryFilter::default()
    //    .include_entries(true)
    //    .header_type(HeaderType::Create)
    //    .entry_type(entry_type);
    // let maybe_inmails = query(inmail_query_args)?;
    // for sds in maybe_inmails.0 {
    //     debug!("\n\n\n ELEMENT  {:?} \n\n\n", sds);

    // }

    let agent_info = agent_info()?;
    let agent_address: AnyDhtHash = agent_info.agent_initial_pubkey.clone().into();

    let list_links = get_links(agent_address.into(), Some(utils::link_tag("list")?))?
        .into_inner()
        .into_iter();

    debug!("\n\n\n ************ LIST LENGTH {:?}\n\n\n", list_links.clone().len());

    let mut edges = Vec::with_capacity(list_links.len());

    for list_link in list_links {
        let list_entry: ListEntry = utils::try_get_and_convert(list_link.target)?;
        let list_edge = ListEdge::new(List::new_from_entry(list_entry));
        edges.push(list_edge);
    }

    let lists = ListConnection {
        edges,
        page_info: PageInfo::new(),
    };

    Ok(lists)
}

pub fn list_create(input: CreateListInput) -> FieldResult<CrudListPayload> {

    let id: juniper::ID = utils::generate_short_id().into();

    let list_entry = ListEntry {
        id: id.clone(),
        name: input.name.clone(),
    };
    create_entry(&list_entry)?;

    let list_entry_hash = hash_entry(&list_entry)?;

    let agent_info = agent_info()?;
    let agent_address: AnyDhtHash = agent_info.agent_initial_pubkey.clone().into();

    // Link list to agent
    create_link(
        agent_address.into(),
        list_entry_hash.clone(),
        utils::link_tag("list")?,
    )?;

    let list_edge = ListEdge::new(List {
        id,
        name: input.name
    });
    let payload = CrudListPayload::new(list_edge);
    Ok(payload)
}
