const typeDefs: string = `
    type chatMessage {
        text: String!
        owner: Int!
    }

    type Competitor {
        id: Int!
        name: String
    }

    type Chat {
        id: Int
        messages: [chatMessage]!
        title: String
        competitors: [Competitor!]!
    }

    type User {
        name: String
        email: String
        password: String
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

    input CompetitorsInput {
        id: Int!
        name: String
    }

    type ServerResponse {
        success: Boolean
        message: String!
    }

    type Query {
        messages: [chatMessage!]!
        chats(id: Int!): [Chat]
        generateJwt(user: UserInput!): String!
        generateNewJwt(name: String!): String!
        signIn(user: UserInput!): ServerResponse!
        searchUsers(search: String!, id: Int!): [User]
    }

    type Mutation {
        saveMessage(message: MessageInput!, chat: Int!): String!
        signUp(user: UserInput!): ServerResponse!
        createRoom(
            competitors: [CompetitorsInput!]!,
            message: MessageInput!,
            title: String,
            isGroup: Boolean
        ): Int!
    }
`;

export default typeDefs;
