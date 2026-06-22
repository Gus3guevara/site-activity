/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string; // ISO string 2026-06-16T...
  type: 'aporte' | 'resgate';
  amount: number;
  description: string;
}

export interface PropertyRegion {
  id: string;
  name: string;
  state: string;
  avgPricePerM2: number;
  description: string;
}

export interface InvestmentResult {
  month: number;
  totalInvested: number;
  totalInterest: number;
  totalValue: number;
}

export interface AmortizationRow {
  period: number;
  payment: number;
  interest: number;
  amortization: number;
  outstandingBalance: number;
}
