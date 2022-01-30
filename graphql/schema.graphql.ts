const typeDefs: string = `
    scalar Date

    type chatMessage {
        text: String!
        owner: Int!
        date: Date
    }

    type Competitor {
        id: Int!
        name: String
        lastSeen: Date
        online: Boolean
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
        lastSeen: Date
        online: Boolean
    }

    input MessageInput {
        text: String!
        owner: Int!
        date: Date
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
        online: Boolean
    }

    type ServerResponse {
        success: Boolean
        message: String!
        payload: String!
    }

    type Query {
        messages: [chatMessage!]!
        chats(id: Int!): [Chat]
        generateJwt(user: UserInput!): String!
        generateNewJwt(name: String!): String!
        signIn(user: UserInput!): ServerResponse!
        searchUsers(search: String!, id: Int!): [User]
        chatId: Int!
    }

    type Mutation {
        saveMessage(message: MessageInput!, chat: Int!): String!
        signUp(user: UserInput!): ServerResponse!
        createRoom(
            competitors: [CompetitorsInput!]!,
            message: MessageInput!,
            title: String,
            isGroup: Boolean,
            id: Int
        ): Int!
        updateLastSeen(id: Int!, online: Boolean!): Date
    }
`;

export default typeDefs;
