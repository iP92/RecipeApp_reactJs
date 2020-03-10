import React, {useState, useEffect} from 'react';
import './App.css';
import posed from 'react-pose';

import {Query} from 'react-apollo';
import {GET_ALL_RECIPES} from '../queries';
import RecipeItem from './Recipe/RecipeItem';
import Spinner from "./Spinner";


const RecipeList = posed.ul({
    shown: {
        x: '0%',
        staggerChildren: 100
    },
    hidden: {
        x: '-100%'
    }
})

const App = () => {
    const [state, setState] = useState({ on: false })

    const slideIn = () => {
        setState({ on: !state.on })
    }

    useEffect(() => {
        setTimeout(slideIn, 200)
    }, [])

    return (<div className="App">
        <h1 className="main-title">
            <strong>Find Recipes</strong>
        </h1>
        <Query query={GET_ALL_RECIPES}>
            {({data, loading, error}) => {
                if (loading) return <Spinner />;
                if (error) return <div>Error</div>;
                return (
                    <RecipeList
                        pose={state.on ? 'shown' : 'hidden'}
                        className="cards"
                    >
                        {data.getAllRecipes.map(recipe => {
                                // debugger
                                return <RecipeItem key={recipe._id} {...recipe}/>
                            }
                        )}
                    </RecipeList>
                )
            }}
        </Query>
    </div>)
}


export default App;
