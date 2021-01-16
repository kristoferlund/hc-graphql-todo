pub mod item;
pub mod list;

use hdk3::prelude::*;
use juniper::GraphQLObject;

#[derive(GraphQLObject, Debug, Serialize, Deserialize, SerializedBytes, Clone)]
pub struct PageInfo {
    has_next_page: bool,
    has_previous_page: bool,
    start_cursor: String,
    end_cursor: String,
}

impl PageInfo {
    pub fn new() -> PageInfo {
        return PageInfo {
            has_next_page: false,
            has_previous_page: false,
            start_cursor: String::from("NOT IMPLEMENTED"),
            end_cursor: String::from("NOT IMPLEMENTED"),
        };
    }
}
