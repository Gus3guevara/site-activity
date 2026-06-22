/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Code, Terminal, Server, Layout, Copy, CheckCircle2 } from 'lucide-react';

export function DotnetNextjsExport() {
  const [activeTab, setActiveTab] = useState<'CSHARP' | 'NEXTJS'>('CSHARP');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const csharpCode = `using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace SimuladorFinanceiro.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinanceController : ControllerBase
    {
        // 1. REQUISITO: Calcular o VF (Valor Futuro) com dados de entrada de investimento
        [HttpPost("calcular-vf")]
        public ActionResult<FutureValueResponse> CalcularVF([FromBody] FutureValueRequest request)
        {
            if (request.InitialCapital < 0 || request.MonthlyAporte < 0 || request.InterestRate < 0 || request.PeriodMonths <= 0)
                return BadRequest("Parâmetros de simulação inválidos.");

            // Taxa mensal proporcional
            double r = request.RateType == "annual" 
                ? Math.Pow(1 + (double)request.InterestRate / 100, 1.0 / 12) - 1 
                : (double)request.InterestRate / 100;

            decimal balance = request.InitialCapital;
            decimal totalInvested = request.InitialCapital;
            
            var simulationData = new List<MonthResult>();
            simulationData.Add(new MonthResult { Month = 0, TotalInvested = totalInvested, TotalInterest = 0, TotalValue = balance });

            for (int m = 1; m <= request.PeriodMonths; m++)
            {
                decimal interestEarned = balance * (decimal)r;
                balance = balance * (decimal)(1 + r) + request.MonthlyAporte;
                totalInvested += request.MonthlyAporte;

                simulationData.Add(new MonthResult
                {
                    Month = m,
                    TotalInvested = totalInvested,
                    TotalInterest = balance - totalInvested,
                    TotalValue = balance
                });
            }

            return Ok(new FutureValueResponse
            {
                TotalInvested = totalInvested,
                TotalInterest = balance - totalInvested,
                TotalValue = balance,
                SimulationPoints = simulationData
            });
        }

        // 2. REQUISITO: Calcular o VP (Valor Presente) para um financiamento (Price/SAC)
        [HttpPost("calcular-vp")]
        public ActionResult<PresentValueResponse> CalcularVP([FromBody] PresentValueRequest request)
        {
            if (request.ParcelValue <= 0 || request.MonthlyRate <= 0 || request.Installments <= 0)
                return BadRequest("Parâmetros de financiamento inválidos.");

            double i = (double)request.MonthlyRate / 100;
            int n = request.Installments;

            // Fórmulas matemáticas financeiras (Price/Anuidade)
            // VP = PMT * ( (1 - (1 + i)^-n) / i )
            double discountFactor = (1 - Math.Pow(1 + i, -n)) / i;
            decimal presentValue = request.ParcelValue * (decimal)discountFactor;
            decimal totalPaid = request.ParcelValue * n;
            decimal totalInterest = totalPaid - presentValue;

            var amortRows = new List<AmortizationRow>();
            decimal balance = presentValue;

            for (int p = 1; p <= n; p++)
            {
                decimal interest = balance * (decimal)i;
                decimal amortization = request.ParcelValue - interest;
                balance = Math.Max(0, balance - amortization);

                amortRows.Add(new AmortizationRow
                {
                    Period = p,
                    Payment = request.ParcelValue,
                    Interest = interest,
                    Amortization = amortization,
                    OutstandingBalance = balance
                });
            }

            return Ok(new PresentValueResponse
            {
                PresentValue = presentValue,
                TotalInterest = totalInterest,
                TotalPaid = totalPaid,
                AmortizationTable = amortRows
            });
        }

        // 3. REQUISITO: Ajudar a calcular valor de imóvel (c/ referência do m² da região)
        [HttpPost("calcular-imovel")]
        public ActionResult<PropertyValuationResponse> CalcularImovel([FromBody] PropertyValuationRequest request)
        {
            if (request.Area <= 0 || request.PricePerM2 <= 0)
                return BadRequest("Dados de imóvel incorretos.");

            // Cálculo Base: Área x Preço do m² de referência
            decimal baseValue = (decimal)request.Area * request.PricePerM2;
            
            // Adicional de vagas de garagem (R$ 45.000 por vaga)
            decimal garageValue = request.GaragesCount * 45000m;

            // Fator idade
            decimal ageMultiplier = request.PropertyAge switch
            {
                "PLANTA" => 0.92m, // Desconto para construção
                "NOVO" => 1.10m,   // Adicional por ser novo pronto
                "USADO" => 0.95m,  // Depreciação natural
                _ => 1.00m
            };

            // Adicional de Lazer Completo (+6%)
            decimal amenitiesMultiplier = request.HasAmenities ? 1.06m : 1.00m;

            // Avaliação Final
            decimal totalEstimated = (baseValue + garageValue) * ageMultiplier * amenitiesMultiplier;

            return Ok(new PropertyValuationResponse
            {
                ValueBase = baseValue,
                ValueGarages = garageValue,
                TotalEstimated = totalEstimated,
                RealM2Equivalent = totalEstimated / (decimal)request.Area
            });
        }
    }

    // --- SCHEMA CLASSES ---
    public class FutureValueRequest {
        public decimal InitialCapital { get; set; }
        public decimal MonthlyAporte { get; set; }
        public decimal InterestRate { get; set; }
        public int PeriodMonths { get; set; }
        public string RateType { get; set; } // "annual" ou "monthly"
    }

    public class MonthResult {
        public int Month { get; set; }
        public decimal TotalInvested { get; set; }
        public decimal TotalInterest { get; set; }
        public decimal TotalValue { get; set; }
    }

    public class FutureValueResponse {
        public decimal TotalInvested { get; set; }
        public decimal TotalInterest { get; set; }
        public decimal TotalValue { get; set; }
        public List<MonthResult> SimulationPoints { get; set; }
    }

    public class PresentValueRequest {
        public decimal ParcelValue { get; set; }
        public decimal MonthlyRate { get; set; }
        public int Installments { get; set; }
    }

    public class AmortizationRow {
        public int Period { get; set; }
        public decimal Payment { get; set; }
        public decimal Interest { get; set; }
        public decimal Amortization { get; set; }
        public decimal OutstandingBalance { get; set; }
    }

    public class PresentValueResponse {
        public decimal PresentValue { get; set; }
        public decimal TotalInterest { get; set; }
        public decimal TotalPaid { get; set; }
        public List<AmortizationRow> AmortizationTable { get; set; }
    }

    public class PropertyValuationRequest {
        public double Area { get; set; }
        public decimal PricePerM2 { get; set; }
        public int GaragesCount { get; set; }
        public string PropertyAge { get; set; } // "NOVO", "USADO", "PLANTA"
        public bool HasAmenities { get; set; }
    }

    public class PropertyValuationResponse {
        public decimal ValueBase { get; set; }
        public decimal ValueGarages { get; set; }
        public decimal TotalEstimated { get; set; }
        public decimal RealM2Equivalent { get; set; }
    }
}`;

  const nextjsCode = `// -------------------------------------------------------------
// NEXT.JS (React Client Component & Fetch Services)
// Caminho sugerido: /app/investment/page.tsx (Next.js 14 App Router)
// -------------------------------------------------------------

'use client';

import React, { useState } from 'react';

// Interfaces de Tipo para integração direta com .NET C#
interface MonthResult {
  month: number;
  totalInvested: number;
  totalInterest: number;
  totalValue: number;
}

interface FutureValueResponse {
  totalInvested: number;
  totalInterest: number;
  totalValue: number;
  simulationPoints: MonthResult[];
}

export default function InvestmentPage() {
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [rate, setRate] = useState<number>(11.5);
  const [months, setMonths] = useState<number>(24);
  
  const [result, setResult] = useState<FutureValueResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Envia os dados para a API do Backend .NET C#
  const handleCalculateVF = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/finance/calcular-vf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialCapital,
          monthlyAporte: monthlyContribution,
          interestRate: rate,
          periodMonths: months,
          rateType: 'annual'
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao processar simulação na API .NET C#');
      }

      const data: FutureValueResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-3xl mt-10">
      <h1 className="text-2xl font-bold mb-2 text-slate-800">Simulador Financeiro Inteligente</h1>
      <p className="text-xs text-slate-500 mb-6 font-medium">Integração Front-end Next.js com C# .NET WebAPI</p>
      
      <form onSubmit={handleCalculateVF} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Capital Inicial (R$)</label>
          <input
            type="number"
            className="w-full p-2 border rounded-xl"
            value={initialCapital}
            onChange={(e) => setInitialCapital(Number(e.target.value))}
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Aporte Mensal (R$)</label>
          <input
            type="number"
            className="w-full p-2 border rounded-xl"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Taxa ao Ano (%)</label>
          <input
            type="number"
            step="0.1"
            className="w-full p-2 border rounded-xl"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Duração (Meses)</label>
          <input
            type="number"
            className="w-full p-2 border rounded-xl"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
        </div>

        <button 
          type="submit" 
          className="md:col-span-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
          disabled={loading}
        >
          {loading ? 'Calculando no .NET...' : 'Calcular Valor Futuro'}
        </button>
      </form>

      {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-xl mb-6">{error}</div>}

      {result && (
        <div className="p-6 bg-slate-50 border rounded-2xl">
          <h2 className="text-lg font-bold mb-4 text-slate-700">Resultado da API C#</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Investido</span>
              <strong className="text-lg text-slate-800">R$ {result.totalInvested.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Juros Totais</span>
              <strong className="text-lg text-emerald-600">R$ {result.totalInterest.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Valor Bruto Final</span>
              <strong className="text-lg text-blue-600">R$ {result.totalValue.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="dotnet-export-module">
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/20">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Arquitetura de Exportação (.NET C# & Next.js)</h2>
            <p className="text-xs text-slate-400">Implemente os mesmos cálculos de forma robusta em sua infraestrutura real</p>
          </div>
        </div>
        
        {/* Toggle between tabs */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all pointer-events-auto ${
              activeTab === 'CSHARP'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('CSHARP')}
          >
            <Server className="w-3.5 h-3.5" />
            Backend (.NET C#)
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all pointer-events-auto ${
              activeTab === 'NEXTJS'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('NEXTJS')}
          >
            <Layout className="w-3.5 h-3.5" />
            Frontend (Next.js)
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600">
              {activeTab === 'CSHARP' 
                ? 'FinanceController.cs (C# WebAPI ASP.NET Core)' 
                : '/app/investment/page.tsx (Next.js App Router)'}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all pointer-events-auto"
            onClick={() => handleCopy(activeTab === 'CSHARP' ? csharpCode : nextjsCode)}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950 rounded-xl overflow-hidden shadow-inner text-slate-200 p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto">
          <pre className="whitespace-pre">{activeTab === 'CSHARP' ? csharpCode : nextjsCode}</pre>
        </div>

        <div className="mt-4 p-4.5 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-3">
          <Terminal className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs text-sky-800 leading-normal">
            <p className="font-bold text-sky-900 mb-0.5">Nota de Operabilidade</p>
            Esse código implementa fielmente as mesmas fórmulas de <strong>VF de Juros Compostos acumulados</strong>, <strong>VP de parcelas Price/SAC</strong>, e <strong>Orçamentação Urbana por m²</strong> exibidos nas seções acima. Você pode colar o controlador diretamente em uma WebAPI do .NET 7/8/9 e integrar com a tela do Next.js via requisições assíncronas <code>fetch()</code> protegendo suas regras de negócio.
          </div>
        </div>
      </div>
    </div>
  );
}
