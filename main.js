class RUPG {
    constructor(){
        this.userAvatar = document.getElementById('user-avatar');
        this.userName = document.getElementById('user-name');
        this.userLocation = document.getElementById('user-location');
        this.friendsList = document.getElementById('friends-list');
        this.generateButton = document.getElementById('generate-user-btn');
        this.quoteText = document.getElementById('favorite-quote');
        this.pokemonImage = document.getElementById('pokemon-image');
        this.pokemonName = document.getElementById('pokemon-name');
        this.addEventListeners();
    }

    addEventListeners() {
        if (this.generateButton)
            this.generateButton.addEventListener('click', () => this.generateUserPage());
        else console.error('Button not found');
    }
    
    // Fetches user data from the Random User Generator API and updates the page.
    async generateUserPage() {
        try {
            this.generateButton.disabled = true;
            this.generateButton.textContent = 'Generating...';
            const response = await fetch('https://randomuser.me/api/?results=7');

            if(!response.ok) throw new Error(`Http error: ${response.status}`);
            const data = await response.json();
            console.log('API Response Data:', data);
            
            if(data.results && data.results.length > 0){
                const user = data.results[0];
                const friends = data.results.slice(1,7);
                this.updateUser(user);
                this.updateFriendsList(friends);
                await this.generateQuote();
                await this.generatePokemon();

            } else console.warn('No user data recieved from API');
        } catch(error){
            this.userName.textContent = 'Error loading user!';
            this.userLocation.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to load data.';
            this.friendsList.innerHTML = '<li>Error loading friends.</li>';
        } finally {
            this.generateButton.disabled = false;
            this.generateButton.textContent = 'Generate New User';
        }
    }

    async generateQuote() {
        try {
            const response = await fetch('https://api.kanye.rest');
            if(!response.ok) throw new Error(`Http error: ${response.status}`);
            const data = await response.json();
            this.quoteText.textContent = data.quote;
            this.quoteText.setAttribute('data-author', data.author);
        } catch(error) {
            console.error('Error fetching quote:', error);
            this.quoteText.textContent = 'Failed to load quote.';
        }
    }

    async generatePokemon() {
        try {
            const countResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1'); 
            if (!countResponse.ok) throw new Error(`HTTP error! status: ${countResponse.status}`);
            const countData = await countResponse.json();
            const totalPokemon = countData.count;

            const randomPokemonId = Math.floor(Math.random() * totalPokemon) + 1; 

            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}/`);
            if (!pokemonResponse.ok) throw new Error(`HTTP error! status: ${pokemonResponse.status}`);
            const pokemonData = await pokemonResponse.json();

            console.log('Pokemon API Response Data:', pokemonData); 

            this.pokemonImage.src = pokemonData.sprites.front_default; 
            this.pokemonImage.alt = pokemonData.name;
            this.pokemonName.textContent = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1); 
        } catch(error) {
            console.error('Error fetching Pokemon:', error);
            this.pokemonImage.src = 'https://placehold.co/80x80/D0E0F0/000000?text=Error';
            this.pokemonImage.alt = 'Error loading Pokemon';
            this.pokemonName.textContent = 'Failed to load Pokemon.';
        }
    }

    updateUser(user){
        this.userAvatar.src = user.picture.large;
        this.userAvatar.alt = `${user.name.first} ${user.name.last}'s avatar`;
        this.userName.textContent = `${user.name.first} ${user.name.last}`;
        this.userLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${user.location.city}, ${user.location.country}`;
    }

    updateFriendsList(friends){
        this.friendsList.innerHTML = '';
        if(friends.length > 0) {
            friends.forEach(friend => {
                const listItem = document.createElement('li');
                listItem.textContent = `${friend.name.first} ${friend.name.last}`;
                this.friendsList.appendChild(listItem);      
            });
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = 'No friends found.';
            this.friendsList.appendChild(listItem);
        }     
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const rupgApp = new RUPG();
     if (rupgApp.generateButton) {
        rupgApp.generateUserPage();
    }
});


