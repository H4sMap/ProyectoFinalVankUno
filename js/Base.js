document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-id').textContent = currentUser.id;
        document.getElementById('user-email').textContent = currentUser.email;
        document.getElementById('user-wallet').textContent = `$${currentUser.monedero}`;
    } else {
        alert('No se ha iniciado sesión. Redirigiendo a la página de inicio de sesión.');
        window.location.href = 'index.html';
    }

    document.getElementById('logout-button').addEventListener('click', function () {
        alert('Desconectado');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    showSection('transferir');

    document.getElementById('send-button').addEventListener('click', function () {
        const chatInput = document.getElementById('chat-input');
        const chatBox = document.getElementById('chat-box');
        const message = chatInput.value;

        if (message.trim() !== '') {
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            chatBox.appendChild(messageElement);
            chatInput.value = '';
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    document.getElementById('transferir-link').addEventListener('click', function () {
        showSection('transferir');
    });

    document.getElementById('estadisticas-link').addEventListener('click', function () {
        showSection('estadisticas');
    });

    document.getElementById('historial-link').addEventListener('click', function () {
        showSection('historial');
    });

    document.getElementById('transfiya-link').addEventListener('click', function () {
        showSection('transfiya');
    });
});

function showSection(section, prefilledUser = '') {
    const content = document.getElementById('content');
    content.innerHTML = '';

    document.querySelectorAll('.navbar a').forEach(link => link.classList.remove('active'));

    if (section === 'transferir') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        content.innerHTML = `
            <h2>Transferir</h2>
            <form class="transfer-form">
                <label for="usuario">Usuario a transferir:</label>
                <input type="text" id="usuario" name="usuario" value="${prefilledUser}" required>
                
                <label for="valor">Valor a transferir:</label>
                <input type="number" id="valor" name="valor" required>
                
                <div class="checkbox-container">
                    <label for="transfiya">Agregar a Transfi Ya</label>
                    <input type="checkbox" id="transfiya" name="transfiya" ${prefilledUser && currentUser.transfiya && currentUser.transfiya.includes(prefilledUser) ? 'checked' : ''}>
                </div>
                
                <button type="submit">CONTINUAR</button>
            </form>
        `;
        document.getElementById('transferir-link').classList.add('active');

        document.querySelector('.transfer-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const usuario = document.getElementById('usuario').value;
            const valor = parseFloat(document.getElementById('valor').value);
            const agregarTransfiya = document.getElementById('transfiya').checked;

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users')) || [];

            if (usuario === currentUser.username) {
                alert('No puedes transferir dinero a ti mismo.');
                return;
            }

            const recipientUserIndex = users.findIndex(user => user.username === usuario);
            if (recipientUserIndex === -1) {
                alert('La cuenta a la que deseas transferir no existe.');
                return;
            }

            const recipientUser = users[recipientUserIndex];

            if (currentUser.monedero >= valor) {
                currentUser.monedero -= valor;
                recipientUser.monedero += valor;

                const transactionDate = new Date().toLocaleString();

                // Añadir la transferencia al historial del usuario que envía
                if (!currentUser.history) currentUser.history = [];
                currentUser.history.push({
                    type: 'Enviado',
                    amount: valor,
                    date: transactionDate,
                    to: usuario
                });

                // Añadir la transferencia al historial del usuario que recibe
                if (!recipientUser.history) recipientUser.history = [];
                recipientUser.history.push({
                    type: 'Recibido',
                    amount: valor,
                    date: transactionDate,
                    from: currentUser.username
                });

                // Agregar o eliminar de Transfi Ya según el estado de la casilla
                if (agregarTransfiya) {
                    if (!currentUser.transfiya) currentUser.transfiya = [];
                    if (!currentUser.transfiya.includes(usuario)) {
                        currentUser.transfiya.push(usuario);
                    }
                } else {
                    if (currentUser.transfiya) {
                        currentUser.transfiya = currentUser.transfiya.filter(user => user !== usuario);
                    }
                }

                // Actualizar la lista de usuarios con los nuevos valores
                const currentUserIndex = users.findIndex(user => user.username === currentUser.username);
                users[currentUserIndex] = currentUser;
                users[recipientUserIndex] = recipientUser;

                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('users', JSON.stringify(users));

                document.getElementById('user-wallet').textContent = `$${currentUser.monedero}`;

                alert(`Transferencia de $${valor} a ${usuario} realizada con éxito.`);
            } else {
                alert('Saldo insuficiente en el monedero.');
            }
        });
    } else if (section === 'estadisticas') {
        content.innerHTML = `
            <h2>Estadísticas</h2>
            <canvas id="cryptoChart"></canvas>
        `;
        document.getElementById('estadisticas-link').classList.add('active');
        initializeCryptoChart();
        fetchCryptoStats();
        setInterval(fetchCryptoStats, 60000);
    } else if (section === 'historial') {
        content.innerHTML = `
            <h2>Historial</h2>
            <ul class="history-list" id="history-list"></ul>
        `;
        document.getElementById('historial-link').classList.add('active');
        fetchHistory();
    } else if (section === 'transfiya') {
        content.innerHTML = `
            <h2>Transfi Ya</h2>
            <ul class="transfiya-list" id="transfiya-list"></ul>
        `;
        document.getElementById('transfiya-link').classList.add('active');
        fetchTransfiya();
    }
}

function initializeCryptoChart() {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    window.cryptoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Precio (USD)',
                data: [],
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.raw;
                        }
                    }
                }
            }
        }
    });
}

function fetchCryptoStats() {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => b.current_price - a.current_price);

            const labels = data.map(coin => coin.name);
            const prices = data.map(coin => coin.current_price);

            window.cryptoChart.data.labels = labels;
            window.cryptoChart.data.datasets[0].data = prices;
            window.cryptoChart.update();
        })
        .catch(error => console.error('Error fetching crypto stats:', error));
}

function fetchHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.history) {
        const historyList = document.getElementById('history-list');
        
        // Ordenar el historial del más reciente al más antiguo
        currentUser.history.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        historyList.innerHTML = ''; // Limpiar la lista antes de llenarla nuevamente
        currentUser.history.reverse().forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${item.type}:</span> Cantidad = ${item.amount} Fecha = ${item.date} ${item.to ? 'Para: ' + item.to : 'De: ' + item.from}
            `;
            historyList.appendChild(listItem);
        });
    }
}

function fetchTransfiya() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.transfiya) {
        const transfiyaList = document.getElementById('transfiya-list');
        currentUser.transfiya.forEach(usuario => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>Usuario:</span> ${usuario}
            `;
            listItem.style.cursor = 'pointer'; // Cambia el cursor a una mano
            listItem.addEventListener('click', function() {
                showSection('transferir', usuario);
            });
            transfiyaList.appendChild(listItem);
        });
    }
}