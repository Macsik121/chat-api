require('dotenv').config();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dbActions from '../db';

interface Message {
    text: string;
    owner: string;
}

interface Chat {
    title: string;
    messages: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    chats?: Array<Chat>
}

interface ServerResponse {
    message: string;
    success: boolean;
}

interface MessageArgs {
    message: Message
    chat: number
}

async function getAllTheMessages() {
    try {
        const db: any = dbActions.getDb();
        const messages: Array<Message> = await db.collection('messages').find().toArray();
        return messages;
    } catch (error) {
        console.log(error);
    }
}

async function saveMessage(_: any, {
    message,
    chat
}: MessageArgs) {
    try {
        const db: any = dbActions.getDb();
        await db
            .collection('users')
            .updateOne(
                {
                    id: message.owner
                },
                {
                    $push: {
                        'chats.$[chat].messages': {
                            owner: message.owner,
                            text: message.text
                        }
                    }
                },
                {
                    arrayFilters: [
                        {
                            'chats.chat.id': chat
                        }
                    ]
                }
            );
        return 'everything is successfully completed';
    } catch (error) {
        console.log(error);
    }
}

interface GenerateJwtArgs {
    user: User
}

function generatejwt(user: User) {
    return generateJwt('', { user });
}

function generateJwt(_: unknown, { user }: GenerateJwtArgs) {
    const secret: string = process.env.secretOrKeyJWT || '';
    user.password = '';
    const token = (
        jwt.sign(user, secret)
    );
    return token;
}

async function generateNewJwt(_: unknown, { name }: { name: string }) {
    const db = dbActions.getDb();
    const user = await db.collection('users').findOne({ name });
    const secret: string = process.env.secretOrKeyJWT || '';
    const token = jwt.sign(user, secret);
    return token;
}

async function signUp(_: unknown, {
    user
}: GenerateJwtArgs): Promise<ServerResponse> {
    const db = dbActions.getDb();
    const {
        name,
        email,
        password
    } = user;
    const foundUser = (
        await db.collection('users').findOne({ name }) ||
        await db.collection('users').findOne({ email })
    );

    if (foundUser) {
        return {
            message: 'This user already exists',
            success: false
        };
    }
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user.chats = [];
    const lastUser = db.users.find().sort({ id: -1 }).limit(1);
    user.id = lastUser.id + 1;
    await db.collection('users').insertOne(user);
    const token: string = generatejwt({
        ...user
    });
    return {
        success: true,
        message: token
    };
}

async function signIn(_: unknown, {
    user
}: GenerateJwtArgs): Promise<ServerResponse> {
    const db = dbActions.getDb();
    const possibleUser: User = (
        await db.collection('users').findOne({ name: user.name }) ||
        await db.collection('users').findOne({ email: user.name })
    );
    if (!possibleUser) {
        return {
            message: 'This user does not exist',
            success: false
        };
    }
    if (!(await bcrypt.compare(user.password, possibleUser.password))) {
        return {
            message: 'You wrote a wrong password',
            success: false
        };
    }
    return {
        message: generatejwt(possibleUser),
        success: true
    };
}

interface SearchUsersArgs {
    search: string
}

async function searchUsers(_: unknown, { search }: SearchUsersArgs) {
    const db: any = dbActions.getDb();
    const returnLimit = 5;
    search = search.toLocaleLowerCase();
    const users: Array<User> = (
        await db
            .collection('users')
            .find()
            .toArray()
    );
    const usersToReturn: Array<User> = [];
    function strongSearch(valueToSearch: string) {
        valueToSearch = valueToSearch.toLowerCase();
        let matches: boolean = false;
        let foundLength: number = 0;
        for(let i: number = 0; i < valueToSearch.length; i++) {
            const currentCharacter: string = valueToSearch[i];
            for(let j: number = 0; j < search.length; j++) {
                if (currentCharacter == search[j]) {
                    foundLength++;
                }
                if (foundLength >= search.length) {
                    break;
                }
            }
            if (foundLength >= search.length) {
                matches = true;
                break;
            }
        }
        return matches;
    }
    for(let i: number = 0; i < users.length; i++) {
        if (usersToReturn.length >= returnLimit) {
            break;
        }
        const user = users[i];
        user.password = '';
        user.email = '';
        let userFound: boolean = false;
        userFound = strongSearch(user.name);
        if (!userFound) {
            userFound = strongSearch(user.email);
        }
        if (userFound) {
            usersToReturn.push(user);
        }
    }
    return usersToReturn;
}

const resolvers = {
    Query: {
        messages: getAllTheMessages,
        generateJwt,
        generateNewJwt,
        signIn,
        searchUsers
    },
    Mutation: {
        saveMessage,
        signUp
    }
}

export default resolvers;
