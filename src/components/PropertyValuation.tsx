/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PropertyRegion } from '../types';
import { Home, MapPin, Building, Key, Sparkles, Layers, Info, CheckCircle } from 'lucide-react';

const PRESET_REGIONS: PropertyRegion[] = [
  { id: '1', name: 'Leblon', state: 'Rio de Janeiro / RJ', avgPricePerM2: 22600, description: 'Bairro nobre com a maior média de m² do país.' },
  { id: '2', name: 'Itaim Bibi', state: 'São Paulo / SP', avgPricePerM2: 18200, description: 'Centro executivo de alta renda na capital paulista.' },
  { id: '3', name: 'Pinheiros', state: 'São Paulo / SP', avgPricePerM2: 14500, description: 'Região vibrante, alta conectividade e lançamentos de luxo.' },
  { id: '4', name: 'Batel', state: 'Curitiba / PR', avgPricePerM2: 12900, description: 'Referência paranaense em urbanismo e alto padrão.' },
  { id: '5', name: 'Plano Piloto', state: 'Brasília / DF', avgPricePerM2: 13400, description: 'Superquadras preservadas e alta densidade de demanda.' },
  { id: '6', name: 'Savassi', state: 'Belo Horizonte / MG', avgPricePerM2: 11800, description: 'Região hospitalar e de negócios tradicional da capital mineira.' },
  { id: '7', name: 'Meireles', state: 'Fortaleza / CE', avgPricePerM2: 10600, description: 'Beira-mar cearense de alta valorização.' },
  { id: '8', name: 'Setor Marista', state: 'Goiânia / GO', avgPricePerM2: 9500, description: 'Bairro de referência em bem-estar e sofisticação no Centro-Oeste.' }
];

