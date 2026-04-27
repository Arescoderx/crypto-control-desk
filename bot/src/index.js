// websocket
const WebSocket = require("ws");
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

// all vars
const url = process.env.LOCAL_API;
let obj = {a:"", p:""}
let sellPrice = 0.0; // representa carteira fechada quando em 0.0;
let currentPrice = 0.0;
let usdtBalance = 0.0
let btcusdtFractionValue = 0.0;

const buyAsset = () => {
    let quantity = '';
    if(usdtBalance == 0){
        console.log("SEM USDT PARA COMPRAR");
        console.log('------------------');
        return
    }

    if(btcFractionPurchased < 0.01){
        console.log('USDT insuficiente para compra mínima de 0,01 BTC');
        return;
    }
    quantity = btcFractionPurchased.toString();
    console.log("Bom tempo para comprar");
    // newOrder(quantity, 'BUY'); definitivo
    newOrder('0.01', 'BUY');
    sellPrice = currentPrice * 1.1;
}

ws.onmessage = async (event) => {
    // todos
    // definir porcentagem de lucro
    // definir estrategias
    // criar webhook para salvar trades/preços/medias etc
    // venda parcial e total

    obj = JSON.parse(event.data);
    currentPrice = parseFloat(obj.a);
    usdtBalance = await getBalance('USDT');
    btcFractionPurchased = usdtBalance / currentPrice;
    btcusdtFractionValue = currentPrice * 0.01;
    
    console.log("currentPrice", currentPrice)
    console.log("sellprice", sellPrice);
    console.log('balance',usdtBalance);
    console.log('btc fractions can be purchased with current balance', btcFractionPurchased);

    // verifica quanto está o preco de 0.01 btcusdt
    if(sellPrice === 0 && btcusdtFractionValue <= usdtBalance){
        buyAsset();
        return
    }
    // else if (sellPrice !== 0.0 && currentPrice >= sellPrice){
    //     console.log("Bom pra vender");
    //     // realizar venda total
    //     sellPrice = 0;
    //     newOrder('0.01', 'SELL');
    // }
    // else {
    //     console.log("Aguardando")
    // }
    console.log("-------")
}

// criptografador
const crypto = require("crypto");

async function newOrder(quantity, side){
    const timestamp = Date.now();
    const recvWindow = 60000;
    // tolerancia de tempo de execucao da ordem (em ms)
    const data = {
        symbol: process.env.SYMBOL,
        type: 'MARKET',
        side,
        quantity,
        timestamp, 
        recvWindow
    };

    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams(data)}`)
        .digest('hex');
    const newData = {...data, signature};
    const qs = `?${new URLSearchParams(newData)}`
    
    try {
        const options = {
            method: 'POST',
            headers: {'X-MBX-APIKEY': process.env.API_KEY}
        }
        const res = await fetch(`${process.env.URL_API}/v3/order${qs}`, options);
        console.log('Trade realizada', await res.json());
    } catch (error) {
        console.log(error)
    }
}

async function getBalance(asset = ""){
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`
    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(query)
        .digest('hex');
    const qs = `?${query}&signature=${signature}`

    try {
        const options = {
            method: 'GET',
            headers: {'X-MBX-APIKEY': process.env.API_KEY}
        }
        const res = await fetch(`${process.env.URL_API}/v3/account${qs}` , options);
        const account = await res.json();
        const balances = account.balances
        const balance = balances.find(coin => coin.asset === asset.toUpperCase());
        return parseFloat(balance.free)
        
    } catch (error) {
        console.log(error)
    }
}

// important balances
// { asset: 'BTC', free: '0.95000000', locked: '0.00000000' }, (padrao é 1 btc)
// { asset: 'USDT', free: '13886.76150000', locked: '0.00000000' }, (padrao é 10000 usdt)
// { asset: 'BRL', free: '97.00000000', locked: '0.00000000' }