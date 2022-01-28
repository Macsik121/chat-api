export interface Message {
    text: string;
    owner: string;
    date: Date
}

export interface Chat {
    id: number;
    title: string;
    competitors: number[];
    messages: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    chats?: Array<Chat>;
    lastSeen?: Date;
    online: boolean;
}

export interface ServerResponse {
    message: string;
    success: boolean;
    payload?: any
}
