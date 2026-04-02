import { convertCurrency, Currency } from "./currencyConversion";
import type { Transaction, User } from "./storage";

export interface UserSettlementBalance {
  userId: string;
  paid: number;
  owed: number;
  net: number;
  paidCents: number;
  owedCents: number;
  netCents: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  amountCents: number;
}

export interface SettlementSummary {
  balances: Record<string, UserSettlementBalance>;
  settlements: Settlement[];
  totalPaid: number;
  totalPaidCents: number;
}

const toCents = (amount: number): number => Math.round(amount * 100);

const fromCents = (amountCents: number): number => amountCents / 100;

const getValidParticipantIds = (
  transaction: Transaction,
  users: User[]
): string[] => {
  const validUserIds = new Set(users.map((user) => user.id));
  const participantIds = transaction.participants ?? [];
  const uniqueParticipantIds = new Set(
    participantIds.filter((participantId) => validUserIds.has(participantId))
  );

  if (uniqueParticipantIds.size === 0) {
    return users.map((user) => user.id);
  }

  return users
    .filter((user) => uniqueParticipantIds.has(user.id))
    .map((user) => user.id);
};

const splitAmountCentsEvenly = (
  amountCents: number,
  participantCount: number
): number[] => {
  if (participantCount <= 0) {
    return [];
  }

  const baseShare = Math.floor(amountCents / participantCount);
  const remainder = amountCents % participantCount;

  return Array.from({ length: participantCount }, (_, index) => {
    return baseShare + (index < remainder ? 1 : 0);
  });
};

export const calculateSettlementSummary = ({
  users,
  transactions,
  currency,
}: {
  users: User[];
  transactions: Transaction[];
  currency: Currency;
}): SettlementSummary => {
  const balances = users.reduce<Record<string, UserSettlementBalance>>(
    (acc, user) => {
      acc[user.id] = {
        userId: user.id,
        paid: 0,
        owed: 0,
        net: 0,
        paidCents: 0,
        owedCents: 0,
        netCents: 0,
      };
      return acc;
    },
    {}
  );

  let totalPaidCents = 0;

  transactions.forEach((transaction) => {
    const convertedAmountCents = toCents(
      convertCurrency(transaction.amount, transaction.currency, currency)
    );

    totalPaidCents += convertedAmountCents;

    if (Object.prototype.hasOwnProperty.call(balances, transaction.userId)) {
      balances[transaction.userId].paidCents += convertedAmountCents;
    }

    const participantIds = getValidParticipantIds(transaction, users);
    const participantShares = splitAmountCentsEvenly(
      convertedAmountCents,
      participantIds.length
    );

    participantIds.forEach((participantId, index) => {
      balances[participantId].owedCents += participantShares[index];
    });
  });

  users.forEach((user) => {
    const balance = balances[user.id];
    balance.netCents = balance.paidCents - balance.owedCents;
    balance.paid = fromCents(balance.paidCents);
    balance.owed = fromCents(balance.owedCents);
    balance.net = fromCents(balance.netCents);
  });

  const creditors = users
    .map((user) => ({
      userId: user.id,
      name: user.name,
      remainingCreditCents: Math.max(balances[user.id].netCents, 0),
    }))
    .filter((creditor) => creditor.remainingCreditCents > 0);

  const debtors = users
    .map((user) => ({
      userId: user.id,
      name: user.name,
      remainingDebtCents: Math.max(-balances[user.id].netCents, 0),
    }))
    .filter((debtor) => debtor.remainingDebtCents > 0);

  const settlements: Settlement[] = [];
  let creditorIndex = 0;

  debtors.forEach((debtor) => {
    let remainingDebtCents = debtor.remainingDebtCents;

    while (remainingDebtCents > 0 && creditorIndex < creditors.length) {
      const creditor = creditors[creditorIndex];
      const settlementCents = Math.min(
        remainingDebtCents,
        creditor.remainingCreditCents
      );

      if (settlementCents > 0) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: fromCents(settlementCents),
          amountCents: settlementCents,
        });
      }

      remainingDebtCents -= settlementCents;
      creditor.remainingCreditCents -= settlementCents;

      if (creditor.remainingCreditCents === 0) {
        creditorIndex += 1;
      }
    }
  });

  return {
    balances,
    settlements,
    totalPaid: fromCents(totalPaidCents),
    totalPaidCents,
  };
};
