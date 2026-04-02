import { calculateSettlementSummary } from "./settlements";
import { Currency } from "./currencyConversion";
import type { Category, Transaction, User } from "./storage";

const users: User[] = [
  { id: "a", name: "Alice" },
  { id: "b", name: "Bob" },
  { id: "c", name: "Cara" },
  { id: "d", name: "Dan" },
];

const createTransaction = (
  overrides: Partial<Transaction> & Pick<Transaction, "userId" | "amount">
): Transaction => ({
  id: Date.now(),
  amount: overrides.amount,
  currency: (overrides.currency ?? "EUR") as Currency,
  message: overrides.message ?? "",
  details: overrides.details ?? "",
  userId: overrides.userId,
  datetime: overrides.datetime ?? "2026-03-31T12:00:00.000Z",
  category: overrides.category ?? ("Other" as Category),
  participants: overrides.participants ?? [],
});

describe("calculateSettlementSummary", () => {
  it("splits a shared expense across all selected participants", () => {
    const summary = calculateSettlementSummary({
      users: users.slice(0, 3),
      transactions: [
        createTransaction({
          userId: "a",
          amount: 90,
          participants: ["a", "b", "c"],
        }),
      ],
      currency: "EUR",
    });

    expect(summary.settlements).toEqual([
      { from: "Bob", to: "Alice", amount: 30, amountCents: 3000 },
      { from: "Cara", to: "Alice", amount: 30, amountCents: 3000 },
    ]);
  });

  it("only charges the participants who actually joined the expense", () => {
    const summary = calculateSettlementSummary({
      users: users.slice(0, 3),
      transactions: [
        createTransaction({
          userId: "a",
          amount: 90,
          participants: ["a", "b"],
        }),
      ],
      currency: "EUR",
    });

    expect(summary.balances.a.netCents).toBe(4500);
    expect(summary.balances.b.netCents).toBe(-4500);
    expect(summary.balances.c.netCents).toBe(0);
    expect(summary.settlements).toEqual([
      { from: "Bob", to: "Alice", amount: 45, amountCents: 4500 },
    ]);
  });

  it("defaults missing participants to all group members for legacy transactions", () => {
    const summary = calculateSettlementSummary({
      users: users.slice(0, 3),
      transactions: [
        createTransaction({
          userId: "a",
          amount: 90,
          participants: [],
        }),
      ],
      currency: "EUR",
    });

    expect(summary.settlements).toEqual([
      { from: "Bob", to: "Alice", amount: 30, amountCents: 3000 },
      { from: "Cara", to: "Alice", amount: 30, amountCents: 3000 },
    ]);
  });

  it("does not overpay a creditor when multiple debtors settle in sequence", () => {
    const summary = calculateSettlementSummary({
      users,
      transactions: [
        createTransaction({
          id: 1,
          userId: "c",
          amount: 50,
          participants: ["a", "b", "c", "d"],
        }),
        createTransaction({
          id: 2,
          userId: "d",
          amount: 70,
          participants: ["a", "b", "c", "d"],
        }),
      ],
      currency: "EUR",
    });

    expect(summary.settlements).toEqual([
      { from: "Alice", to: "Cara", amount: 20, amountCents: 2000 },
      { from: "Alice", to: "Dan", amount: 10, amountCents: 1000 },
      { from: "Bob", to: "Dan", amount: 30, amountCents: 3000 },
    ]);
  });

  it("keeps totals balanced when a split leaves a remainder cent", () => {
    const summary = calculateSettlementSummary({
      users: users.slice(0, 3),
      transactions: [
        createTransaction({
          userId: "a",
          amount: 10,
          participants: ["a", "b", "c"],
        }),
      ],
      currency: "EUR",
    });

    expect(summary.totalPaidCents).toBe(1000);
    expect(
      Object.values(summary.balances).reduce(
        (sum, balance) => sum + balance.owedCents,
        0
      )
    ).toBe(1000);
    expect(
      Object.values(summary.balances).reduce(
        (sum, balance) => sum + balance.netCents,
        0
      )
    ).toBe(0);
    expect(summary.settlements).toEqual([
      { from: "Bob", to: "Alice", amount: 3.33, amountCents: 333 },
      { from: "Cara", to: "Alice", amount: 3.33, amountCents: 333 },
    ]);
  });

  it("uses the selected currency before splitting the expense", () => {
    const summary = calculateSettlementSummary({
      users: users.slice(0, 2),
      transactions: [
        createTransaction({
          userId: "a",
          amount: 10,
          currency: "USD",
          participants: ["a", "b"],
        }),
      ],
      currency: "EUR",
    });

    expect(summary.totalPaidCents).toBe(904);
    expect(summary.settlements).toEqual([
      { from: "Bob", to: "Alice", amount: 4.52, amountCents: 452 },
    ]);
  });
});
