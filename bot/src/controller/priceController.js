const url = process.env.LOCAL_API;

const getPrices = async () =>{
    const res = await fetch(`${url}/prices`);
    if(!res.ok) return false;
    const trades = await res.json();
    return trades;
} 
const setPrice = async (obj = {a:''}) => {
    const formatedObj = {price: obj.a}
    const options = {
        "method" : "POST",
        "Content-Type" : "application/json",
        "body": JSON.stringify(formatedObj)
    }
    const res = await fetch(`${url}/prices`, options);
    if(!res.ok) throw new Error(await res.json());
    console.log("Novo preço registrado!", obj.a);
}


module.exports = {
    getPrices,setPrice
};