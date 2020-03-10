import React, { useState } from 'react';

import { ApolloConsumer } from 'react-apollo';
import {SEARCH_RECIPES} from '../../queries';
import SearchItem from './SearchItem';


const Search = () => {
    const [ searchResults, setSearchResults ] = useState([]);


    const handleChange = ({ searchRecipes }) => {
        setSearchResults(searchRecipes)
    };


    return (
        <ApolloConsumer>
            {client => (
                <div className="App">
                    <input type="search"
                           placeholder="Search for recipes"
                           onChange={async event => {
                               event.persist();
                               const { data } = await client.query({
                                   query: SEARCH_RECIPES,
                                   variables: {searchTerm: event.target.value}
                               });
                               handleChange(data);
                               return data
                           }}
                    />
                    <ul>
                        {searchResults.map(recipe =>
                            <SearchItem key={recipe._id} {...recipe}/>
                        )}
                    </ul>
                </div>
            )}
        </ApolloConsumer>
    )
}

export default Search;