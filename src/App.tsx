/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaction } from './types';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { FinancingCalculator } from './components/FinancingCalculator';
import { PropertyValuation } from './components/PropertyValuation';
import { WalletAndRedemption } from './components/WalletAndRedemption';
import { DotnetNextjsExport } from './components/DotnetNextjsExport';
import { 
  PiggyBank, 
  Home, 
  TrendingUp, 
  Wallet, 
  Code, 
  ChevronRight, 
  HandCoins, 
  ArrowUpRight, 
  Calculator,
  BriefcaseBusiness,
  Coins
} from 'lucide-react';

// Predefined mock transactional history (Current date is June 16, 2026)
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    date: '2026-05-10', // Last Month
    type: 'aporte',
    amount: 50000,
    description: 'Aporte de Capital Inicial — Transferência TED'
  },
  {
    id: 't-2',
    date: '2026-05-25', // Last Month
    type: 'aporte',
    amount: 25000,
    description: 'Aporte de Complementação de Portfólio'
  },
  {
    id: 't-3',
    date: '2026-06-02', // This Month
    type: 'aporte',
    amount: 15400,
    description: 'Integralização de Lucros Obtidos em Tesouro Selic'
  },
  {
    id: 't-4',
    date: '2026-06-08', // This Month
    type: 'resgate',
    amount: 12000,
    description: 'Resgate Parcial Autônomo para Caixa Geral'
  },
  {
    id: 't-5',
    date: '2026-06-12', // This Month (Recently)
    type: 'resgate',
    amount: 3400,
    description: 'Resgate de Emergência — Provisão Tributária ISS'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'INVESTMENT' | 'FINANCING' | 'PROPERTY' | 'WALLET' | 'EXPORT'>('INVESTMENT');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Derivate balance in full synchronicity with transaction history
  const activeBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === 'aporte' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  // Handler to inject deposits/redemptions securely
  const handleAddTransaction = (
    type: 'aporte' | 'resgate',
    amount: number,
    description: string,
    customDate?: string
  ): boolean => {
    if (type === 'resgate' && amount > activeBalance) {
      return false; // validation fail
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: customDate || new Date().toISOString().split('T')[0],
      type,
      amount,
      description
    };

    setTransactions(prev => [...prev, newTx]);
    return true;
  };

  const handleClearTransactions = () => {
    setTransactions([]);
  };

  // Callback to apply simulation directly to portfolio balance
  const handleAddInvestmentFutureValue = (amount: number, description: string) => {
    // Uses current date
    handleAddTransaction('aporte', amount, description);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased selection:bg-sky-500/20 selection:text-sky-900 flex flex-col">
      
      {/* Header section with brand and active summary */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16.5">
            
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <div className="p-2.2 bg-sky-600 rounded-xl text-white shadow-xs">
                <Coins className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-md font-bold text-slate-900 tracking-tight leading-none">
                  Simulador Financeiro Integral
                </h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                  Ambiente de Simulação e Exportação .NET & React
                </span>
              </div>
            </div>

            {/* Quick overview of reactive wallet balance */}
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 flex items-center gap-2.5">
                <div className="p-1.5 bg-teal-50 rounded-lg border border-teal-200 text-teal-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Carteira Ativa</span>
                  <strong className="text-xs font-mono font-black text-slate-700 block mt-0.5">
                    R$ {activeBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="sm:hidden text-right">
                  <strong className="text-xs font-mono font-extrabold text-slate-700 block">
                    R$ {activeBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs - Clean, responsive design */}
        <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-150">
          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all pointer-events-auto ${
              activeTab === 'INVESTMENT'
                ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('INVESTMENT')}
          >
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <span>Simulador de Investimentos (VF)</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all pointer-events-auto ${
              activeTab === 'PROPERTY'
                ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('PROPERTY')}
          >
            <Home className="w-4 h-4 text-violet-500" />
            <span>Avaliação de Imóvel (m²)</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all pointer-events-auto ${
              activeTab === 'FINANCING'
                ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('FINANCING')}
          >
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span>VP do Financiamento</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all pointer-events-auto ${
              activeTab === 'WALLET'
                ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
            }`}
            onClick={() => setActiveTab('WALLET')}
          >
            <HandCoins className="w-4 h-4 text-amber-500" />
            <span>Carteira & Resgates {transactions.length > 0 && `(${transactions.length})`}</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all pointer-events-auto ml-auto ${
              activeTab === 'EXPORT'
                ? 'bg-slate-900 text-white border-slate-900 font-extrabold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
            }`}
            onClick={() => setActiveTab('EXPORT')}
          >
            <Code className="w-4 h-4 text-indigo-500" />
            <span>Ver Código C# & Next.js</span>
          </button>
        </div>

        {/* Tab content renderer dynamically component inside custom micro-animations */}
        <div className="space-y-6">
          {activeTab === 'INVESTMENT' && (
            <div className="animate-fade-in">
              <InvestmentCalculator onAddFunds={handleAddInvestmentFutureValue} />
            </div>
          )}

          {activeTab === 'PROPERTY' && (
            <div className="animate-fade-in">
              <PropertyValuation />
            </div>
          )}

          {activeTab === 'FINANCING' && (
            <div className="animate-fade-in">
              <FinancingCalculator />
            </div>
          )}

          {activeTab === 'WALLET' && (
            <div className="animate-fade-in">
              <WalletAndRedemption 
                balance={activeBalance} 
                transactions={transactions} 
                onAddTransaction={handleAddTransaction}
                onClearTransactions={handleClearTransactions}
              />
            </div>
          )}

          {activeTab === 'EXPORT' && (
            <div className="animate-fade-in">
              <DotnetNextjsExport />
            </div>
          )}
        </div>

      </main>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-700">Simulador de Investimentos e Financiamentos</p>
            <p className="mt-0.5 text-[11px]">Desenvolvido com fundamentos de engenharia de software e matemática financeira corporativa.</p>
          </div>
          <div className="flex gap-4 font-semibold font-mono text-[10px] uppercase text-slate-500">
            <span>React App</span>
            <span className="text-slate-300">•</span>
            <span>REST API Ready</span>
            <span className="text-slate-300">•</span>
            <span>.NET 8 Compatible</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
