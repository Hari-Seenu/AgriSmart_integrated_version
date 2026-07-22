import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppState } from '../store.jsx';
import { ArrowLeft, Landmark, Store, LandmarkIcon, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { getMarketTrends } from '../services/api.js';
import { Loader2 } from 'lucide-react';

export default function MarketComparison() {
  const { t } = useTranslation();
  const { selectedCrop, selectedDistrict } = useAppState();

  const [weight, setWeight] = useState(10); // default 10 Quintals

  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const cropName = t(`crops.${selectedCrop}`);
  const districtName = t(`districts.${selectedDistrict}`);


  // TNAU & market-verified base prices for channels per crop (₹ / Quintal)
  // Jasmine price maps to scent extraction scale (₹400-650/kg converted to Quintal)
  const priceData = {
    rice: { msp: 2400, mandi: 2650, corp: 2800 },
    coconut: { msp: 11160, mandi: 12100, corp: 13000 },
    turmeric: { msp: 7800, mandi: 10200, corp: 11500 },
    jasmine: { msp: 40000, mandi: 65000, corp: 45000 },
    cashew: { msp: 9500, mandi: 11800, corp: 12800 },
    sugarcane: { msp: 315, mandi: 340, corp: 360 }, // FRP: ₹3,150/tonne = ₹315/qtl
    groundnut: { msp: 6377, mandi: 7200, corp: 7600 },
    maize: { msp: 2090, mandi: 2300, corp: 2500 },
    tea: { msp: 1800, mandi: 2400, corp: 2800 },
    potato: { msp: 1500, mandi: 2200, corp: 2500 }
  };

  const cropPrices = priceData[selectedCrop] || priceData['rice'];

  // Calculate total revenues
  const govTotal = Math.round(cropPrices.msp * weight);
  const pvtTotal = Math.round(cropPrices.mandi * weight);
  const corpTotal = Math.round(cropPrices.corp * weight);

  // Historical 6-month pricing trends (simulated base changes based on TNSAMB records)
  const historicalTrends = {
    rice: [
      { month: 'Jan', msp: 2300, mandi: 2450, corp: 2550 },
      { month: 'Feb', msp: 2300, mandi: 2500, corp: 2600 },
      { month: 'Mar', msp: 2400, mandi: 2550, corp: 2650 },
      { month: 'Apr', msp: 2400, mandi: 2600, corp: 2700 },
      { month: 'May', msp: 2400, mandi: 2620, corp: 2750 },
      { month: 'Jun', msp: 2400, mandi: 2650, corp: 2800 }
    ],
    coconut: [
      { month: 'Jan', msp: 10860, mandi: 11200, corp: 12000 },
      { month: 'Feb', msp: 10860, mandi: 11400, corp: 12200 },
      { month: 'Mar', msp: 11160, mandi: 11700, corp: 12500 },
      { month: 'Apr', msp: 11160, mandi: 11900, corp: 12700 },
      { month: 'May', msp: 11160, mandi: 12050, corp: 12850 },
      { month: 'Jun', msp: 11160, mandi: 12100, corp: 13000 }
    ],
    turmeric: [
      { month: 'Jan', msp: 7500, mandi: 8800, corp: 9800 },
      { month: 'Feb', msp: 7500, mandi: 9200, corp: 10200 },
      { month: 'Mar', msp: 7800, mandi: 9500, corp: 10500 },
      { month: 'Apr', msp: 7800, mandi: 9800, corp: 11000 },
      { month: 'May', msp: 7800, mandi: 10050, corp: 11200 },
      { month: 'Jun', msp: 7800, mandi: 10200, corp: 11500 }
    ],
    jasmine: [
      { month: 'Jan', msp: 38000, mandi: 42000, corp: 45000 },
      { month: 'Feb', msp: 38000, mandi: 48000, corp: 45000 },
      { month: 'Mar', msp: 40000, mandi: 55000, corp: 45000 },
      { month: 'Apr', msp: 40000, mandi: 58000, corp: 45000 },
      { month: 'May', msp: 40000, mandi: 62000, corp: 45000 },
      { month: 'Jun', msp: 40000, mandi: 65000, corp: 45000 }
    ],
    cashew: [
      { month: 'Jan', msp: 9000, mandi: 10500, corp: 11800 },
      { month: 'Feb', msp: 9000, mandi: 10800, corp: 12000 },
      { month: 'Mar', msp: 9500, mandi: 11100, corp: 12200 },
      { month: 'Apr', msp: 9500, mandi: 11400, corp: 12400 },
      { month: 'May', msp: 9500, mandi: 11600, corp: 12600 },
      { month: 'Jun', msp: 9500, mandi: 11800, corp: 12800 }
    ],
    sugarcane: [
      { month: 'Jan', msp: 300, mandi: 320, corp: 340 },
      { month: 'Feb', msp: 300, mandi: 325, corp: 345 },
      { month: 'Mar', msp: 315, mandi: 330, corp: 350 },
      { month: 'Apr', msp: 315, mandi: 335, corp: 355 },
      { month: 'May', msp: 315, mandi: 338, corp: 358 },
      { month: 'Jun', msp: 315, mandi: 340, corp: 360 }
    ],
    groundnut: [
      { month: 'Jan', msp: 6100, mandi: 6800, corp: 7100 },
      { month: 'Feb', msp: 6100, mandi: 6900, corp: 7200 },
      { month: 'Mar', msp: 6377, mandi: 7000, corp: 7350 },
      { month: 'Apr', msp: 6377, mandi: 7100, corp: 7450 },
      { month: 'May', msp: 6377, mandi: 7150, corp: 7500 },
      { month: 'Jun', msp: 6377, mandi: 7200, corp: 7600 }
    ],
    maize: [
      { month: 'Jan', msp: 1960, mandi: 2100, corp: 2250 },
      { month: 'Feb', msp: 1960, mandi: 2150, corp: 2300 },
      { month: 'Mar', msp: 2090, mandi: 2200, corp: 2380 },
      { month: 'Apr', msp: 2090, mandi: 2250, corp: 2420 },
      { month: 'May', msp: 2090, mandi: 2280, corp: 2460 },
      { month: 'Jun', msp: 2090, mandi: 2300, corp: 2500 }
    ],
    tea: [
      { month: 'Jan', msp: 1700, mandi: 2100, corp: 2400 },
      { month: 'Feb', msp: 1700, mandi: 2200, corp: 2500 },
      { month: 'Mar', msp: 1800, mandi: 2250, corp: 2600 },
      { month: 'Apr', msp: 1800, mandi: 2300, corp: 2650 },
      { month: 'May', msp: 1800, mandi: 2350, corp: 2700 },
      { month: 'Jun', msp: 1800, mandi: 2400, corp: 2800 }
    ],
    potato: [
      { month: 'Jan', msp: 1400, mandi: 1800, corp: 2100 },
      { month: 'Feb', msp: 1400, mandi: 1950, corp: 2200 },
      { month: 'Mar', msp: 1500, mandi: 2050, corp: 2300 },
      { month: 'Apr', msp: 1500, mandi: 2100, corp: 2400 },
      { month: 'May', msp: 1500, mandi: 2150, corp: 2450 },
      { month: 'Jun', msp: 1500, mandi: 2200, corp: 2500 }
    ]
  };

  const chartData = historicalTrends[selectedCrop] || historicalTrends['rice'];

  const handleWeightChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setWeight(val);
    } else {
      setWeight(0);
    }
  };

  // ADD THIS NEW FUNCTION RIGHT HERE
  const handleGetAIReport = async () => {
    try {
      setAiLoading(true);   // show loading spinner on button
      setAiError(null);     // clear old errors
      setAiReport(null);    // clear old report

      // call backend API
      const data = await getMarketTrends(selectedCrop, selectedDistrict);

      // save the report text to show on screen
      setAiReport(data.report);

    } catch (err) {
      // if something goes wrong, show error message
      setAiError('Failed to get AI market report. Check if backend is running.');
    } finally {
      setAiLoading(false);  // always hide spinner at end
    }
  };

  return (
    <div className="space-y-8">
      {/* Module Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-borderLight dark:border-brand-borderDark pb-6 gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-darkSurface rounded-xl premium-shadow hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold dark:text-brand-goldDark">
              {t('common.personalized_for', { crop: cropName, district: districtName })}
            </span>
            <h1 className="text-2xl font-extrabold text-brand-primary dark:text-[#EDEFE9] tracking-tight">
              {t('market.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* Grid containing Comparative Table & Trend Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sales Channels Table (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-6 premium-shadow space-y-6 text-left">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-brand-gold shrink-0" />
            <h2 className="text-lg font-bold text-brand-primary dark:text-[#EDEFE9]">
              {t('market.channel_comparison')}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-borderLight dark:border-brand-borderDark text-brand-textSecondaryLight dark:text-brand-textSecondaryDark uppercase font-bold tracking-wider">
                  <th className="pb-3.5 pl-2">Channel</th>
                  <th className="pb-3.5">Details</th>
                  <th className="pb-3.5 pr-2 text-right">Price / Qtl</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderLight dark:divide-brand-borderDark">

                {/* Gov MSP row */}
                <tr className="hover:bg-brand-primary/[0.01]">
                  <td className="py-4 pl-2 font-bold flex items-center gap-2 text-brand-primary dark:text-[#EDEFE9]">
                    <LandmarkIcon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    {t('market.gov_msp')}
                  </td>
                  <td className="py-4 text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
                    {t('market.gov_msp_desc')}
                  </td>
                  <td className="py-4 pr-2 text-right font-extrabold text-brand-primary dark:text-[#EDEFE9] text-sm tabular-nums">
                    ₹{cropPrices.msp.toLocaleString('en-IN')}
                  </td>
                </tr>

                {/* Mandi row */}
                <tr className="hover:bg-brand-primary/[0.01]">
                  <td className="py-4 pl-2 font-bold flex items-center gap-2 text-brand-primary dark:text-[#EDEFE9]">
                    <Store className="w-4.5 h-4.5 text-yellow-600 dark:text-yellow-400" />
                    {t('market.private_mandi')}
                  </td>
                  <td className="py-4 text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
                    {t('market.private_mandi_desc', { district: districtName })}
                  </td>
                  <td className="py-4 pr-2 text-right font-extrabold text-brand-primary dark:text-[#EDEFE9] text-sm tabular-nums">
                    ₹{cropPrices.mandi.toLocaleString('en-IN')}
                  </td>
                </tr>

                {/* Corporate Contract row */}
                <tr className="hover:bg-brand-primary/[0.01]">
                  <td className="py-4 pl-2 font-bold flex items-center gap-2 text-brand-primary dark:text-[#EDEFE9]">
                    <TrendingUp className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    {t('market.corporate_contract')}
                  </td>
                  <td className="py-4 text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
                    {t('market.corporate_contract_desc')}
                  </td>
                  <td className="py-4 pr-2 text-right font-extrabold text-brand-primary dark:text-[#EDEFE9] text-sm tabular-nums">
                    ₹{cropPrices.corp.toLocaleString('en-IN')}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Chart (Span 1) */}
        <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-6 premium-shadow flex flex-col justify-between text-left">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-brand-primary dark:text-[#EDEFE9] uppercase tracking-wider">
              {t('market.price_trend_title')}
            </h2>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(11, 61, 32, 0.04)" />
                <XAxis dataKey="month" stroke="#8fa396" fontSize={10} tickLine={false} />
                <YAxis stroke="#8fa396" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101F16', borderColor: 'rgba(212, 175, 55, 0.12)', borderRadius: '8px' }}
                  labelStyle={{ color: '#EDEFE9', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="msp" stroke="#1b7c3f" name="Gov MSP" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="mandi" stroke="#D4AF37" name="Private Mandi" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="corp" stroke="#3b82f6" name="Corporate" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Revenue Estimator Calculator */}
      <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-6 premium-shadow space-y-6 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-xl">
            <Landmark className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-primary dark:text-[#EDEFE9]">
              {t('market.calculator_title')}
            </h2>
            <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark mt-0.5">
              {t('market.calculator_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Weight Input (Quintals) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-brand-primary dark:text-[#EDEFE9] uppercase tracking-wider">
              {t('market.input_weight')}
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={weight}
              onChange={handleWeightChange}
              className="block w-full px-4 py-3 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
            />
          </div>

          {/* Revenue outcomes grid */}
          <div className="md:col-span-2 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] p-5 rounded-xl border border-brand-borderLight dark:border-brand-borderDark">
            <span className="text-[10px] font-bold text-brand-textSecondaryLight dark:text-brand-textSecondaryDark uppercase block mb-3">
              Projected Earnings Comparison (₹)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border-l-2 border-emerald-500 pl-3">
                <span className="text-[10px] text-brand-textSecondaryLight dark:text-brand-textSecondaryDark block">
                  {t('market.gov_msp')}
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5 tabular-nums">
                  ₹{govTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="border-l-2 border-yellow-500 pl-3">
                <span className="text-[10px] text-brand-textSecondaryLight dark:text-brand-textSecondaryDark block">
                  {t('market.private_mandi')}
                </span>
                <span className="text-base font-extrabold text-yellow-600 dark:text-yellow-400 block mt-0.5 tabular-nums">
                  ₹{pvtTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="border-l-2 border-blue-500 pl-3">
                <span className="text-[10px] text-brand-textSecondaryLight dark:text-brand-textSecondaryDark block">
                  {t('market.corporate_contract')}
                </span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 block mt-0.5 tabular-nums">
                  ₹{corpTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-6 premium-shadow space-y-4 text-left">

        <div>
          <h2 className="text-base font-bold text-brand-primary dark:text-[#EDEFE9]">
            Live AI Market Intelligence
          </h2>
          <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark mt-1">
            Get real-time web search and AI analysis of current {cropName} prices in Tamil Nadu markets.
          </p>
        </div>

        <button
          onClick={handleGetAIReport}
          disabled={aiLoading}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 text-white dark:bg-brand-gold dark:text-brand-darkBg font-bold py-2.5 px-6 rounded-xl text-xs transition-all"
        >
          {aiLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching live market data...</span>
            </>
          ) : (
            <span>Get Live AI Market Report</span>
          )}
        </button>

        {aiError && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {aiError}
          </p>
        )}

        {aiReport && (
          <div className="bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block mb-2">
              AI Market Analysis Report
            </span>
            <pre className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark whitespace-pre-wrap font-sans leading-relaxed">
              {aiReport}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
