/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AmortizationRow } from '../types';
import { Calculator, HelpCircle, ArrowRight, ShieldCheck, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';

export function FinancingCalculator() {
  // Inputs
  const [pmtValue, setPmtValue] = useState<number>(1500); // Monthly payment (Valor da Parcela)
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<number>(1.2); // % per month (Taxa de Juros Mensal)
  const [installments, setInstallments] = useState<number>(36); // Number of installments (Nº de Parcelas)
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [financeType, setFinanceType] = useState<'PRICE' | 'SAC'>('PRICE');

  // Math computations
  const calculation = useMemo(() => {
    const i = monthlyInterestRate / 100;
    const n = installments;

    if (i <= 0 || n <= 0) {
      return {
        presentValue: pmtValue * n,
        totalInterest: 0,
        totalPaid: pmtValue * n,
        rows: []
      };
    }

    // For Tabela Price (Annuity Formulas)
    // VP = PMT * ( (1 - (1 + i)^-n) / i )
    // PMT is constant.
    const discountFactor = (1 - Math.pow(1 + i, -n)) / i;
    const vpPrice = pmtValue * discountFactor;
    const totalPaidPrice = pmtValue * n;
    const totalInterestPrice = totalPaidPrice - vpPrice;

    // Build Amortization matrix
    const rowsPrice: AmortizationRow[] = [];
    let balancePrice = vpPrice;

    for (let p = 1; p <= n; p++) {
      const interest = balancePrice * i;
      const amortization = pmtValue - interest;
      balancePrice = Math.max(0, balancePrice - amortization);

      rowsPrice.push({
        period: p,
        payment: pmtValue,
        interest,
        amortization,
        outstandingBalance: balancePrice
      });
    }

    // For Tabela SAC (Amortization is constant)
    // In SAC: VP is the target loan amount. If we specify PMT as the first/reference payment:
    // First installment PMT_1 = (VP / n) + VP * i.
    // Solving for VP: PMT_1 = VP * (1/n + i)  => VP = PMT_1 / (1/n + i)
    const constantAmortization = pmtValue / (1 + (n * i)); // Wait, standard SAC: First installment PMT_1 = (Principal / n) + Principal * i = Principal * (1/n + i).
    // Let's solve VP for SAC: VP = PMT / (1/n + i) (where PMT is the first payment)
    const vpSac = pmtValue / (1 / n + i);
    const sacConstantAmort = vpSac / n;
    const rowsSac: AmortizationRow[] = [];
    let balanceSac = vpSac;
    let totalPaidSac = 0;

    for (let p = 1; p <= n; p++) {
      const interest = balanceSac * i;
      const payment = sacConstantAmort + interest;
      balanceSac = Math.max(0, balanceSac - sacConstantAmort);
      totalPaidSac += payment;

      rowsSac.push({
        period: p,
        payment,
        interest,
        amortization: sacConstantAmort,
        outstandingBalance: balanceSac
      });
    }

    if (financeType === 'PRICE') {
      return {
        presentValue: vpPrice,
        totalInterest: totalInterestPrice,
        totalPaid: totalPaidPrice,
        rows: rowsPrice
      };
    } else {
      return {
        presentValue: vpSac,
        totalInterest: totalPaidSac - vpSac,
        totalPaid: totalPaidSac,
        rows: rowsSac
      };
    }

  }, [pmtValue, monthlyInterestRate, installments, financeType]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="fin-calc-module">
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Financiamento e Valor Presente (VP)</h2>
            <p className="text-xs text-slate-400">Descubra o valor à vista equivalente baseado nas parcelas futuras</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest block">Matemática</span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-400">Desconto Financeiro</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Section Inputs */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Parâmetros do Financiamento</h3>

            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                type="button"
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all ${
                  financeType === 'PRICE'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setFinanceType('PRICE')}
              >
                Tabela Price (Parcelas Fixas)
              </button>
              <button
                type="button"
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all ${
                  financeType === 'SAC'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setFinanceType('SAC')}
              >
                Tabela SAC (Parcelas Decrescentes)
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="pmtValue">
                {financeType === 'PRICE' ? 'Valor da Parcela Fixa (PMT)' : 'Valor da Primeira Parcela (PMT)'}
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                  R$
                </div>
                <input
                  id="pmtValue"
                  type="number"
                  min="1"
                  step="50"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800 transition-colors"
                  value={pmtValue}
                  onChange={(e) => setPmtValue(Math.max(1, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="monthlyRate">
                  Taxa do Financiamento
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <input
                    id="monthlyRate"
                    type="number"
                    min="0.01"
                    step="0.05"
                    className="w-full pr-12 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800 transition-colors"
                    value={monthlyInterestRate}
                    onChange={(e) => setMonthlyInterestRate(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  />
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-xs font-semibold select-none uppercase">
                    % a.m.
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Taxa Nominal Mensal</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="installments">
                  Total de Parcelas
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <input
                    id="installments"
                    type="number"
                    min="1"
                    max="420"
                    className="w-full pr-12 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800 transition-colors"
                    value={installments}
                    onChange={(e) => setInstallments(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono uppercase">
                    meses
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Prazo de Resgate/Amortização</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100/50 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Como funciona o cálculo do VP?
              </h4>
              <p className="text-xs text-emerald-700 leading-normal">
                Esse simulador traz parcelas futuras para o momento atual. Ele descobre qual é o 
                <strong> valor real à vista do bem financiado</strong>, descontando a taxa de juros exigida. 
                Se você comprar esse bem à vista por um valor menor que o VP calculado, a compra à vista é vantajosa.
              </p>
            </div>
          </div>

          {/* Section Results details */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4">Resultado da Análise à Vista</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 hover:bg-slate-100/30 transition-colors">
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block mb-1">
                    VALOR PRESENTE (VP) • VALOR À VISTA DO BEM
                  </span>
                  <span className="text-2xl font-black text-slate-800 font-mono block">
                    R$ {calculation.presentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Este é o limite máximo que compensa pagar pelo ativo à vista.
                  </p>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                  <span className="text-[10px] text-amber-700 font-bold tracking-wider uppercase block mb-1">
                    PESO DOS JUROS NO FINANCIAMENTO
                  </span>
                  <span className="text-xl font-extrabold text-amber-800 font-mono block">
                    R$ {calculation.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <p className="text-xs text-amber-600 mt-1">
                    Corresponde a <strong>{((calculation.totalInterest / calculation.totalPaid) * 100).toFixed(1)}%</strong> do custo total do contrato.
                  </p>
                </div>
              </div>

              {/* Summary table list details */}
              <div className="border border-slate-150 rounded-xl overflow-hidden bg-white mb-4">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-150 flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Resumo do Contrato</span>
                  <span className="text-slate-600 font-mono">Tabela {financeType}</span>
                </div>
                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Soma Nominal de Todas as Parcelas:</span>
                    <strong className="text-slate-700 font-mono">R$ {calculation.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500">Valor Descontado dos Juros (Financiamento Limpo):</span>
                    <strong className="text-emerald-600 font-mono">R$ {calculation.presentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500">Número de parcelas:</span>
                    <span className="font-semibold text-slate-700">{installments}x de R$ {pmtValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {financeType === 'SAC' && 'decrescentes'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Amortization table */}
            <div className="pt-2">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors pointer-events-auto"
                onClick={() => setShowAmortization(!showAmortization)}
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Ver Cronograma de Amortização das Parcelas</span>
                </div>
                {showAmortization ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
            </div>

          </div>
        </div>

        {/* Amortization Schedule Table Drawer */}
        {showAmortization && (
          <div className="mt-6 border border-slate-150 rounded-xl overflow-hidden animate-fade-in">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Período (Nº)</th>
                    <th className="px-4 py-3 text-right">Parcela (R$)</th>
                    <th className="px-4 py-3 text-right">Juros Proporcionais (R$)</th>
                    <th className="px-4 py-3 text-right">Amortização de Saldo (R$)</th>
                    <th className="px-4 py-3 text-right">Saldo Devedor Restante (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {/* Row Initial zero */}
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-2 font-semibold">0</td>
                    <td className="px-4 py-2 text-right text-slate-400">—</td>
                    <td className="px-4 py-2 text-right text-slate-400">—</td>
                    <td className="px-4 py-2 text-right text-slate-400">—</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-700">R$ {calculation.presentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  
                  {calculation.rows.map((row) => (
                    <tr key={row.period} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-bold">{row.period}</td>
                      <td className="px-4 py-2 text-right font-medium text-slate-700">R$ {row.payment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-right text-rose-600">- R$ {row.interest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-right text-emerald-600">+ R$ {row.amortization.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-right text-slate-600">R$ {row.outstandingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 text-center text-[10px] text-slate-400">
              Corresponde à projeção financeira baseada na planilha nominal {financeType === 'PRICE' ? 'Price com amortização em escala' : 'SAC com amortização linear de base'}.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
