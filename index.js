const { Client, Location, List, Buttons, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: false }
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');

    setInterval(() => {
        handle();
    }, 1000 * 120);
});

function getNumberFormat(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
}

const data = {
    "Jair Bolsonaro": {
        votos: 0,
        percentual: 0
    },
    "Lula": {
        votos: 0,
        percentual: 0
    },

};

const list = [
    // coloque a lista de numeros aqui
]

async function handle() {
    const url = 'https://resultados.tse.jus.br/oficial/ele2022/545/dados-simplificados/br/br-c0001-e000545-r.json';
    const response = await axios.get(url);
    const { data: res } = response;

    const update = data['Bolsonaro'] != res.cand[0].vap || data['Lula'] != res.cand[1].vap;

    data['Bolsonaro'] = {
        votos: res.cand[0].vap,
        percentual: res.cand[0].pvap
    }

    data['Lula'] = {
        votos: res.cand[1].vap,
        percentual: res.cand[1].pvap
    }

    const message = `Bolsonaro: ${getNumberFormat(data['Bolsonaro'].votos)} votos (${data['Bolsonaro'].percentual}%)\nLula: ${getNumberFormat(data['Lula'].votos)} votos (${data['Lula'].percentual}%)\nVotos apurados até o momento: ${res['pst']}%`;

    if (update) {
        list.forEach((id) => {
            client.sendMessage(id, message);
        });
    }
}

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        console.log(msg.from)
    }
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});