// wallet
const getCaixaValue = async() => {
    const res = await fetch(`${url}/caixa`);
    if(!res.ok) throw new Error(await res.json());
    let wallet = []
    wallet = await res.json();
    return wallet[0].value;
}
const setNewValue = async (value = 0) => {
    const options = {
        method: "PATCH",
        headers : {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({"value": value})
    }
    const res = await fetch(`${url}/wallet/1`, options);
    if(!res.ok) throw new Error(await res.json());
    console.log("Preço da carteira atualizado! ", value);
}

// prices
const getPrices = async () =>{
    const res = await fetch(`${url}/prices`);
    if(!res.ok) return false;
    const prices = await res.json();
    return prices;
} 
const setPrice = async (obj = {a:''}) => {
    const formatedObj = {price: obj.a}
    const options = {
        "method" : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        "body": JSON.stringify(formatedObj)
    }
    const res = await fetch(`${url}/prices`, options);
    if(!res.ok) throw new Error(await res.json());
    console.log("Novo preço registrado!", obj.a);
}

const updateAtivo = async(data = {qtd : 1.0, symbol:"BTCUSDT"}) => {
    const options = {
        "method": PUT,
        "headers" : {
            "Content-Type" : "application/json"
        },
        "body" : JSON.stringify(data)
    }
    const res = await fetch(`${url}/wallet`);
    if(!res.ok) throw new Error(await res.json());
    console.log("Wallet atualizado");
}

const checkValue = async(price = 0) =>{
    const walletValueString = await getWalletValue();
    let walletValue = parseFloat(walletValueString);
    if(parseFloat(price) <= walletValue){
        // comprar
        let newWalletValue = walletValue - price
        setNewValue(newWalletValue);

        // verificar quantidade
        updateAtivo(1, "BTCUSDT");
    }
}

// para saber a estrategia do user ( conservador, moderado, agressivo ) é necessário consultar metodo no banco
    // será necessário uma tabela  

const strategy = async (obj = {a:''}) => {
    // verificar se há compras anteriores no banco | ciclo em aberto
    let prices = await getPrices();
    if(prices.length == 0){
        // verificar se há valor em carteira para comprar
        checkValue(obj.a);
        // setPrice(obj);
    }
}

class conservador {
    valor_maximo_compra = 100;
    dif_ultimaCompra_e_queda = 5;
    lucro_para_vender_parcial_ = "12%";
    porcentagem_minima_para_reentrada_ = "6%"

}