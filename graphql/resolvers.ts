require('dotenv').config();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dbActions from '../db';

interface Message {
    text: string;
    owner: string;
}

interface Chat {
    id: number;
    title: string;
    competitors: number[];
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

async function getAllTheMessages(_: any, { id }: { id: number }) {
    try {
        const db: any = dbActions.getDb();
        const messages: Array<Message> = (
            await db
                .collection('rooms')
                .find({
                    competitors: {
                        $elemMatch: { id }
                    }
                })
                .toArray()
        );
        return messages;
    } catch (error) {
        console.log(error);
    }
}

async function createRoom(_: any, {
    competitors,
    message,
    title,
    isGroup = false,
    id
}: {
    competitors: Array<Number>,
    message: Message,
    title: string,
    isGroup: boolean,
    id: number
}): Promise<number> {
    const db: any = dbActions.getDb();
    if (!id) {
        const gottenId = await db.collection('roomsId').findOne();
        id = gottenId.id;
    }
    if (isGroup) {
        await db.collection('rooms').insertOne({
            id,
            title,
            competitors,
            messages: [ message ]
        });
    } else {
        await db.collection('rooms').insertOne({
            id,
            competitors,
            messages: [ message ]
        });
    }
    await db.collection('roomsId').updateOne({}, { $inc: { id: 1 } });
    return id;
}

async function saveMessage(_: any, {
    message,
    chat
}: {
    message: Message
    chat: number
}) {
    try {
        const db: any = dbActions.getDb();
        await db
            .collection('rooms')
            .updateOne(
                {
                    id: chat
                },
                {
                    $push: {
                        messages: message
                    }
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
    const user: User & {
        _id: number
    } | {
        _id?: number,
        password?: string
    } = (
        await db
            .collection('users')
            .findOne({ name })
    )
    const secret: string = process.env.secretOrKeyJWT || '';
    delete user.password;
    delete user._id;
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
    const lastUser: Array<User | { id: number }> = await db.collection('users').find().sort({ id: -1 }).limit(1).toArray();
    if (lastUser.length == 0) lastUser.push({ id: 0 });
    user.id = lastUser[0].id + 1;
    await db.collection('users').insertOne(user);
    const token: string = generatejwt(user);
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
    id: number
}

async function searchUsers(_: unknown, {
    search,
    id
}: SearchUsersArgs) {
    const db: any = dbActions.getDb();
    // const returnLimit = 5;
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
        // if (usersToReturn.length >= returnLimit) {
        //     break;
        // }
        const user: User = users[i];
        if (!(user.id == id)) {
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
    }
    return usersToReturn;
}

async function chatId(): Promise<number> {
    const db: any = dbActions.getDb();
    const id = await db.collection('roomsId').findOne();
    return id.id;
}

const resolvers = {
    Query: {
        messages: getAllTheMessages,
        generateJwt,
        generateNewJwt,
        signIn,
        searchUsers,
        chats: getAllTheMessages,
        chatId
    },
    Mutation: {
        saveMessage,
        signUp,
        createRoom
    }
}

export default resolvers;
