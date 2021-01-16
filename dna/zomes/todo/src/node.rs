use crate::item::Item;
use crate::list::List;

use juniper::graphql_interface;

#[graphql_interface(for = [List, Item])] // enumerating all implementers is mandatory
pub trait Node {
    fn id(&self) -> &juniper::ID;
}
