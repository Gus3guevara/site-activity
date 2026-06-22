/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { Wallet, ArrowDownRight, ArrowUpRight, Calendar, Filter, HelpCircle, FileText, Trash2, Shield, PlusCircle } from 'lucide-react';

interface WalletAndRedemptionProps {
  balance: number;
  transactions: Transaction[];
  onAddTransaction: (type: 'aporte' | 'resgate', amount: number, description: string, customDate?: string) => boolean;
  onClearTransactions: () => void;
}

export function WalletAndRedemption({
  balance,
  transactions,
  onAddTransaction,
  onClearTransactions
}: WalletAndRedemptionProps) {
  // Redemption Form Inputs
  const [redeemAmountStr, setRedeemAmountStr] = useState<string>('5000');
  const [destinationAccount, setDestinationAccount] = useState<string>('Conta Corrente — Banco Itaú (Agência: 0192 / Conta: 48123-9)');
  const [redemptionDate, setRedemptionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [redemptionError, setRedemptionError] = useState<string>('');
  const [redemptionSuccess, setRedemptionSuccess] = useState<string>('');

  // Manual Deposit Inputs
  const [depositAmountStr, setDepositAmountStr] = useState<string>('10000');
  const [depositDate, setDepositDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const redeemAmount = parseFloat(redeemAmountStr) || 0;
  const depositAmount = parseFloat(depositAmountStr) || 0;

  // Filters State
  const [periodFilter, setPeriodFilter] = useState<'ALL' | '7_DAYS' | '30_DAYS' | 'THIS_MONTH' | 'CUSTOM'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'APORTE' | 'RESGATE'>('ALL');
  
  // Custom Date Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type Filter
      if (typeFilter === 'APORTE' && t.type !== 'aporte') return false;
      if (typeFilter === 'RESGATE' && t.type !== 'resgate') return false;

      // Period Filter
      const tDate = new Date(t.date);
      tDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);

      if (periodFilter === '7_DAYS') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (tDate < sevenDaysAgo) return false;
      } else if (periodFilter === '30_DAYS') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        if (tDate < thirtyDaysAgo) return false;
      } else if (periodFilter === 'THIS_MONTH') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        if (tDate < firstDayOfMonth) return false;
      } else if (periodFilter === 'CUSTOM') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0,0,0,0);
          if (tDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23,59,59,999);
          if (tDate > end) return false;
        }
      }

      return true;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // newest first
  }, [transactions, periodFilter, typeFilter, startDate, endDate]);

  // Filter stats
  const stats = useMemo(() => {
    let totalDeposits = 0;
    let totalRedemptions = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'aporte') {
        totalDeposits += t.amount;
      } else {
        totalRedemptions += t.amount;
      }
    });

    return {
      totalDeposits,
      totalRedemptions,
      netFlow: totalDeposits - totalRedemptions
    };
  }, [filteredTransactions]);

  // Actions
  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setRedemptionError('');
    setRedemptionSuccess('');

    if (redeemAmount <= 0) {
      setRedemptionError('O valor do resgate precisa ser maior do que zero.');
      return;
    }

    if (redeemAmount > balance) {
      setRedemptionError(`Saldo insuficiente. Seu saldo atual é de R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
      return;
    }

    const desc = `Resgate para: ${destinationAccount || 'Conta do Usuário'}`;
    const success = onAddTransaction('resgate', redeemAmount, desc, redemptionDate);
    
    if (success) {
      setRedemptionSuccess(`Resgate de R$ ${redeemAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} efetuado com sucesso!`);
      setRedeemAmountStr('');
      setTimeout(() => setRedemptionSuccess(''), 5000);
    } else {
      setRedemptionError('Ocorreu um erro ao processar o resgate.');
    }
  };

  const handleManualDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    onAddTransaction('aporte', depositAmount, 'Integralização / Depósito manual estruturado', depositDate);
    setDepositAmountStr('');
  };

  return (
    <div className="space-y-6" id="wallet-redemption-module">
      
      {/* Wallet Balance Header */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 text-white border border-teal-800/40 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-teal-500/20 rounded-lg text-teal-400 border border-teal-500/30">
                <Wallet className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-teal-200 tracking-wider uppercase">Minha Carteira Ativa de Investimentos</span>
            </div>
            
            <span className="text-xs text-slate-300">Saldo Disponível para Resgate</span>
            <span className="block text-4xl font-extrabold font-mono text-teal-50 mt-1">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Prompt quick summary info */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-6 text-xs backdrop-blur-sm self-stretch md:self-auto justify-around sm:justify-start">
            <div>
              <span className="text-slate-400 block mb-0.5">Total de Aportes</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                + R$ {transactions.filter(t => t.type === 'aporte').reduce((acc, t) => acc + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-l border-white/10 pl-6">
              <span className="text-slate-400 block mb-0.5">Total Resgatado</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                - R$ {transactions.filter(t => t.type === 'resgate').reduce((acc, t) => acc + t.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Redemption & Deposit actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Redemption Form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
              <ArrowDownRight className="w-5 h-5 text-amber-500 bg-amber-50 rounded p-0.5" />
              Solicitar Resgate de Recursos
            </h3>

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="redeemAmount">
                  Valor para Resgatar (R$)
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                    R$
                  </div>
                  <input
                    id="redeemAmount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold text-slate-800 pointer-events-auto"
                    value={redeemAmountStr}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setRedeemAmountStr(val);
                      }
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px]">
                  <span className="text-slate-400">Insira valores que respeitem seu saldo</span>
                  <button 
                    type="button" 
                    className="text-amber-600 font-bold hover:underline cursor-pointer"
                    onClick={() => setRedeemAmountStr(balance.toString())}
                  >
                    Resgatar Tudo (100%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="destination">
                  Dados de Destino (Conta Bancária)
                </label>
                <input
                  id="destination"
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-700 text-xs"
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="redDate">
                  Data Efetiva da Transação
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <input
                    id="redDate"
                    type="date"
                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-700 font-mono"
                    value={redemptionDate}
                    onChange={(e) => setRedemptionDate(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {redemptionError && (
                <p className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
                  {redemptionError}
                </p>
              )}

              {redemptionSuccess && (
                <p className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
                  {redemptionSuccess}
                </p>
              )}

              <button
                type="submit"
                id="btn-confirm-redeem"
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm py-2 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex justify-center items-center gap-2 pointer-events-auto"
                disabled={balance <= 0 || redeemAmount <= 0}
              >
                Autorizar Resgaste Provisório
              </button>
            </form>
          </div>

          {/* Quick Manual Deposit (To add capital for testing resgates) */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-200/60 pb-2 mb-3">
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              Adicionar Capital Adicional à Carteira
            </h4>
            
            <form onSubmit={handleManualDeposit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5" htmlFor="depAmount">Valor (R$)</label>
                  <input
                    id="depAmount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md font-semibold text-slate-800 font-mono pointer-events-auto"
                    value={depositAmountStr}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setDepositAmountStr(val);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5" htmlFor="depDate">Data</label>
                  <input
                    id="depDate"
                    type="date"
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md text-slate-700 font-mono"
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                id="btn-manual-deposit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 rounded-lg transition-colors pointer-events-auto"
              >
                Integralizar Dinheiro Manualmente
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Redemption Statement / Extrato no Período */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Filter controls header */}
            <div className="bg-slate-50 border-b border-slate-100 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-500" />
                  Extrato Consolidado por Período
                </span>
                
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button 
                    type="button" 
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors border border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded-lg pointer-events-auto"
                    onClick={onClearTransactions}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar Histórico
                  </button>
                </div>
              </div>

              {/* Filtering Selection Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-white p-3 rounded-xl border border-slate-150">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tipo de Evento</label>
                  <select
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md font-semibold text-slate-700 bg-slate-50"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'APORTE' | 'RESGATE')}
                  >
                    <option value="ALL">Todos os Eventos (Aportes & Resgates)</option>
                    <option value="APORTE">Apenas Aportes / Dinheiro Entrando</option>
                    <option value="RESGATE">Apenas Resgates / Recursos Sacados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Período de Seleção</label>
                  <select
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md font-semibold text-slate-700 bg-slate-50"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value as any)}
                  >
                    <option value="ALL">Todo o Histórico Vitalício</option>
                    <option value="7_DAYS">Últimos 7 dias</option>
                    <option value="30_DAYS">Últimos 30 dias</option>
                    <option value="THIS_MONTH">Este Mês Atual</option>
                    <option value="CUSTOM">Período Personalizado (Datas abaixo)</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Pickers */}
              {periodFilter === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-4 mt-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 animate-fade-in text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-amber-800 mb-1" htmlFor="pStart">Data Inicial</label>
                    <input
                      id="pStart"
                      type="date"
                      className="w-full px-2 py-1 border border-amber-200 rounded-md font-mono text-slate-700"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-amber-800 mb-1" htmlFor="pEnd">Data Final</label>
                    <input
                      id="pEnd"
                      type="date"
                      className="w-full px-2 py-1 border border-amber-200 rounded-md font-mono text-slate-700"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Current Filter Stats */}
            <div className="bg-slate-100 border-b border-slate-150 px-4 py-2.5 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-semibold uppercase font-mono">
              <div>
                <span>Total de Entradas:</span>
                <span className="block font-bold text-emerald-600 text-xs mt-0.5">
                  R$ {stats.totalDeposits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-x border-slate-200">
                <span>Total de Resgates:</span>
                <span className="block font-bold text-red-600 text-xs mt-0.5">
                  R$ {stats.totalRedemptions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span>Fluxo Líquido:</span>
                <span className={`block font-bold text-xs mt-0.5 ${stats.netFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  R$ {stats.netFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Statement Transaction Table List */}
            <div className="p-0">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <FileText className="w-12 h-12 text-slate-250 mx-auto mb-2" />
                  <p className="text-xs font-semibold">Nenhuma transação encontrada para os filtros selecionados.</p>
                  <p className="text-[10px] text-slate-400">Faça simulações, clique em integralizar ou crie depósitos e resgates.</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2.5">Data</th>
                        <th className="px-4 py-2.5">Tipo</th>
                        <th className="px-4 py-2.5">Descrição</th>
                        <th className="px-4 py-2.5 text-right font-mono">Valor (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {t.type === 'aporte' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-100">
                                <ArrowUpRight className="w-3 h-3" /> Aporte
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-100">
                                <ArrowDownRight className="w-3 h-3" /> Resgate
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-sans leading-relaxed tracking-tight break-all">
                            {t.description}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold font-mono whitespace-nowrap ${t.type === 'aporte' ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {t.type === 'aporte' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[10px] text-slate-400 font-medium">
              Histórico de auditoria interna da carteira nos termos das normas financeiras do BACEN.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
