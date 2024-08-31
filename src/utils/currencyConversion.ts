// Static exchange rates (base currency: USD)
const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.904,
  KRW: 1337,
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error("Invalid currency");
  }

  return (amount / fromRate) * toRate;
};

export const getSupportedCurrencies = (): string[] => {
  return Object.keys(exchangeRates);
};
