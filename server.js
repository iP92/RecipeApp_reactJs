const express = require ('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config({path: 'variables.env'});
const Recipe = require('./models/Recipe');
const User = require('./models/User');
const jwt = require('jsonwebtoken');


//Bring in Graphql middleware
const { graphiqlExpress, graphqlExpress} = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');


// Create Schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

// Connect to database
 mongoose
     .connect( process.env.MONGO_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true
     })
     .then(() => console.log(`DB connected`))
     .catch(err => console.error(`err`, err));

mongoose.set('useCreateIndex', true);

//  Initializes application
const app = express();

// const corsOptions = {
//     origin:'http://localhost:3000',
//     credentials: true
// };
app.use(cors('*'));

// Set up JWT authentification middleware
app.use(async (req, res, next) => {
    const token = req.headers['authorization'];
    if(token !== 'null'){
        try{
            const currentUser = await jwt.verify(token, process.env.SECRET);
            req.currentUser = currentUser;
        }catch(err) {
            console.error(err)
        }
    }
    next();
})

// Create GraphiQL application
// app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql'}));


// Connect schemas to GraphQL
app.use('/graphql',
    bodyParser.json(),
    graphqlExpress(({currentUser}) => ({
    schema,
    context: {
        Recipe,
        User,
        currentUser
    }
})));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
})