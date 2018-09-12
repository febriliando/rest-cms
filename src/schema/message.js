import { gql } from 'apollo-server-express';
import pubsub, { EVENTS } from '../subscription';

export default gql`
  extend type Query {
    messages(cursor: String, limit: Int): MessageConnection!
    message(id: ID!): Message!
  }

  extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
  }

  type MessageConnection {
    edges: [Message!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    endCursor: String!
    hasNextPage: Boolean!
  }

  type Message {
    id: ID!
    text: String!
    user: User!
    createdAt: String!
  }

  extend type Subscription {
    messageCreated: MessageCreated!
  }
  type MessageCreated {
    message: Message!
  }
`;