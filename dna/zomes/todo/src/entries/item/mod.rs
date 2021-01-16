pub mod handlers;

use crate::node;

use super::*;
use hdk3::prelude::*;
use juniper::{graphql_interface, GraphQLInputObject, GraphQLObject};

#[hdk_entry(id = "item", visibility = "public")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, Debug)]
pub struct ItemEntry {
    pub id: juniper::ID,
    pub description: String,
    pub done: bool,
}

impl ItemEntry {
    pub fn new(list_id: juniper::ID, item_id: juniper::ID, description: String, done: bool) -> ItemEntry {
        Self {
            id: [list_id.to_string(), String::from("."), item_id.to_string()].concat().into(),
            description,
            done,
        }
    }

}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
#[graphql(impl = node::NodeValue)]
pub struct Item {
    id: juniper::ID,
    description: String,
    done: bool,
}

impl Item {
    pub fn new_from_entry(item_entry: ItemEntry) -> Item {
        Self {
            id: item_entry.id,
            description: item_entry.description,
            done: item_entry.done,
        }
    }
}

#[graphql_interface]
impl node::Node for Item {
    fn id(&self) -> &juniper::ID {
        return &self.id;
    }
}

#[derive(GraphQLInputObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct CreateItemInput {
    list_id: juniper::ID,
    description: String,
}
#[derive(GraphQLInputObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct UpdateItemInput {
    id: juniper::ID,
    description: String,
    done: bool,
}

#[derive(GraphQLInputObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct ToggleItemDoneInput {
    id: juniper::ID,
}

#[derive(GraphQLInputObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct DeleteItemInput {
    id: juniper::ID,
}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone, new)]
pub struct CrudItemPayload {
    item: Item,
}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct ItemConnection {
    edges: Vec<ItemEdge>,
    page_info: PageInfo,
}

impl ItemConnection {
    pub fn empty() -> ItemConnection {
        return ItemConnection {
            edges: Vec::new(),
            page_info: PageInfo::new(),
        };
    }
}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct ItemEdge {
    cursor: String,
    node: Item,
}

impl ItemEdge {
    pub fn new(item: Item) -> ItemEdge {
        return ItemEdge {
            cursor: String::from("NOT IMPLEMENTED"),
            node: item,
        };
    }
}

