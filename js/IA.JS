let geminiApiKey = '';
let geminiApiUrl = '';

fetch('/config.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo JSON.');
        }
        return response.json();
    })
    .then(config => {
        geminiApiKey = config.geminiApiKey;
        geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    })
    .catch(error => {
        console.error('Error al cargar el archivo JSON:', error);
    });

const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const userName = currentUser ? currentUser.name : 'Usuario';
const botName = 'VANKIA';

function isRelevant(message) {
    const relevantKeywords = [
        'hola', 'banco', 'dinero', 'moneda', 'criptomonedas', 'finanzas', 'transacciones', 'wallet',
        'tarjetas', 'pagos', 'inversiones', 'bitcoin', 'ethereum', 'lido staked ether', 'bnb',
        'solana', 'xrp', 'usdc', 'tether', 'cardano', 'dogecoin', 'dolar', 'pesos', 'ahorro'
    ];
    const lowerCaseMessage = message.toLowerCase();
    return relevantKeywords.some(keyword => lowerCaseMessage.includes(keyword));
}

function sendMessageToBot(message) {
    const data = {
        contents: [{
            parts: [{ "text": message }]
        }]
    };

    return fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                const botResponse = data.candidates[0].content.parts[0].text;
                displayMessage(botResponse, 'bot');
            } else {
                throw new Error('Invalid response format');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage('Lo siento, hubo un problema con la solicitud.', 'bot');
        });
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = sender === 'bot' ? 'bot-message' : 'user-message';

    if (sender === 'bot') {
        messageElement.innerHTML = `<strong>${botName}:</strong> ${message}`;
    } else {
        messageElement.innerHTML = `<strong>${userName}:</strong> ${message}`;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('send-button').addEventListener('click', function () {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value;

    if (message.trim() !== '') {
        if (isRelevant(message)) {
            displayMessage(message, 'user');
            sendMessageToBot(message);
        } else {
            displayMessage('Lo siento, solo puedo responder preguntas relacionadas con bancos, dinero y criptomonedas.', 'bot');
        }
        chatInput.value = '';
    }
});