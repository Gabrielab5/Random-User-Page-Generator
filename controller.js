export class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.generateButton.addEventListener('click', this.handleGenerateUser.bind(this));
        this.view.saveButtonEl.addEventListener('click', this.handleSaveUser.bind(this));
        this.view.savedUsersDropdownEl.addEventListener('change', this.handleLoadUser.bind(this));

        this.init();
    }  
    
    init() { 
        this.handleGenerateUser();
        this._populateSavedUsersDropdown();
     }

    async handleGenerateUser() {
        this.view.setButtonState(this.view.generateButton, true, 'Generating...');
        try {
            await this.model.fetchAllData();
            this._renderCurrentPage(); 
            this.view.displayMessage('New user page generated!', 'success');
        } catch (error) {
            console.error('Controller: Error generating user page:', error);
            this._renderErrorPage();
        } finally {
            this.view.setButtonState(this.view.generateButton, false, 'Generate New User');
        }
    }

    handleSaveUser() {
        const dataToSave = this.model.getCurrentPageData();
        if (!dataToSave.mainUser) {
            this.view.displayMessage('No user page to save. Generate one first!', 'info');
            return;
        }
        try {
            const savedUserId = this.model.saveUser(dataToSave);
            this.view.displayMessage('User page saved successfully!', 'success');
            this._populateSavedUsersDropdown(savedUserId);
        } catch (error) {
            console.error('Controller: Error saving user page:', error);
            this.view.displayMessage('Error saving user page.', 'error');
            alert('Error saving user page.');
        }
    }

    handleLoadUser() {
        const selectedUserId = this.view.getSelectedUserId();
        if (!selectedUserId) {
            this.view.displayMessage('Please select a user to load from the dropdown.', 'info');
            return;
        }
        try {
            const loadedData = this.model.loadUser(selectedUserId);
            if (loadedData) {
                this._renderCurrentPage(); 
                this.view.displayMessage('User page loaded successfully!', 'success');
            } else {
                this.view.displayMessage('No saved user page found.', 'info');
                this._populateSavedUsersDropdown();
            }
        } catch (error) {
            console.error('Controller: Error loading user page:', error);
            this.view.displayMessage('Error loading user page.', 'error');
        }
    }

    _renderCurrentPage() {
        const { mainUser, friends, quote, pokemon, aboutMe } = this.model.getCurrentPageData();
        this.view.renderUser(mainUser);
        this.view.renderFriends(friends);
        this.view.renderQuote(quote);
        this.view.renderPokemon(pokemon);
        this.view.renderAboutMe(aboutMe);
    }

    _renderErrorPage() {
        this.view.renderUser(null);
        this.view.renderFriends([]);
        this.view.renderQuote({ text: 'Failed to load quote.', author: '' });
        this.view.renderPokemon({ name: 'Error', image: 'https://placehold.co/80x80/D0E0F0/000000?text=Error' });
        this.view.renderAboutMe('Failed to load "About Me" text.');
    }

    _populateSavedUsersDropdown(selectedId = '') {
        const savedUserList = this.model.getSavedUserList();
        this.view.renderSavedUsersDropdown(savedUserList, selectedId);
    }
}
