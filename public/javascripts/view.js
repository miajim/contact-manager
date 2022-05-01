export default class View {
  constructor() {
    this.contactInfoTemplate = Handlebars.compile(document.getElementById('contactTemplate').innerHTML);
    this.contactFormTemplate = Handlebars.compile(document.getElementById('formTemplate').innerHTML);
    this.contactList = this.createContactList();
    this.addContactForm = this.createForm('Create Contact');
    this.editContactForm = this.createForm('Edit Contact');
    this.currentTags = document.createElement('ul');
    this.availableTags = document.createElement('ul');
    this.showAllButton = document.createElement('button');
    this.taskbar = this.createTaskBar();
    this.searchbar = this.taskbar.querySelector('.contact-name-search');
    this.header = this.createHeader();
    this._initLocalListeners();
  }

  _initLocalListeners() {

    let cancelButton = this.addContactForm.querySelector('button[type=button]');
    cancelButton.addEventListener('click', () => {
      this.addContactForm.toggleAttribute('hidden', true);
      this.addContactForm.reset();
    });
  
    this.taskbar.addEventListener('click', event => {
      if (event.target.classList.contains('add-contact')) {
        this.editContactForm.toggleAttribute('hidden', true);
        this.addContactForm.insertAdjacentElement('beforeend', this.currentTags);
        this.addContactForm.insertAdjacentElement('beforeend', this.availableTags);
        this.addContactForm.toggleAttribute('hidden', false);
      }
    });

    this.availableTags.addEventListener('click', event => {
      let target = event.target;
      if (target.tagName === 'LI') {
        target.classList.replace('available-tag', 'current-tag');
        if (!this.currentTags.textContent.includes(target.textContent)) {
          this.currentTags.append(target);
        }
      }
    })
  }

  getTags(list) {
    return [...list.querySelectorAll('li')].map((tagItem) => {
      return tagItem.textContent;
    }).join(',');
  }

  createTagList(tags) {
    this.currentTags.classList.add('current-tag-list');
    this.currentTags.textContent = 'Current Tags:  ';

    this.availableTags.classList.add('available-tag-list');
    this.availableTags.textContent = 'Available Tags:  ';

    Object.keys(tags).forEach(tag => {
      let tagLi = document.createElement('li');
      tagLi.classList.add('tag');
      tagLi.classList.add('available-tag');
      tagLi.textContent = tag;
      this.availableTags.append(tagLi);
    });
  }

  removeTags(list) {
    while (list.firstElementChild) {
      list.firstElementChild.remove();
    }
  }

  drawContactList(contacts, tags) {
    this.contactList.innerHTML = '';
    let tempContacts = contacts.map(contact => {
      let tags = null;
      if (contact['tags']) {
        tags = contact['tags'].split(',').map(tag => { 
          return {tag: tag.toLowerCase()};
        });
      }

      return {
        id: contact['id'], 
        full_name: contact['full_name'], 
        email: contact['email'], 
        phone_number: contact['phone_number'], 
        tags: tags,
      };
    });
    let contactInfoHTML = this.contactInfoTemplate({contacts: tempContacts});
    this.contactList.insertAdjacentHTML('beforeend', contactInfoHTML);
    if (tags) {
      this.createTagList(tags);
    }
  }

  addTagToList(list, tag) {
    if (typeof tag === 'string') {
      let tagName = tag;
      tag = document.createElement('li');
      tag.classList.add('tag');
      tag.textContent = tagName;
    }
    list.append(tag);
  }

  createForm(formTitle) {
    let contactFormHTML = this.contactFormTemplate({ formTitle });
    this.contactList.insertAdjacentHTML('beforebegin', contactFormHTML);
    let contactForm = this.contactList.previousElementSibling;
    contactForm.classList.add(formTitle.toLowerCase().replace(' ', '-'));
    return contactForm;
  }

  createContactList() {
    let contactList = document.createElement('ul');
    contactList.classList.add('contact-list');
    document.body.insertAdjacentElement('afterbegin', contactList);
    return contactList;
  }

  createTaskBar() {
    let container = document.createElement('div');
    let box = document.createElement('div');
    let addContactButton = document.createElement('button');
    let searchBar = document.createElement('input');

    container.classList.add('task-bar');
    box.classList.add('task-bar-box');
    
    addContactButton.type = 'button';
    addContactButton.textContent = 'Add Contact';
    addContactButton.classList.add('add-contact');
    searchBar.classList.add('contact-name-search');
    searchBar.type = 'text';
    searchBar.setAttribute('placeholder', 'Search');
    this.showAllButton.textContent = 'Show All Contacts';

    let box1 = box.cloneNode();
    let box2 = box.cloneNode();
    box1.append(this.showAllButton, addContactButton);
    box2.append(searchBar);

    container.append(box1, box2);
    this.addContactForm.insertAdjacentElement('beforebegin', container);
    
    return container;
  }

  createHeader() {
    let header = document.createElement('header');
    let link = document.createElement('a');
    let h1 = document.createElement('h1');
    let p = document.createElement('p');

    header.classList.add('main-header');
    link.href = '#home';
    h1.innerText = 'Contact Manager';
    p.innerText = 'A JS239 practice project';

    link.append(h1);
    header.append(link);
    header.append(p);
    document.body.insertAdjacentElement('afterbegin', header);

    return header;
  }

  bindCurrentTags(handler) {
    this.currentTags.addEventListener('click', event => {
      let target = event.target;
      if (target.tagName === "LI") {
        handler(target);
      }
    });
  }

  bindAddContact(handler) {
    this.addContactForm.addEventListener('submit', handler);
  }

  bindEditContact(editButtonHandler, editContactHandler) {
    this.contactList.addEventListener('click', editButtonHandler);
    this.editContactForm.addEventListener('submit', editContactHandler);

    let tagInput = this.editContactForm.querySelector('input[name=tags]');
    let cancelButton = this.editContactForm.querySelector('button[type=button]');
    cancelButton.addEventListener('click', editContactHandler);
    tagInput.addEventListener('keyup', editContactHandler);
  }

  bindSearchTags(handler) {
    this.contactList.addEventListener('click', (event) => {
      if (event.target.classList.contains('tag')) {
        handler(event);
      }
    });
  }

  bindShowAllContacts(handler) {
    this.showAllButton.addEventListener('click', handler);
  }

  bindDeleteContact(handler) {
    this.contactList.addEventListener('click', handler);
  }

  bindSearchContact(handler) {
    this.searchbar.addEventListener('keyup', handler);
  }

  bindAddCustomTags(handler) {
    this.addContactForm.querySelector('input[name=tags]').addEventListener('keyup',  handler);
    this.editContactForm.querySelector('input[name=tags]').addEventListener('keyup',  handler);
  }
}