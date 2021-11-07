const express = require('express');
import db from './db';
import installGraphqlServer from './graphql/install_graphql_server';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 3000;

installGraphqlServer(app);

app.use(cors());

(
    async () => {
        try {
            await db.connectToDb();
            app.listen(port, () => console.log(`Server has been starting with port ${port}`));
        } catch (error) {
            console.log(error);
        }
    }
)()
