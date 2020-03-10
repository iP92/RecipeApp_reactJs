import React, {useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';
import CKEditor from 'react-ckeditor-component';

import {Mutation} from 'react-apollo';
import {ADD_RECIPE, GET_ALL_RECIPES, GET_USER_RECIPES} from "../../queries";
import Error from "../Error";
import withAuth from "../withAuth";

const initialState = {
    name: '',
    category: 'Breakfast',
    imageUrl:'',
    description: '',
    instructions: '',
    username: ''
}

const AddRecipe = (props) => {
    const [state, setState] = useState({...initialState})

    const handleChange = (e) => {
        const targetName = e.target.name;
        const targetValue = e.target.value;
        setState(prevState => {
            return {
                ...prevState,
                [targetName]: targetValue
            }
        })
    }

    const handleInstructionsChange = event => {
        const newContent = event.editor.getData();
        setState(prevState => {
            return {
                ...prevState,
                instructions: newContent
            }
        })
    }

    const validateForm = () => {
        return !name || !imageUrl || !category || !description || !instructions
    }

    const handleSubmit = (event, addRecipe) => {
        event.preventDefault();
        addRecipe().then(({data}) => {
            clearState()
            props.history.push('/')
        });
    }

    const updateCache = (cache, {data: {addRecipe}}) => {
        const {getAllRecipes} = cache.readQuery({query: GET_ALL_RECIPES})

        cache.writeQuery({
            query: GET_ALL_RECIPES,
            data: {
                getAllRecipes: [addRecipe, ...getAllRecipes]
            }
        })
    }

    const clearState = () => {
        setState({...initialState})
    }

    useEffect(() => {
        setState(prevState => {
            return {
                ...prevState,
                username: props.session.getCurrentUser.username
            }
        })
    }, [state.username])

    const {name, category, imageUrl, description, instructions, username} = state;
    return (
        <Mutation mutation={ADD_RECIPE}
                  variables={{name, category, imageUrl, description, instructions, username}}
                  update={updateCache}
                  refetchQueries={() => [
                      { query: GET_USER_RECIPES, variables: { username } }
                  ]}
        >
            {(addRecipe, {data, loading, error}) => {
                return (
                    <div className="App">
                        <h2 className="App">Add Recipe</h2>
                        <form className="form"
                              onSubmit={(event) => handleSubmit(event, addRecipe)}
                        >
                            <input
                                value={name}
                                type="text"
                                name="name"
                                onChange={handleChange}
                                placeholder="Recipe Name"
                            />
                            <input
                                value={imageUrl}
                                type="text"
                                name="imageUrl"
                                onChange={handleChange}
                                placeholder="Recipe Image"
                            />
                            <select value={category}
                                    name="category"
                                    onChange={handleChange}
                            >
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snack">Snack</option>
                            </select>
                            <input
                                value={description}
                                type="text"
                                name="description"
                                placeholder="Add description"
                                onChange={handleChange}
                            />
                            <label htmlFor="instructions">Add Instructions</label>
                            <CKEditor name="instructions" content={instructions} events={{ change: handleInstructionsChange}}/>
                            {/*<textarea*/}
                            {/*    value={instructions}*/}
                            {/*    name="instructions"*/}
                            {/*    placeholder="Add instructions"*/}
                            {/*    onChange={handleChange}*/}
                            {/*></textarea>*/}
                            <button disabled={loading || validateForm()}
                                    type="submit"
                                    className="button-primary"
                            >Submit
                            </button>
                            {error && <Error error={error}/>}
                        </form>
                    </div>
                )
            }}
        </Mutation>
    )
}

export default withAuth(session => session && session.getCurrentUser)(withRouter(AddRecipe));