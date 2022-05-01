export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.renderExistingContacts();
    this.bindEvents();
  }

  bindEvents() {
    this.model.bindUpdateContacts(this.updateContacts);
    this.view.bindAddContact(this.handleAddContact);
    this.view.bindDeleteContact(this.handleDeleteContact);
    this.view.bindEditContact(this.handleEditContact, this.handleEditContactForm);
    this.view.bindSearchContact(this.debounce(this.handleSearch, 400));
    this.view.bindSearchTags(this.handleSearchTags);
    this.view.bindCurrentTags(this.handleCurrentTags);
    this.view.bindShowAllContacts(this.handleShowAllContacts);
    this.view.bindAddCustomTags(this.debounce(this.handleAddCustomTags, 400));
  }

  

  handleShowAllContacts = (event) => {
    event.preventDefault();
    this.model.updateContacts(this.model.contacts, this.model.tags);
  }

  updateContacts = (contacts, tags) => {
    this.view.drawContactList(contacts, tags);
  };

  renderExistingContacts() {
    this.model.getContacts();
  }

  handleCurrentTags = (target) => {
    if (this.model.tags[target.textContent]) {
      this.view.availableTags.append(target);
    } else {
      target.remove();
    }
  }

  handleAddContact = (event) => {
    event.preventDefault();
    let tags = this.view.getTags(this.view.currentTags);
    let formData = new FormData(this.view.addContactForm);
    formData.set('tags', tags);

    this.model.addContact(formData);
    this.view.addContactForm.setAttribute('hidden', true);
    this.view.addContactForm.reset();
  };

  handleDeleteContact = (event) => {
    event.preventDefault();
    let target = event.target;

    if (target.classList.contains('delete-contact')) {
      let id = target.closest('li').id.replace('contact_', '');
      let result = confirm('Do you want to delete the contact?');

      if (result) {
        this.model.deleteContact(id);
      }
    }
  };

  handleEditContact = (event) => {
    event.preventDefault();
    let target = event.target;

    if (target.classList.contains('edit-contact')) {
      let id = target.closest('li').id.replace('contact_', '');
      let form = this.view.editContactForm;
      let formData = new FormData(form);

      this.view.addContactForm.toggleAttribute('hidden', true);
      this.view.removeTags(this.view.currentTags);
      this.view.removeTags(this.view.availableTags);
      this.view.editContactForm.insertAdjacentElement('beforeend', this.view.currentTags);
      this.view.editContactForm.insertAdjacentElement('beforeend', this.view.availableTags);
      this.view.editContactForm.toggleAttribute('hidden', false);
      
      this.view.editContactForm.id = id;

      this.model.getContact(id).then(data => {
        [...formData.keys()].forEach(key => {

          if (key === 'tags') {
            let contactTags = Object.fromEntries(data[key].split(',').map(tag => {
              return [tag, true];
            }));
                        
            Object.keys(this.model.tags).forEach(tag => {
              if (contactTags[tag]) {
                this.view.addTagToList(this.view.currentTags, tag)
              } else {
                this.view.addTagToList(this.view.availableTags, tag);
              }
            });
          } else {
            form.elements[key].setAttribute('value', data[key]);
          }
        });
      });     
    } 
  };

  handleEditContactForm = (event) => {
    if (event.type === 'submit') {
      let form = this.view.editContactForm;
      let id = form.id;
      let formData = new FormData(form);
      let tags = this.view.getTags(this.view.currentTags);

      formData.set('id', id);
      formData.set('tags', tags);
      this.model.editContact(id, formData).then(() => {
        this.model.getContacts();
        this.view.editContactForm.setAttribute('hidden', true);
        this.view.editContactForm.reset();
      });
    } else if (event.type === 'click') {
      this.view.editContactForm.toggleAttribute('hidden', true);
      this.view.editContactForm.reset();
    }
  };

  handleSearch = () => {
    let query = this.view.searchbar.value.toLowerCase();
    let matchingContacts = this.model.contacts.filter(({full_name}) => {
      return full_name.toLowerCase().includes(query);
    });
    this.view.drawContactList(matchingContacts);
  }

  handleSearchTags = (event) => {
    let selectedTag = event.target.textContent;
    let matchingContacts = this.model.contacts.filter(({tags}) => {
        if (tags) { return tags.toLowerCase().split(',').includes(selectedTag) }; 
    });
    this.view.drawContactList(matchingContacts);
  }

  handleAddCustomTags = (event) => {
    const VALID_KEYS_TO_ADD_TAG = { ' ': true, ',': true};
    event.preventDefault();
    let target = event.target;
    let keyValue = event.key;

    if (VALID_KEYS_TO_ADD_TAG[keyValue]) {
      let tagName = target.value.trim().replace(/[\s,]/g, '').toLowerCase();
      if (tagName && !this.model.tags[tagName]) {
        this.view.addTagToList(this.view.currentTags, tagName);
        target.value = '';
      }
    }
  }

  debounce(func, delay) {
    let timeout;
    return (...args) => {
      if (timeout) { clearTimeout(timeout) }
      timeout = setTimeout(() => func.apply(null, args), delay);
    };
  }
}