const typeDefs: string = `
    type chatMessages {
        text: String!
        owner: Int!
    }

    type Chat {
        id: Int
        messages: [chatMessages]
        avatar: String
    }

    type User {
        name: String
        email: String
        password: String
        chats: [Chat]
        id: Int!
    }

    input MessageInput {
        text: String!
        owner: Int!
    }

    input ChatInput {
        title: String!
        messages: [MessageInput]
    }

    input UserInput {
        id: Int
        name: String
        email: String
        password: String
    }

    type ServerResponse {
        success: Boolean
        message: String!
    }

    type Query {
        messages: [chatMessages!]!
        generateJwt(user: UserInput!): String!
        generateNewJwt(name: String!): String!
        signIn(user: UserInput!): ServerResponse!
        searchUsers(search: String!): [User]
    }

    type Mutation {
        saveMessage(message: MessageInput!, chat: Int!): String!
        signUp(user: UserInput!): ServerResponse!
    }
`;

export default typeDefs;
