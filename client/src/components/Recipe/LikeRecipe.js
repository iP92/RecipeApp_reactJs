import React, {useState, useEffect} from 'react';

import {Mutation} from 'react-apollo';
import withSession from "../withSession";
import {GET_RECIPE, LIKE_RECIPE, UNLIKE_RECIPE} from "../../queries";

const defaultState = {
    liked: false,
    username: ''
}

const LikeRecipe = (props) => {
    const [state, setState] = useState(defaultState);

    const {_id} = props;
    const {username} = props;
    let favorites;

    useEffect(() => {
        if (props.session.getCurrentUser) {
            favorites = props.session.getCurrentUser.favorites;
            const prevLiked = favorites.findIndex(favorite => favorite._id === _id) > -1;
            setState({username, liked: prevLiked})
        }
    }, [state.username])

    const handleClick = (likeRecipe, unlikeRecipe) => {
        setState(prevState => {
            return {
                ...prevState,
                liked: !prevState.liked
            }
        });
        handleLike(likeRecipe, unlikeRecipe)
    }

    const handleLike = (likeRecipe, unlikeRecipe) => {
        if (!state.liked) {
            likeRecipe().then(async ({data}) => {
                await props.refatch();
            })
        } else {
            unlikeRecipe().then(async ({data}) => {
                await props.refatch();
            })
        }

    };

    const updateLike = (cache, {data: {likeRecipe}}) => {
        const {getRecipe} = cache.readQuery({query: GET_RECIPE, variables: {_id}});

        cache.writeQuery({
            query: GET_RECIPE,
            variables: {_id},
            data: {
                getRecipe: {...getRecipe, likes: likeRecipe.likes + 1}
            }
        })
    }

    const updateUnlike = (cache, {data: {unlikeRecipe}}) => {
        const {getRecipe} = cache.readQuery({query: GET_RECIPE, variables: {_id}});

        cache.writeQuery({
            query: GET_RECIPE,
            variables: {_id},
            data: {
                getRecipe: {...getRecipe, likes: unlikeRecipe.likes - 1}
            }
        })
    }

    return (
        <Mutation mutation={UNLIKE_RECIPE}
                  variables={{_id, username}}
                  update={updateUnlike}
        >
            {unlikeRecipe => (
                <Mutation mutation={LIKE_RECIPE}
                          variables={{_id, username}}
                          update={updateLike}
                >
                    {likeRecipe => (
                        state.username && <button onClick={() => handleClick(likeRecipe, unlikeRecipe)}>
                            {state.liked ? 'Unlike' : 'Like'}
                        </button>
                    )
                    }
                </Mutation>
            )}
        </Mutation>

    )
}

export default withSession(LikeRecipe);