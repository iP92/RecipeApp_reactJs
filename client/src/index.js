import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import App from './components/App';
import Navbar from './components/Navbar';
import Signin from './components/Auth/Signin';
import Signup from './components/Auth/Signup';
import Search from './components/Recipe/Search'
import AddRecipe from './components/Recipe/AddRecipe';
import RecipePage from './components/Recipe/RecipePage'
import Profile from './components/Profile/Profile';
import withSession from './components/withSession';
import './index.css';


const client = new ApolloClient({
    // uri: 'http://localhost:4444/graphql',
    uri: 'https://recipe92.herokuapp.com/graphql',
    fetchOptions:{
        credentials:'include'
    },
    request: operation => {
        const token = localStorage.getItem("token");
        operation.setContext({
            headers: {
                authorization: token
            }
        })
    },
    onError:({ networkError }) => {
        if (networkError){
            console.log(`Network Error`, networkError);
        }
    }
});

const Root = ({ refatch, session }) => (
    <Fragment>
        <Router>
            <Navbar session={session}/>
            <Switch>
                <Route path="/" exact component={App}/>
                <Route path="/search" component={Search}/>
                <Route path="/signin" render={() => <Signin refetch={refatch} />}/>
                <Route path="/signup" render={() => <Signup refatch={refatch} />}/>
                <Route path="/recipe/add" render={() => <AddRecipe session={session} /> } />
                <Route path="/recipes/:_id" component={ RecipePage } />
                <Route path="/profile" render={() => <Profile session={session} /> }/>
                <Redirect to="/"/>
            </Switch>
        </Router>
    </Fragment>
);

const RootWithSession = withSession(Root);

ReactDOM.render(
    <ApolloProvider client={client}>
        <RootWithSession/>
    </ApolloProvider>
  ,
  document.getElementById('root')
);
