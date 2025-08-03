export class View {
    constructor() {
        this.userAvatarEl = document.getElementById('user-avatar');
        this.userNameEl = document.getElementById('user-name');
        this.userLocationEl = document.getElementById('user-location');
        this.friendsListEl = document.getElementById('friends-list');
        this.generateButton = document.getElementById('generate-user-btn');
        this.quoteTextEl = document.getElementById('favorite-quote');
        this.quoteAuthorEl = document.getElementById('quote-author');
        this.pokemonImageEl = document.getElementById('pokemon-image');
        this.pokemonNameEl = document.getElementById('pokemon-name');
        this.aboutMeEl = document.getElementById('about-me');
        this.saveButtonEl = document.getElementById('save-user-btn');
        this.statusMessageEl = document.getElementById('status-message');
        this.savedUsersDropdownEl = document.getElementById('saved-users-dropdown');
    }

    renderUser(user) {
        if (user) {
            this.userAvatarEl.src = user.picture.large;
            this.userAvatarEl.alt = `${user.name.first} ${user.name.last}'s avatar`;
            this.userNameEl.textContent = `${user.name.first} ${user.name.last}`;
            this.userLocationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${user.location.city}, ${user.location.country}`;
        } else {
            this.userAvatarEl.src = 'https://placehold.co/100x100/A0B0C0/FFFFFF?text=Error';
            this.userAvatarEl.alt = 'Error loading user';
            this.userNameEl.textContent = 'No User Data';
            this.userLocationEl.innerHTML = '';
        }
    }

    renderFriends(friends) {
        this.friendsListEl.innerHTML = ''; 
        if (friends && friends.length > 0) {
            friends.forEach(friend => {
                const listItem = document.createElement('li');     
                if (typeof friend === 'string')  listItem.textContent = friend;
                else listItem.textContent = `${friend.name.first} ${friend.name.last}`;    
                this.friendsListEl.appendChild(listItem);        
            });
        } else {
            const listItem = document.createElement('li');
            listItem.textContent = 'No friends found.';
            this.friendsListEl.appendChild(listItem);
        }
    }

    renderQuote(quote) {
        this.quoteTextEl.textContent = quote.text;
        this.quoteAuthorEl.textContent = quote.author;
    }

    renderPokemon(pokemon) {
        this.pokemonImageEl.src = pokemon.image;
        this.pokemonImageEl.alt = pokemon.name;
        this.pokemonNameEl.textContent = pokemon.name;
    }

    renderAboutMe(text) {
        this.aboutMeEl.textContent = text;
    }

    renderSavedUsersDropdown(userList, selectedId = '') {
        if (!this.savedUsersDropdownEl) return;
        this.savedUsersDropdownEl.innerHTML = '<option value="">Select a saved user</option>';
        
        userList.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            if (user.id === selectedId)  option.selected = true;
            this.savedUsersDropdownEl.appendChild(option);
        });
    }

    getSelectedUserId() { return this.savedUsersDropdownEl ? this.savedUsersDropdownEl.value : ''; }

    setButtonState(buttonEl, disabled, text) {
        if (buttonEl) {
            buttonEl.disabled = disabled;
            buttonEl.textContent = text;
        }
    }

    displayMessage(message, type) {
        if (this.statusMessageEl) {
            this.statusMessageEl.textContent = message;
            this.statusMessageEl.className = `status-message ${type}`; 
            setTimeout(() => {
                this.statusMessageEl.textContent = '';
                this.statusMessageEl.className = 'status-message';
            }, 3000); 
        }
        console.log(`View Status (${type}): ${message}`);
    }
}
