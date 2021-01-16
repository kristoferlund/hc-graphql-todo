import { gql } from "@apollo/client";

// Lists

export const LISTS_QUERY = gql`
  query ListsQuery {
    lists {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const LIST_QUERY = gql`
  query ListQuery($id: ID!) {
    list(id: $id) {
      id
      name
    }
  }
`;

export const ADD_LIST_MUTATION = gql`
  mutation AddListMutation($input: CreateListInput!) {
    createList(input: $input) {
      listEdge {
        node {
          id
          name
        }
      }
    }
  }
`;

// Items

export const LIST_ITEMS_QUERY = gql`
  query ListItemsQuery($id: ID!) {
    items(id: $id) {
      edges {
        node {
          id
          description
          done
        }
      }
    }
  }
`;

export const ADD_ITEM_MUTATION = gql`
  mutation AddItemMutation($input: CreateItemInput!) {
    createItem(input: $input) {
      item {
        id
        description
        done
      }
    }
  }
`;

export const TOGGLE_ITEM_DONE_MUTATION = gql`
  mutation ToggleItemDoneMutation($input: ToggleItemDoneInput!) {
    toggleItemDone(input: $input) {
      item {
        id
        description
        done
      }
    }
  }
`;

export const DELETE_ITEM_MUTATION = gql`
  mutation DeleteItemMutation($input: DeleteItemInput!) {
    deleteItem(input: $input) {
      item {
        id
        description
        done
      }
    }
  }
`;
