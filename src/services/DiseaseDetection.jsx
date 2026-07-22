// src/pages/DiseaseDetection.jsx
// Farmer uploads a photo of their crop leaf
// Backend analyzes the image for disease

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../store.jsx';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { detectDisease } from '../services/api.js';

export default function DiseaseDetection() {
    const { t } = useTranslation();
    const { selectedCrop, selectedDistrict } = useAppState();

    const cropName = t(`crops.${selectedCrop}`);
    const districtName = t(`districts.${selectedDistrict}`);

    const [selectedFile, setSelectedFile] = useState(null);   // the image file
    const [preview, setPreview] = useState(null);             // image preview URL
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // When farmer selects an image file
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setResult(null);
        setError(null);

        // Create a preview URL so we can show the image on screen
        // URL.createObjectURL creates a temporary local URL for the file
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select a leaf image first.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Send image to backend
            // selectedCrop is passed so AI knows what crop to analyze
            const data = await detectDisease(selectedFile, selectedCrop);
            setResult(data);

        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Detection failed. Please make sure backend is running.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Choose color based on severity level
    const getSeverityStyle = (level) => {
        if (level === 'Negligible') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        if (level === 'Mild') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
        if (level === 'Moderate') return 'bg-orange-50 border-orange-200 text-orange-700';
        if (level === 'Severe') return 'bg-red-50 border-red-200 text-red-700';
        return 'bg-gray-50 border-gray-200 text-gray-700';
    };

    return (
        <div className="space-y-8 text-left max-w-3xl mx-auto">

            {/* Header */}
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
                        Crop Disease Detection
                    </h1>
                </div>
            </div>

            {/* Upload Form */}
            <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-6 premium-shadow">

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-gold/10 rounded-xl">
                        <Upload className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-brand-primary dark:text-[#EDEFE9]">
                            Upload Crop Leaf Photo
                        </h2>
                        <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">
                            Take a clear photo of the affected leaf and upload it
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* File Selector */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full text-sm text-brand-textSecondaryLight
              file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
              file:text-xs file:font-bold
              file:bg-brand-primary file:text-white
              dark:file:bg-brand-gold dark:file:text-brand-darkBg
              hover:file:opacity-90 cursor-pointer"
                    />

                    {/* Image Preview */}
                    {preview && (
                        <div className="rounded-xl overflow-hidden border border-brand-borderLight dark:border-brand-borderDark">
                            <img
                                src={preview}
                                alt="Selected leaf"
                                className="w-full max-h-64 object-contain bg-brand-primary/[0.02]"
                            />
                        </div>
                    )}

                    {/* Show which crop is being analyzed */}
                    <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">
                        Analyzing as crop: <strong className="text-brand-primary dark:text-[#EDEFE9]">{cropName}</strong>
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-700 dark:text-red-400 rounded-xl text-xs font-medium">
                            {error}
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        type="submit"
                        disabled={loading || !selectedFile}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 text-white dark:bg-brand-gold dark:text-brand-darkBg font-bold py-3 rounded-xl text-sm transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing leaf image...</span>
                            </>
                        ) : (
                            <span>🔍 Detect Disease</span>
                        )}
                    </button>
                </form>
            </div>

            {/* Results */}
            {result && result.local_analysis && (
                <div className="space-y-4">

                    {/* Disease Status */}
                    <div className={`rounded-2xl p-5 border ${getSeverityStyle(result.local_analysis.severity_level)}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider block">
                                Detection Result
                            </span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50 border">
                                {result.local_analysis.severity_level}
                            </span>
                        </div>
                        <p className="text-xl font-extrabold mb-1">
                            {result.local_analysis.detected_disease}
                        </p>
                        <p className="text-sm">
                            Status: {result.local_analysis.status} — Severity: {result.local_analysis.severity_percentage}%
                        </p>
                    </div>

                    {/* Leaf Color Analysis */}
                    {result.local_analysis.color_signature && (
                        <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block mb-3">
                                Leaf Color Analysis
                            </span>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>🟢 Healthy Green</span>
                                    <span className="font-bold text-emerald-600">
                                        {result.local_analysis.color_signature.healthy_green_pct}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>🟡 Chlorosis (Yellow)</span>
                                    <span className="font-bold text-yellow-600">
                                        {result.local_analysis.color_signature.chlorosis_yellow_pct}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>🟤 Necrosis (Brown)</span>
                                    <span className="font-bold text-amber-700">
                                        {result.local_analysis.color_signature.necrotic_brown_pct}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recommended Action */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-2">
                            💊 Recommended Treatment
                        </span>
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                            {result.local_analysis.recommended_action}
                        </p>
                    </div>

                    {/* Full AI Report */}
                    {result.ai_analysis_report && (
                        <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9] block mb-3">
                                📋 AI Pathologist Detailed Report
                            </span>
                            <pre className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark whitespace-pre-wrap font-sans leading-relaxed">
                                {result.ai_analysis_report}
                            </pre>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}