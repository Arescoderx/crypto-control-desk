const WebSocket = require("ws");
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);
let sellPrice = 0;

const local_api = "http://localhost:5000"

const getTrades = async () =>{
    const res = await fetch(`${local_api}/trades`);
    if(!res.ok) return false;
    const trades = await res.json();
    return trades;
} 
const setTrades = async (obj = {a }) => {
    const options = {
        "Method" : "POST",
        "Content-Type" : "application/json",
        "BODY": JSON.stringify();
    }
    const res = await fetch(`${local_api}/trades`);
}

const strategy = async () => {
    // verificar se há compras anteriores no banco | ciclo em aberto
    let trades = []
    trades = await getTrades();
    if(trades.length == 0){
        return 
    }
}

ws.onmessage = (event) => {
    let obj = {a:"", p:""}
    obj = JSON.parse(event.data);
    console.clear();

    //strategy
    strategy();
}

