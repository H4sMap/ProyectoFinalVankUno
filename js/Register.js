class User {
    #name;
    #id;
    #email;
    #username;
    #password;
    #monedero;
    constructor(name, id, email, username, password) {
        this.#name = name;
        this.#id = id;
        this.#email = email;
        this.#username = username;
        this.#password = password;
        this.#monedero = 50000;
    }

    getName(){
        return this.#name;
    }

    setName(name) {
        this.#name = name;
    }

    getId(){
        return this.#id;
    }

    setId(id) {
        this.#id = id;
    }

    getEmail(){
        return this.#email;
    }

    setEmail(email) {
        this.#email = email;
    }

    getUsername(){
        return this.#username;
    }

    setUsername(username) {
        this.#username = username;
    }

    getPassword(){
        return this.#password;
    }

    setPassword(password) {
        this.#password = password;
    }

    getMonedero() {
        return this.#monedero;
    }

    setMonedero(monedero) {
        this.#monedero = monedero;
    }
    
    saveToLocalStorage() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({
            name: this.#name,
            id: this.#id,
            email: this.#email,
            username: this.#username,
            password: this.#password,
            monedero: this.#monedero
        });
        localStorage.setItem('users', JSON.stringify(users));
    }

    static isUserExists(id, email, username) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.some(user => user.id === id || user.email === email || user.username === username);
    }
}

// Asegúrate de que el DOM esté completamente cargado antes de agregar el evento
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('register-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const id = document.getElementById('id').value;
        const email = document.getElementById('email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        if (User.isUserExists(id, email, username)) {
            alert('El usuario con el mismo ID, correo electrónico o nombre de usuario ya existe.');
            return;
        }
        
        const user = new User(name, id, email, username, password);
        user.saveToLocalStorage();
        
        alert('Registro exitoso');
        window.location.href = 'index.html';
    });
});