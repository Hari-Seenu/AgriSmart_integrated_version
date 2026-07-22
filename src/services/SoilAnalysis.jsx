// src/pages/SoilAnalysis.jsx
// This page lets farmers enter soil test values
// and get AI-powered crop and fertilizer recommendations

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../store.jsx';
import { ArrowLeft, FlaskConical, Loader2 } from 'lucide-react';
import { analyzeSoil } from '../services/api.js';

export default function SoilAnalysis() {
    const { t } = useTranslation();
    const { selectedCrop, selectedDistrict } = useAppState();

    const cropName = t(`crops.${selectedCrop}`);
    const districtName = t(`districts.${selectedDistrict}`);

    // Form input values - what farmer types
    const [formData, setFormData] = useState({
        n: '',           // Nitrogen
        p: '',           // Phosphorus
        k: '',           // Potassium
        ph: '',          // pH level
        moisture: '',    // Soil moisture %
        temperature: ''  // Soil temperature
    });

    // These 3 states control the UI
    const [loading, setLoading] = useState(false);  // show spinner
    const [error, setError] = useState(null);        // show error message
    const [result, setResult] = useState(null);      // show result

    // When user types in any input field, update that field
    const handleChange = (e) => {
        setFormData({
            ...formData,              // keep all other fields same
            [e.target.name]: e.target.value  // update only this field
        });
    };

    // When user clicks Analyze button
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check required fields
        if (!formData.n || !formData.p || !formData.k || !formData.ph) {
            setError('Please fill Nitrogen (N), Phosphorus (P), Potassium (K), and pH values.');
            return;
        }

        try {
            setLoading(true);   // show loading spinner
            setError(null);     // clear old errors
            setResult(null);    // clear old results

            // Send data to backend
            // parseFloat converts "240" string to 240 number
            const data = await analyzeSoil({
                n: parseFloat(formData.n),
                p: parseFloat(formData.p),
                k: parseFloat(formData.k),
                ph: parseFloat(formData.ph),
                moisture: parseFloat(formData.moisture) || 35,
                temperature: parseFloat(formData.temperature) || 29,
                district: selectedDistrict
            });

            setResult(data);  // save response to show on screen

        } catch (err) {
            // err.response?.data?.error = error message from backend
            setError(
                err.response?.data?.error ||
                'Analysis failed. Please make sure the backend server is running.'
            );
        } finally {
            setLoading(false);  // always hide spinner at end
        }
    };

    return (
        <div className="space-y-8 text-left max-w-3xl mx-auto">

            {/* Page Header with back button */}
            <div className="flex items-center gap-3 border-b border-brand-borderLight dark:border-brand-borderDark pb-6">
                <Link
                    to="/dashboard"
                    className="p-2 border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-darkSurface rounded-xl premium-shadow hover:opacity-80"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                        {cropName} · {districtName}
                    </span>
                    <h1 className="text-2xl font-extrabold text-brand-primary dark:text-[#EDEFE9]">
                        AI Soil Analysis
                    </h1>
                </div>
            </div>

            {/* Input Form Card */}
            <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-6 premium-shadow">

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-gold/10 rounded-xl">
                        <FlaskConical className="w-5 h-5 text-brand-gold" />
                    </div>
                    <h2 className="text-base font-bold text-brand-primary dark:text-[#EDEFE9]">
                        Enter Your Soil Test Report Values
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                        {/* Nitrogen Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block">
                                Nitrogen (N) kg/ha
                            </label>
                            <input
                                type="number"
                                name="n"
                                value={formData.n}
                                onChange={handleChange}
                                placeholder="e.g. 240"
                                className="w-full px-3 py-2.5 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                        {/* Phosphorus Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block">
                                Phosphorus (P) kg/ha
                            </label>
                            <input
                                type="number"
                                name="p"
                                value={formData.p}
                                onChange={handleChange}
                                placeholder="e.g. 12"
                                className="w-full px-3 py-2.5 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                        {/* Potassium Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block">
                                Potassium (K) kg/ha
                            </label>
                            <input
                                type="number"
                                name="k"
                                value={formData.k}
                                onChange={handleChange}
                                placeholder="e.g. 180"
                                className="w-full px-3 py-2.5 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                        {/* pH Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block">
                                Soil pH
                            </label>
                            <input
                                type="number"
                                name="ph"
                                value={formData.ph}
                                onChange={handleChange}
                                placeholder="e.g. 5.8"
                                step="0.1"
                                min="0"
                                max="14"
                                className="w-full px-3 py-2.5 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                        {/* Moisture Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block">
                                Moisture % (optional)
                            </label>
                            <input
                                type="number"
                                name="moisture"
                                value={formData.moisture}
                                onChange={handleChange}
                                placeholder="e.g. 35"
                                className="w-full px-3 py-2.5 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                        {/* Temperature Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block">
                                Temperature °C (optional)
                            </label>
                            <input
                                type="number"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleChange}
                                placeholder="e.g. 29"
                                className="w-full px-3 py-2.5 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>

                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-700 dark:text-red-400 rounded-xl text-xs font-medium">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 text-white dark:bg-brand-gold dark:text-brand-darkBg font-bold py-3 rounded-xl text-sm transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>AI is analyzing your soil... (10-30 seconds)</span>
                            </>
                        ) : (
                            <span>🔬 Analyze Soil with AI</span>
                        )}
                    </button>
                </form>
            </div>

            {/* Results - Only shown after successful API call */}
            {result && (
                <div className="space-y-4">

                    {/* Recommended Crop Box */}
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                            🌾 ML Model Recommended Crop
                        </span>
                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                            {result.local_ml_recommendations?.recommended_crop}
                        </p>

                        {/* Alternative crops */}
                        {result.local_ml_recommendations?.alternatives?.length > 0 && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                                <span className="text-[10px] text-emerald-600 font-semibold">Alternatives:</span>
                                {result.local_ml_recommendations.alternatives.map((alt, i) => (
                                    <span key={i} className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                                        {alt.crop} ({(alt.probability * 100).toFixed(0)}%)
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Live Weather Box */}
                    {result.realtime_weather_readings && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-3">
                                🌤️ Live Weather - {result.realtime_weather_readings.district}
                            </span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                                <div>
                                    <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                                        {result.realtime_weather_readings.temperature}°C
                                    </p>
                                    <p className="text-[10px] text-blue-600/70 font-medium">Temperature</p>
                                </div>
                                <div>
                                    <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                                        {result.realtime_weather_readings.humidity}%
                                    </p>
                                    <p className="text-[10px] text-blue-600/70 font-medium">Humidity</p>
                                </div>
                                <div>
                                    <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                                        {result.realtime_weather_readings.precipitation}mm
                                    </p>
                                    <p className="text-[10px] text-blue-600/70 font-medium">Rainfall</p>
                                </div>
                                <div>
                                    <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                                        {result.realtime_weather_readings.wind_speed} km/h
                                    </p>
                                    <p className="text-[10px] text-blue-600/70 font-medium">Wind Speed</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fertilizer Plan Box */}
                    {result.local_ml_recommendations?.fertilizer_plan_kg_per_ha && (
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-700 dark:text-yellow-400 block mb-3">
                                🌱 Fertilizer Plan (kg/hectare)
                            </span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Urea (N)', value: result.local_ml_recommendations.fertilizer_plan_kg_per_ha.urea_nitrogen, color: 'text-emerald-600' },
                                    { label: 'SSP (P)', value: result.local_ml_recommendations.fertilizer_plan_kg_per_ha.single_superphosphate_phosphorus, color: 'text-yellow-600' },
                                    { label: 'MOP (K)', value: result.local_ml_recommendations.fertilizer_plan_kg_per_ha.muriate_of_potash_potassium, color: 'text-blue-600' },
                                    { label: 'FYM (Organic)', value: result.local_ml_recommendations.fertilizer_plan_kg_per_ha.farm_yard_manure, color: 'text-amber-600' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-white dark:bg-brand-darkSurface rounded-xl p-3 text-center">
                                        <p className={`text-lg font-extrabold ${item.color}`}>{item.value}</p>
                                        <p className="text-[10px] font-medium text-brand-textSecondaryLight mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Report */}
                    {result.report && (
                        <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block mb-3">
                                📋 AI Agronomist Report
                            </span>
                            <pre className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark whitespace-pre-wrap font-sans leading-relaxed">
                                {result.report}
                            </pre>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}