const url = process.env.LOCAL_API;
function useTrades(){
    const getTrades = async () =>{
        const res = await fetch(`${url}/trades`);
        if(!res.ok) return false;
        const trades = await res.json();
        return trades;
    } 
    return {getTrades}
}

module.exports = useTrades;

