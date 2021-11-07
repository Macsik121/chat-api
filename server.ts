const express = require('express');
import db from './db';
import installGraphqlServer from './graphql/install_graphql_server';
const app = express();
const port = 3000;

installGraphqlServer(app);

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
