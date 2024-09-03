// Static exchange rates (base currency: USD)
const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.904,
  KRW: 1337,
};

export type Currency = "USD" | "EUR" | "KRW";

export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number => {
  if (fromCurrency === toCurrency) return amount;
  console.log(fromCurrency, toCurrency);
  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];

  if (!fromRate || !toRate) {
    throw new Error("Invalid currency");
  }

  return (amount / fromRate) * toRate;
};

export const getSupportedCurrencies = (): Currency[] => {
  return Object.keys(exchangeRates) as Currency[];
};
