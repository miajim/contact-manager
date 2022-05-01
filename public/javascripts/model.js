export default class Model {
  constructor() {
    this.contacts = [];
    this.tags = {};
  }

  bindUpdateContacts(handler) {
    this.updateContacts = handler;
  }

  getContacts() {
    fetch('http://localhost:3000/api/contacts', { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      this.contacts = data;
      this.tags = this.getUniqueTags(this.contacts);
      this.updateContacts(this.contacts, this.tags);
    }).catch(error => console.log(error));
  }

  getUniqueTags(contacts) {
    let tags = {};
    contacts.forEach(contact => {
      if (contact['tags']) {
        contact['tags'].split(',').forEach(tag => {
          if (!tags[tag]) tags[tag] = true;
        });
      }
    });
    return tags;
  }
  
  async getContact(id) {
    let result = await fetch(`http://localhost:3000/api/contacts/${id}`, {method: 'GET'})
                      .then(response => response.json())
                      .catch(error => console.log(error));;
    return result;
  }

  addContact(formData) {
    formData = this.formDataToJSON(formData);

    fetch('http://localhost:3000/api/contacts', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then(response => {
      if (response.ok) {
        this.getContacts();
      } else {
        alert('Cannot find contact.')
      }
    }).catch(error => console.log(error));

  }

  deleteContact(id) {
    fetch(`http://localhost:3000/api/contacts/${id}`, {method: 'DELETE'})
    .then((response) => {
      if (response.ok) {
        this.getContacts();
      } else {
        alert('Cannot find contact.');
      }
    }).catch(error => console.log(error));
  }

  async editContact(id, formData) {
    formData = this.formDataToJSON(formData);

    let response = await fetch(`http://localhost:3000/api/contacts/${id}`, { 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify(formData),
    }).catch(error => console.log(error));
    
    if (response.ok) {
      return response.json();
    } else {
      alert('Cannot find contact.');
    }
    
  }

  formDataToJSON(formData) {
    const json = {};
    for (const pair of formData.entries()) {
        json[pair[0]] = pair[1];
    }
    return json;
  }
}