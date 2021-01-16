mod entries;
mod node;
mod utils;

use entries::*;
use hdk3::prelude::*;
use juniper::{graphql_object, http::GraphQLBatchRequest, EmptySubscription, FieldResult};
use serde_json;

use item::{CreateItemInput, DeleteItemInput, ToggleItemDoneInput, UpdateItemInput};
use list::CreateListInput;

entry_defs![
    list::ListEntry::entry_def(), // 0
    item::ItemEntry::entry_def()  // 1
];

#[macro_use]
extern crate derive_new;

pub struct Query;

#[graphql_object(Context = Context)]
impl Query {
    fn apiVersion() -> &str {
        "0.0.1"
    }

    fn list(id: juniper::ID) -> FieldResult<list::List> {
        list::handlers::list(id)
    }

    fn lists() -> FieldResult<list::ListConnection> {
        list::handlers::lists()
    }

    fn item(id: juniper::ID) -> FieldResult<item::Item> {
        item::handlers::item(id)
    }

    fn items(id: juniper::ID) -> FieldResult<item::ItemConnection> {
        item::handlers::items(id)
    }

    fn node(id: juniper::ID) -> FieldResult<node::NodeValue> {
        let id_string = id.to_string();
        if id_string.contains(".") {
            Ok(item::handlers::item(id)?.into()) // Item id contains '.'
        } else {
            Ok(list::handlers::list(id)?.into()) // List id doesn't
        }
    }
}

pub struct Mutation;

#[graphql_object(Context = Context)]
impl Mutation {
    fn createList(input: CreateListInput) -> FieldResult<list::CrudListPayload> {
        list::handlers::list_create(input)
    }

    fn createItem(input: CreateItemInput) -> FieldResult<item::CrudItemPayload> {
        item::handlers::item_create(input)
    }

    fn updateItem(input: UpdateItemInput) -> FieldResult<item::CrudItemPayload> {
        item::handlers::item_update(input)
    }

    fn toggleItemDone(input: ToggleItemDoneInput) -> FieldResult<item::CrudItemPayload> {
        item::handlers::item_toggle_done(input)
    }

    fn deleteItem(input: DeleteItemInput) -> FieldResult<item::CrudItemPayload> {
        item::handlers::item_delete(input)
    }
}

pub struct Context {}

impl Context {
    fn new() -> Self {
        Self {}
    }
}

impl juniper::Context for Context {}

#[derive(Debug, Serialize, Deserialize, SerializedBytes)]
pub struct CallPayload {
    data: String,
}

#[derive(Debug, Serialize, Deserialize, SerializedBytes, Clone, new)]
pub struct CallResponse {
    pub data: String,
}

#[hdk_extern]
pub fn graphql(call_payload: CallPayload) -> FieldResult<CallResponse> {
    debug!("CallPayload: {:?}", call_payload);

    let request = serde_json::from_str::<GraphQLBatchRequest>(&call_payload.data)?;
    debug!("GraphQLBatchRequest: {:?}", request);

    let context = Context::new();
    let schema = juniper::RootNode::new(Query, Mutation, EmptySubscription::new());
    let response = request.execute_sync(&schema, &context);
    let response_string = serde_json::to_string(&response)?;
    debug!("GraphQL Response String: {:?}", response_string);

    Ok(CallResponse::new(response_string))
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {

    // Create lists and items to start with
    let list_input = CreateListInput {
        name: String::from("Work"),
    };
    list::handlers::list_create(list_input).expect("Init error");

    let list = CreateListInput {
        name: String::from("Family"),
    };
    list::handlers::list_create(list).expect("Init error");

    Ok(InitCallbackResult::Pass)
}
