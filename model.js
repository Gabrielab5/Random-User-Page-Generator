import { API_KEYS } from './ipconfig.js';

export class Model {
    constructor() {
        this.currentMainUser = null;
        this.currentFriends = [];
        this.currentQuote = { text: '', author: '' };
        this.currentPokemon = { name: '', image: '' };
        this.currentAboutMe = '';
        this.allSavedUsers = {};
        this._loadAllSavedUsersFromStorage();
    }

    //Fetches all necessary data from various APIs.
    async fetchAllData() {
        try {
            const [userDataResponse, quoteDataResponse, pokemonData, aboutMeDataResponse] = await Promise.all([
                fetch(API_KEYS.randomUser),
                fetch(API_KEYS.kanyeQuote),
                this._fetchRandomPokemonData(), 
                fetch(API_KEYS.baconIpsum)
            ]);

            // handles potential errors
            const userData = await this._checkResponse(userDataResponse, 'Random User API');
            const quoteData = await this._checkResponse(quoteDataResponse, 'Kanye Quote API');
            const aboutMeData = await this._checkResponse(aboutMeDataResponse, 'Bacon Ipsum API');

            // Store fetched data in model's internal state
            if (userData && userData.results && userData.results.length > 0) {
                this.currentMainUser = userData.results[0];
                this.currentFriends = userData.results.slice(1, 7);
            } else {
                this.currentMainUser = null;
                this.currentFriends = [];
                console.warn('Model: No user data received from Random User API.');
            }

            this.currentQuote = {
                text: quoteData && quoteData.quote ? `"${quoteData.quote}"` : 'Failed to load quote.',
                author: '— Kanye West' 
            };

            if (pokemonData && pokemonData.sprites && pokemonData.name) {
                this.currentPokemon = {
                    name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1),
                    image: pokemonData.sprites.front_default
                };
            } else {
                this.currentPokemon = { name: 'Unknown', image: 'https://placehold.co/80x80/D0E0F0/000000?text=Error' };
                console.warn('Model: No Pokemon data received or invalid structure.');
            }

            this.currentAboutMe = aboutMeData && aboutMeData.length > 0 ? aboutMeData.join(' ') : 'Failed to load "About Me" text.';

            console.log('Model: All data fetched and stored.');

        } catch (error) {
            console.error('Model: Error fetching all data:', error);
            this._resetCurrentDataOnError()
            throw error; 
        }
    }

    _resetCurrentDataOnError() {
        this.currentMainUser = null;
        this.currentFriends = [];
        this.currentQuote = { text: 'Failed to load quote.', author: '' };
        this.currentPokemon = { name: 'Error', image: 'https://placehold.co/80x80/D0E0F0/000000?text=Error' };
        this.currentAboutMe = 'Failed to load "About Me" text.';
    }

    // Helper to check fetch response and parse JSON.
    async _checkResponse(response, apiName) {
        if (!response.ok) {
            throw new Error(`HTTP error from ${apiName}: ${response.status}`);
        }
        return response.json();
    }

    // Internal helper function to fetch random Pokemon data.
    async _fetchRandomPokemonData() {
        try {
            const countResponse = await fetch(`${API_KEYS.pokeApiBase}?limit=1`); 
            if (!countResponse.ok) throw new Error(`HTTP error! status: ${countResponse.status}`);
            const countData = await countResponse.json();
            const totalPokemon = countData.count;
            const randomPokemonId = Math.floor(Math.random() * totalPokemon) + 1; 
            const pokemonResponse = await fetch(`${API_KEYS.pokeApiBase}/${randomPokemonId}/`);
            if (!pokemonResponse.ok) throw new Error(`HTTP error! status: ${pokemonResponse.status}`);
            return await pokemonResponse.json(); 
        } catch(error) {
            console.error('Model: Error in _fetchRandomPokemonData:', error);
            return null; 
        }
    }

    getCurrentPageData() {
        return {
            mainUser: this.currentMainUser,
            friends: this.currentFriends,
            quote: this.currentQuote,
            pokemon: this.currentPokemon,
            aboutMe: this.currentAboutMe
        };
    }

    saveUser(data) {
        if (!data.mainUser) {
            console.warn('Model: No current user data to save.');
            throw new Error('No current user data to save.');
        }
        const userId = data.mainUser.login.uuid || `user-${Date.now()}`; 
        this.allSavedUsers[userId] = data;
        this._saveAllSavedUsersToStorage();
        console.log(`Model: User "${data.mainUser.name.first} ${data.mainUser.name.last}" saved with ID: ${userId}`);
        return userId;
    }

    loadUser(userId) {
        try {
            const loadedData = this.allSavedUsers[userId];
            if (loadedData) {
                this.currentMainUser = loadedData.mainUser;
                this.currentFriends = loadedData.friends;
                this.currentQuote = loadedData.quote;
                this.currentPokemon = loadedData.pokemon;
                this.currentAboutMe = loadedData.aboutMe;
                console.log('Model: User page loaded successfully from local storage!');
                return loadedData;
            } else {
                console.warn('Model: No saved user page found in local storage.');
                return null;
            }
        } catch (error) {
            console.error('Model: Error loading user page from local storage:', error);
            throw error; 
        }
    }

     getSavedUserList() {
        return Object.keys(this.allSavedUsers).map(id => {
            const user = this.allSavedUsers[id].mainUser;
            return {
                id: id,
                name: user ? `${user.name.first} ${user.name.last}` : `Unnamed User (${id})`
            };
        });
    }

    _saveAllSavedUsersToStorage() {
        try {
            localStorage.setItem('rupgAllSavedUsers', JSON.stringify(this.allSavedUsers));
        } catch (error) {
            console.error('Model: Error saving all users to local storage:', error);
            throw error;
        }
    }

    _loadAllSavedUsersFromStorage() {
        try {
            const savedDataString = localStorage.getItem('rupgAllSavedUsers');
            if (savedDataString) {
                this.allSavedUsers = JSON.parse(savedDataString);
            }
        } catch (error) {
            console.error('Model: Error loading all users from local storage:', error);
            this.allSavedUsers = {}; 
        }
    }
}