export function PropertyValuation() {
  const [area, setArea] = useState<number>(85); // 85m² standard
  const [selectedRegionId, setSelectedRegionId] = useState<string>('3'); // Pinheiros Default
  const [customPriceM2, setCustomPriceM2] = useState<number>(7500);
  const [customRegionName, setCustomRegionName] = useState<string>('');
  const [useCustomRegion, setUseCustomRegion] = useState<boolean>(false);

  // Extras configuration for real estate appraisal
  const [garagesCount, setGaragesCount] = useState<number>(1);
  const [propertyAge, setPropertyAge] = useState<'NOVO' | 'USADO' | 'PLANTA'>('NOVO');
  const [hasAmenities, setHasAmenities] = useState<boolean>(true); // Pool, Gym, etc.

  // Find region characteristics
  const currentRegion = useMemo(() => {
    return PRESET_REGIONS.find(r => r.id === selectedRegionId);
  }, [selectedRegionId]);

  const activePricePerM2 = useMemo(() => {
    if (useCustomRegion) {
      return customPriceM2;
    }
    return currentRegion ? currentRegion.avgPricePerM2 : 0;
  }, [useCustomRegion, customPriceM2, currentRegion]);

  // Compute property estimation
  const estimation = useMemo(() => {
    // Base Area x Price/m²
    const valueBase = area * activePricePerM2;

    // Garages modifier (R$ 45.000 each)
    const valueGarages = garagesCount * 45000;

    // Age modifier
    let ageMultiplier = 1.0;
    if (propertyAge === 'PLANTA') ageMultiplier = 0.92; // construction discount
    if (propertyAge === 'NOVO') ageMultiplier = 1.10; // brand new extra
    if (propertyAge === 'USADO') ageMultiplier = 0.95; // depreciated

    // Amenities modifier (Lazer Completo)
    const amenitiesMultiplier = hasAmenities ? 1.06 : 1.0;

    // Total computation
    const totalEstimated = (valueBase + valueGarages) * ageMultiplier * amenitiesMultiplier;

    return {
      valueBase,
      valueGarages,
      ageMultiplier,
      amenitiesMultiplier,
      totalEstimated,
      m2RealEquivalent: totalEstimated / (area || 1)
    };
  }, [area, activePricePerM2, garagesCount, propertyAge, hasAmenities]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="prop-valuation-module">
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Avaliação de Imóvel por m² da Região</h2>
            <p className="text-xs text-slate-400">Dimensione o valor venal de imóveis usando médias metropolitanas</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest block">Análise Urbana</span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-violet-400">Indicadores Regionais</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Características do Ativo</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="propertyArea">
                  Área do Imóvel (m²)
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <input
                    id="propertyArea"
                    type="number"
                    min="1"
                    max="10000"
                    className="w-full pr-12 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium text-slate-800 transition-colors"
                    value={area}
                    onChange={(e) => setArea(Math.max(1, parseInt(e.target.value) || 0))}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold uppercase select-none">
                    m²
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="garagesCount">
                  Vagas de Garagem
                </label>
                <select
                  id="garagesCount"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white font-medium text-slate-700 transition-colors"
                  value={garagesCount}
                  onChange={(e) => setGaragesCount(parseInt(e.target.value) || 0)}
                >
                  <option value={0}>Nenhuma vaga</option>
                  <option value={1}>1 vaga de garagem</option>
                  <option value={2}>2 vagas de garagem</option>
                  <option value={3}>3 vagas de garagem</option>
                  <option value={4}>4 ou mais de garagem</option>
                </select>
              </div>
            </div>

            {/* Region Select */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-500" htmlFor="regionSelect">
                  Região Metropolitana / Referência
                </label>
                <button
                  type="button"
                  className="text-xs text-violet-600 hover:text-violet-700 font-bold transition-colors"
                  onClick={() => setUseCustomRegion(!useCustomRegion)}
                >
                  {useCustomRegion ? 'Ver Referências' : 'Digitar Manualmente'}
                </button>
              </div>

              {!useCustomRegion ? (
                <div className="space-y-2">
                  <select
                    id="regionSelect"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white font-semibold text-slate-700 transition-colors"
                    value={selectedRegionId}
                    onChange={(e) => setSelectedRegionId(e.target.value)}
                  >
                    {PRESET_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.state}) — R$ {r.avgPricePerM2}/m²
                      </option>
                    ))}
                  </select>
                  {currentRegion && (
                    <p className="text-[11px] text-slate-500 leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                      <span><strong>{currentRegion.name} ({currentRegion.state}):</strong> {currentRegion.description}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-violet-500/5 rounded-xl border border-violet-100">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-violet-700 mb-1" htmlFor="customRegName">
                      Nome da Região / Bairro
                    </label>
                    <input
                      id="customRegName"
                      type="text"
                      placeholder="Ex: Pinheiros, Itaim Bibi"
                      className="w-full px-3 py-1.5 text-xs border border-violet-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white font-medium text-slate-800"
                      value={customRegionName}
                      onChange={(e) => setCustomRegionName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-violet-700 mb-1" htmlFor="customM2Price">
                      Valor Médio do m² Próprio
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-violet-400 text-xs">
                        R$
                      </div>
                      <input
                        id="customM2Price"
                        type="number"
                        min="1"
                        step="100"
                        className="w-full pl-8 pr-12 py-1.5 text-xs border border-violet-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white font-semibold text-slate-800"
                        value={customPriceM2}
                        onChange={(e) => setCustomPriceM2(Math.max(1, parseFloat(e.target.value) || 0))}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-violet-400 text-[10px] font-bold">
                        / m²
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5" htmlFor="propertyAge">
                  Estágio de Vida útil
                </label>
                <select
                  id="propertyAge"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white font-medium text-slate-700 transition-colors"
                  value={propertyAge}
                  onChange={(e) => setPropertyAge(e.target.value as 'NOVO' | 'USADO' | 'PLANTA')}
                >
                  <option value="PLANTA">Na Planta (Desconto 8%)</option>
                  <option value="NOVO">Pronto/Novo (+10%)</option>
                  <option value="USADO">Usado (Depreciação 5%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Lazer & Infraestrutura
                </label>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <input
                    id="hasAmenities"
                    type="checkbox"
                    className="w-4.5 h-4.5 rounded-sm text-violet-600 focus:ring-violet-500 border-slate-300"
                    checked={hasAmenities}
                    onChange={(e) => setHasAmenities(e.target.checked)}
                  />
                  <label htmlFor="hasAmenities" className="text-xs text-slate-600 font-medium select-none cursor-pointer">
                    Lazer Completo (+6%)
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* Outputs Estimation */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4">Estimativa Mercadológica do Imóvel</h3>

              {/* Big value layout */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center md:text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Building className="w-36 h-36 text-slate-900" />
                </div>
                
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                  VALOR DE AVALIAÇÃO ESTIMADO
                </span>
                <span className="text-3xl md:text-4xl font-extrabold text-slate-800 font-mono block tracking-tight">
                  R$ {estimation.totalEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 px-2 py-0.5 bg-violet-50 border border-violet-100 rounded-md mt-2">
                  <Sparkles className="w-3 h-3" /> Equivalência de m² Real: R$ {estimation.m2RealEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/m²
                </span>
              </div>

              {/* Composition Breakdown */}
              <div className="mt-5 border border-slate-150 rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-150 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Composição do Orçamento Estimado</span>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-violet-500" />
                    <span className="font-mono text-[10px] font-semibold">Fatores Aplicados</span>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Área Base ({area} m² x R$ {activePricePerM2.toLocaleString('pt-BR')}/m²):</span>
                    <strong className="text-slate-700 font-mono">R$ {estimation.valueBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500">Vagas de Garagem ({garagesCount}x @ R$ 45.000,00):</span>
                    <strong className="text-slate-700 font-mono">R$ {estimation.valueGarages.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500">Ajuste de Idade/Estágio:</span>
                    <span className="font-semibold font-mono text-slate-700">
                      {propertyAge === 'NOVO' ? 'Novo (+10%)' : propertyAge === 'PLANTA' ? 'Na Planta (-8%)' : 'Usado (-5%)'}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-slate-500">Adicional de Lazer & Áreas Comuns:</span>
                    <span className="font-semibold font-mono text-slate-700">
                      {hasAmenities ? 'Lazer Completo (+6%)' : 'Nenhum acréscimo'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150/50 flex gap-3 mt-4">
              <Info className="w-5 h-5 text-violet-600 shrink-0" />
              <p className="text-[11px] text-slate-600 leading-normal">
                Esta análise constitui uma estimativa estatística de preços do mercado imobiliário privado paulista e metropolitano básico. Não substitui um laudo técnico assinado por profissional avaliador habilitado sob o conselho regional <strong>CRECI/COFECI</strong>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
