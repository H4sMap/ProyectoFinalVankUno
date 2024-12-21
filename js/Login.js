class User {
    static getUsersFromLocalStorage() {
        const storedUsers = localStorage.getItem('users');
        return storedUsers ? JSON.parse(storedUsers) : [];
    }
    
    static authenticate(username, password) {
        const users = User.getUsersFromLocalStorage();
        return users.find(user => user.username === username && user.password === password);
    }
}

// Asegúrate de que el DOM esté completamente cargado antes de agregar el evento
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const user = User.authenticate(username, password);
        if (user) {
            alert('Inicio de sesión exitoso');
            localStorage.setItem('currentUser', JSON.stringify(user)); // Guardar el usuario autenticado
            window.location.href = 'base.html';
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
});