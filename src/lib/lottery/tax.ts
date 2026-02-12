import { LOTTO_TICKET_PRICE } from "@/lib/constants";
import type { TaxResult } from "@/types/lottery";
export type { TaxResult };

const TAX_FREE_THRESHOLD = 2_000_000;
const LOWER_BRACKET_LIMIT = 300_000_000;
const LOWER_INCOME_RATE = 0.20;
const LOWER_LOCAL_RATE = 0.02;
const UPPER_INCOME_RATE = 0.30;
const UPPER_LOCAL_RATE = 0.03;

export function calculateLotteryTax(prizeAmount: number): TaxResult {
  if (prizeAmount <= 0) {
    return {
      prizeAmount: 0,
      ticketCost: 0,
      taxableAmount: 0,
      incomeTax: 0,
      localTax: 0,
      totalTax: 0,
      netAmount: 0,
      effectiveRate: 0,
    };
  }

  const ticketCost = LOTTO_TICKET_PRICE;
  const afterExpense = prizeAmount - ticketCost;

  if (afterExpense <= TAX_FREE_THRESHOLD) {
    return {
      prizeAmount,
      ticketCost,
      taxableAmount: 0,
      incomeTax: 0,
      localTax: 0,
      totalTax: 0,
      netAmount: prizeAmount,
      effectiveRate: 0,
    };
  }

  const taxableAmount = afterExpense;

  let incomeTax: number;
  let localTax: number;

  if (taxableAmount <= LOWER_BRACKET_LIMIT) {
    incomeTax = Math.floor(taxableAmount * LOWER_INCOME_RATE);
    localTax = Math.floor(taxableAmount * LOWER_LOCAL_RATE);
  } else {
    const lowerIncome = Math.floor(LOWER_BRACKET_LIMIT * LOWER_INCOME_RATE);
    const lowerLocal = Math.floor(LOWER_BRACKET_LIMIT * LOWER_LOCAL_RATE);
    const excess = taxableAmount - LOWER_BRACKET_LIMIT;
    const upperIncome = Math.floor(excess * UPPER_INCOME_RATE);
    const upperLocal = Math.floor(excess * UPPER_LOCAL_RATE);
    incomeTax = lowerIncome + upperIncome;
    localTax = lowerLocal + upperLocal;
  }

  const totalTax = incomeTax + localTax;
  const netAmount = prizeAmount - totalTax;
  const effectiveRate = prizeAmount > 0 ? (totalTax / prizeAmount) * 100 : 0;

  return {
    prizeAmount,
    ticketCost,
    taxableAmount,
    incomeTax,
    localTax,
    totalTax,
    netAmount,
    effectiveRate,
  };
}
