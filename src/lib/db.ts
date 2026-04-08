const STORAGE_KEY = "crypto-db";

const defaultData = {
  wallet: {
    balance: 100000,
  },
  holdings: [],
  trades: [],

  strategies: {
    risk: 0.1,
    minChange: 1,
  },
  bot: {
    active: false,
  }
};

export function getDB() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : defaultData;
}

export function saveDB(data: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

