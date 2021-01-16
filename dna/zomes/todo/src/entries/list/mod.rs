pub mod handlers;

use crate::node;

use super::*;
use hdk3::prelude::*;
use juniper::{graphql_interface, GraphQLInputObject, GraphQLObject};

#[hdk_entry(id = "list", visibility = "public")]
#[serde(rename_all = "camelCase")]
#[derive(Clone, Debug)]
pub struct ListEntry {
    pub id: juniper::ID,
    pub name: String,
}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
#[graphql(impl = node::NodeValue)]
pub struct List {
    id: juniper::ID,
    name: String,
}

impl List {
    pub fn new_from_entry(list_entry: ListEntry) -> List {
        Self {
            id: list_entry.id,
            name: list_entry.name
        }
    }
}

#[graphql_interface]
impl node::Node for List {
    fn id(&self) -> &juniper::ID {
        return &self.id;
    }
}

#[derive(GraphQLInputObject, Debug, Serialize, Deserialize, SerializedBytes, Clone, new)]
pub struct CreateListInput {
    pub name: String,
}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone, new)]
pub struct CrudListPayload {
    list_edge: ListEdge,
}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone, new)]
pub struct ListConnection {
    edges: Vec<ListEdge>,
    page_info: PageInfo,
}

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct ListEdge {
    cursor: String,
    node: List,
}

impl ListEdge {
    pub fn new(list: List) -> ListEdge {
        Self {
            cursor: String::from("NOT IMPLEMENTED"),
            node: list,
        }
    }
}
