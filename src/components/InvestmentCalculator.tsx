/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { InvestmentResult } from '../types';
import { TrendingUp, Plus, Percent, Calendar, DollarSign, RefreshCw, BarChart2, Info } from 'lucide-react';

interface InvestmentCalculatorProps {
  onAddFunds: (amount: number, description: string) => void;
}

export function InvestmentCalculator({ onAddFunds }: InvestmentCalculatorProps) {
  // Inputs
  const [initialValue, setInitialValue] = useState<number>(10000);
  const [monthlyValue, setMonthlyValue] = useState<number>(500);
  const [interestRate, setInterestRate] = useState<number>(11.5); // % per year (Selic average area)
  const [periodMonths, setPeriodMonths] = useState<number>(24); // 2 years
  const [rateType, setRateType] = useState<'annual' | 'monthly'>('annual');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Calculate month by month simulation
  const simulationData = useMemo(() => {
    const data: InvestmentResult[] = [];
    const r = rateType === 'annual' 
      ? Math.pow(1 + interestRate / 100, 1 / 12) - 1 
      : interestRate / 100;

    let balance = initialValue;
    let investedAccumulated = initialValue;
    
    // Add Month 0
    data.push({
      month: 0,
      totalInvested: investedAccumulated,
      totalInterest: 0,
      totalValue: balance
    });

    for (let m = 1; m <= periodMonths; m++) {
      const interestEarned = balance * r;
      balance = balance * (1 + r) + monthlyValue;
      investedAccumulated += monthlyValue;

      data.push({
        month: m,
        totalInvested: investedAccumulated,
        totalInterest: balance - investedAccumulated,
        totalValue: balance
      });
    }

    return data;
  }, [initialValue, monthlyValue, interestRate, periodMonths, rateType]);

  const finalResult = simulationData[simulationData.length - 1];

  const handleApplyToWallet = () => {
    onAddFunds(
      finalResult.totalValue, 
      `Simulação VF: Cap. Inicial R$ ${initialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + Aportes`
    );
    setSuccessMessage('Valor atualizado de R$ ' + finalResult.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' depositado com sucesso na sua carteira!');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // SVG Chart Dimensions & Computations
  const chartHeight = 220;
  const chartWidth = 500;
  const paddingX = 45;
  const paddingY = 25;

  const chartPaths = useMemo(() => {
    if (simulationData.length === 0) return { invested: '', total: '' };

    const maxVal = Math.max(...simulationData.map(d => d.totalValue)) * 1.05 || 1;
    const minVal = 0;
    const len = simulationData.length;

    const pointsInvested: string[] = [];
    const pointsTotal: string[] = [];

    simulationData.forEach((d, idx) => {
      const x = paddingX + (idx / (len - 1)) * (chartWidth - paddingX * 2);
      // invert Y coordinate for SVG
      const yInvested = chartHeight - paddingY - ((d.totalInvested - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
      const yTotal = chartHeight - paddingY - ((d.totalValue - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);

      pointsInvested.push(`${x},${yInvested}`);
      pointsTotal.push(`${x},${yTotal}`);
    });

    // Make paths
    return {
      invested: pointsInvested.length > 0 ? `M ${pointsInvested.join(' L ')}` : '',
      total: pointsTotal.length > 0 ? `M ${pointsTotal.join(' L ')}` : '',
      investedArea: pointsInvested.length > 0 ? `M ${paddingX},${chartHeight - paddingY} L ${pointsInvested.join(' L ')} L ${chartWidth - paddingX},${chartHeight - paddingY} Z` : '',
      totalArea: pointsTotal.length > 0 ? `M ${paddingX},${chartHeight - paddingY} L ${pointsTotal.join(' L ')} L ${chartWidth - paddingX},${chartHeight - paddingY} Z` : '',
      maxVal,
      pointsTotal
    };
  }, [simulationData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="inv-calc-module">
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Simulação de Valor Futuro (VF)</h2>
            <p className="text-xs text-slate-400">Projete e dimensione o rendimento de capitais no tempo</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest block">Metodologia</span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-sky-400">Juros Compostos</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Dados de Entrada</h3>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="initialValue">
              Capital Inicial (VP)
            </label>
            <div className="relative rounded-lg shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                R$
              </div>
              <input
                id="initialValue"
                type="number"
                min="0"
                step="100"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-800 transition-colors"
                value={initialValue}
                onChange={(e) => setInitialValue(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="monthlyValue">
              Aporte Mensal Adicional
            </label>
            <div className="relative rounded-lg shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                R$
              </div>
              <input
                id="monthlyValue"
                type="number"
                min="0"
                step="50"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-800 transition-colors"
                value={monthlyValue}
                onChange={(e) => setMonthlyValue(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="interestRate">
                Taxa de Juros (%)
              </label>
              <div className="relative rounded-lg shadow-xs">
                <input
                  id="interestRate"
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full pr-8 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-800 transition-colors"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-sm">
                  %
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="ratePeriod">
                Período da Taxa
              </label>
              <select
                id="ratePeriod"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white font-medium text-slate-700 transition-colors"
                value={rateType}
                onChange={(e) => setRateType(e.target.value as 'annual' | 'monthly')}
              >
                <option value="annual">ao Ano (a.a.)</option>
                <option value="monthly">ao Mês (a.m.)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="periodMonths">
              Prazo Complementar
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`py-1.5 text-xs font-semibold rounded-md transition-all border ${
                  periodMonths % 12 === 0
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setPeriodMonths(Math.max(12, Math.round(periodMonths / 12) * 12))}
              >
                Múltiplo de Anos
              </button>
              <div className="relative rounded-lg shadow-xs">
                <input
                  id="periodMonths"
                  type="number"
                  min="1"
                  max="480"
                  className="w-full pr-12 pl-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-medium text-slate-800 transition-colors"
                  value={periodMonths}
                  onChange={(e) => setPeriodMonths(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-xs font-semibold uppercase">
                  meses
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-700 mb-0.5">Equivalência de Juros</p>
              Capitalização mensal contínua. 
              {rateType === 'annual' ? (
                <span> Uma taxa anual de <strong>{interestRate}%</strong> equivale a aproximadamente <strong>{((Math.pow(1 + interestRate/100, 1/12) - 1) * 100).toFixed(4)}%</strong> ao mês.</span>
              ) : (
                <span> Uma taxa mensal de <strong>{interestRate}%</strong> equivale a aproximadamente <strong>{((Math.pow(1 + interestRate/100, 12) - 1) * 100).toFixed(4)}%</strong> ao ano.</span>
              )}
            </div>
          </div>
        </div>

        {/* Calculations Results & Graphics */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4">Resultado Projetado (No Final do Período)</h3>
            
            {/* Cards metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase mb-1">Total Investido</span>
                <span className="text-sm font-semibold text-slate-700 block">
                  R$ {finalResult.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Capital + Aportes</span>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                <span className="text-[10px] text-emerald-600 font-semibold tracking-wider block uppercase mb-1">Juros Rendidos</span>
                <span className="text-sm font-semibold text-emerald-700 block">
                  + R$ {finalResult.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-500 block mt-1">
                  {((finalResult.totalInterest / finalResult.totalInvested) * 100).toFixed(1)}% de retorno
                </span>
              </div>

              <div className="bg-sky-500/5 border border-sky-100 rounded-xl p-4">
                <span className="text-[10px] text-sky-700 font-semibold tracking-wider block uppercase mb-1">Valor Futuro Bruto (VF)</span>
                <span className="text-base font-bold text-sky-800 block">
                  R$ {finalResult.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-sky-600 block mt-1">Acúmulo total</span>
              </div>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 relative">
              <span className="absolute top-3 left-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-sky-600" /> Histórico de Acumulação no Tempo
              </span>

              <div className="w-full flex justify-center mt-5">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto select-none" style={{ maxHeight: '200px' }}>
                  {/* Grid Lines */}
                  <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1={paddingX} y1={(chartHeight) / 2} x2={chartWidth - paddingX} y2={(chartHeight) / 2} stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Y Axis Reference Labels */}
                  <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                    {chartPaths.maxVal ? `R$ ${(chartPaths.maxVal / 1000).toFixed(0)}k` : 'Max'}
                  </text>
                  <text x={paddingX - 8} y={(chartHeight) / 2 + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                    {chartPaths.maxVal ? `R$ ${(chartPaths.maxVal / 2000).toFixed(0)}k` : 'Med'}
                  </text>
                  <text x={paddingX - 8} y={chartHeight - paddingY + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                    R$ 0
                  </text>

                  {/* Areas underneath */}
                  <path d={chartPaths.totalArea} fill="url(#totalGrad)" opacity="0.12" />
                  <path d={chartPaths.investedArea} fill="url(#investedGrad)" opacity="0.15" />

                  {/* Lines paths */}
                  <path d={chartPaths.invested} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  <path d={chartPaths.total} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Start/End Node Dots */}
                  {chartPaths.pointsTotal.length > 0 && (
                    <>
                      {/* First node */}
                      <circle cx={paddingX} cy={chartHeight - paddingY - ((simulationData[0].totalValue) / (chartPaths.maxVal || 1)) * (chartHeight - paddingY * 2)} r="4" fill="#0ea5e9" stroke="#fff" strokeWidth="1.5" />
                      {/* Last node */}
                      <circle cx={chartWidth - paddingX} cy={chartHeight - paddingY - ((simulationData[simulationData.length-1].totalValue) / (chartPaths.maxVal || 1)) * (chartHeight - paddingY * 2)} r="5" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
                    </>
                  )}

                  {/* Legend Labels on X Axis */}
                  <text x={paddingX} y={chartHeight - paddingY + 16} textAnchor="start" className="text-[10px] font-semibold fill-slate-500">Mês 0</text>
                  <text x={chartWidth / 2} y={chartHeight - paddingY + 16} textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">Metade ({Math.floor(periodMonths / 2)}m)</text>
                  <text x={chartWidth - paddingX} y={chartHeight - paddingY + 16} textAnchor="end" className="text-[10px] font-semibold fill-slate-500">Prazo ({periodMonths}m)</text>

                  {/* Definitions of Gradients */}
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Legend indicators */}
              <div className="flex items-center justify-center gap-6 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block rounded-xs"></span>
                  <span className="text-slate-500 font-medium">Histórico Total Investido</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-sky-500 inline-block rounded-xs"></span>
                  <span className="text-slate-700 font-semibold">Valor Futuro Bruto acumulado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium animate-fade-in flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                {successMessage}
              </div>
            )}
            
            <button
              id="btn-apply-to-wallet"
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all group pointer-events-auto"
              onClick={handleApplyToWallet}
            >
              <Plus className="w-4 h-4 text-sky-200 group-hover:scale-110 transition-transform" />
              Integralizar Esta Projeção Como Investimento Ativo
            </button>
            <p className="text-[10px] text-center text-slate-400 leading-normal">
              Ao clicar, o valor total simulado (R$ {finalResult.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) será integralizado no seu Saldo Disponível de investimentos, habilitando resgates futuros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
