import React from "react";
import { Currency, getSupportedCurrencies } from "../utils/currencyConversion";

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  className,
}) => {
  const currencies = getSupportedCurrencies();

  return (
    <select
      value={selectedCurrency}
      onChange={(e) => onCurrencyChange(e.target.value as Currency)}
      className={`p-2 border rounded ${className}`}
    >
      {currencies.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
