
import dotenv from 'dotenv'
import connectDB from './db/db.js';

import {app} from './app.js'
dotenv.config({
    path: './.env'
})


connectDB()

app.get('/', (req, res) => {
    res.send('Hello World!');
    });
    app.listen(process.env.PORT, () => {
    console.log('Server is running on  port',process.env.PORT);
    });

    // iD6gGkRdhkKrVr2l
    // mongodb+srv://<db_username>:<db_password>@taskmanagement.qehdc.mongodb.net/