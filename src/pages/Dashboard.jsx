import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store.jsx';
import {
  Sprout,
  TrendingUp,
  CloudSun,
  PackageCheck,
  Building,
  UserCheck,
  User,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Activity,
  Phone,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  FlaskConical,
  Microscope
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ComposedChart, Line, Cell } from 'recharts';
import { districtsData, agroClimaticZones } from '../data/districtsData.js';

export default function Dashboard() {
  const { t } = useTranslation();
  const { userName, selectedCrop, selectedDistrict } = useAppState();

  const [showCharts, setShowCharts] = useState(false);

  const cropName = t(`crops.${selectedCrop}`);
  const districtName = t(`districts.${selectedDistrict}`);

  // Fetch dynamic agricultural details from TNAU database
  const districtIntel = districtsData[selectedDistrict] || districtsData['thiruvarur'];
  const cropIntel = districtIntel.crops.find(c => c.id === selectedCrop) || districtIntel.crops[0];
  const zoneName = agroClimaticZones[districtIntel.zone] || districtIntel.zone;

  const priceMap = {
    rice: { msp: 2400, mandi: 2650, corp: 2800 },
    coconut: { msp: 11160, mandi: 12100, corp: 13000 },
    turmeric: { msp: 7800, mandi: 10200, corp: 11500 },
    jasmine: { msp: 40000, mandi: 65000, corp: 45000 },
    cashew: { msp: 9500, mandi: 11800, corp: 12800 },
    sugarcane: { msp: 315, mandi: 340, corp: 360 },
    groundnut: { msp: 6377, mandi: 7200, corp: 7600 },
    maize: { msp: 2090, mandi: 2300, corp: 2500 },
    tea: { msp: 1800, mandi: 2400, corp: 2800 },
    potato: { msp: 1500, mandi: 2200, corp: 2500 }
  };
  const currentPrices = priceMap[selectedCrop] || priceMap['rice'];

  const weatherMap = {
    rice: 'BPH Alert', coconut: 'Dry Wind', turmeric: 'Rot Warning', jasmine: 'Budworm Risk', cashew: 'Borer Warning',
    sugarcane: 'Lodging Risk', groundnut: 'Root Rot', maize: 'Armyworm Alert', tea: 'Frost Risk', potato: 'Blight Warning'
  };
  const currentWeatherBadge = weatherMap[selectedCrop] || 'Stable Skies';

  const tempMap = {
    rice: 14, coconut: 15, turmeric: 12, jasmine: 4, cashew: 18,
    sugarcane: 10, groundnut: 15, maize: 15, tea: 18, potato: 5
  };
  const currentTemp = tempMap[selectedCrop] || 12;

  const officerMap = {
    thiruvarur: 'K. Ranganathan (+91-94425-01234)',
    salem: 'A. Rajkumar (+91-98650-54321)',
    coimbatore: 'R. Senthil (+91-94432-87654)',
    madurai: 'S. Alagarsamy (+91-98421-12345)',
    cuddalore: 'M. Velmurugan (+91-94421-09876)',
    thanjavur: 'T. Krishnasamy (+91-94431-11223)',
    nagapattinam: 'V. Sundaram (+91-98432-44556)',
    tiruchirappalli: 'S. Ramalingam (+91-94420-77889)',
    dindigul: 'R. Periyasamy (+91-98651-33445)',
    nilgiris: 'J. Halder (+91-98430-99887)'
  };
  const activeOfficerInfo = officerMap[selectedDistrict] || 'P. Selvam (Agri Officer: +91-94420-11223)';

  // Calculate simulated soil vs target nutrients based on TNAU database
  const soilNutrientData = [
    {
      name: 'Nitrogen (N)',
      actual: Math.round(cropIntel.N * 0.65),
      target: cropIntel.N
    },
    {
      name: 'Phosphorus (P)',
      actual: Math.round(cropIntel.P * 0.82),
      target: cropIntel.P
    },
    {
      name: 'Potassium (K)',
      actual: Math.round(cropIntel.K * 1.05),
      target: cropIntel.K
    }
  ];

  // Pricing comparison chart
  const pricingData = [
    { name: 'Govt MSP', price: currentPrices.msp, fill: '#1b7c3f' },
    { name: 'Private Mandi', price: currentPrices.mandi, fill: '#D4AF37' },
    { name: 'Corporate Contract', price: currentPrices.corp, fill: '#3b82f6' }
  ];

  // Navigation module buttons
  const modules = [
    { id: 'fertilizer', path: '/fertilizer', title: t('dashboard.modules.fertilizer.title'), icon: Sprout, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' },
    { id: 'market', path: '/market', title: t('dashboard.modules.market.title'), icon: TrendingUp, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' },
    { id: 'weather', path: '/weather', title: t('dashboard.modules.weather.title'), icon: CloudSun, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20' },
    { id: 'value-added', path: '/value-added', title: t('dashboard.modules.value_added.title'), icon: PackageCheck, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' },
    { id: 'storage', path: '/storage', title: t('dashboard.modules.storage.title'), icon: Building, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' },
    { id: 'schemes', path: '/schemes', title: t('dashboard.modules.schemes.title'), icon: UserCheck, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20' },
    { id: 'officer', path: '/officer', title: t('dashboard.modules.officer.title'), icon: User, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20' },
    { id: 'doctor', path: '/doctor', title: t('dashboard.modules.doctor.title'), icon: Stethoscope, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20' },
    { id: 'soil-analysis', path: '/soil-analysis', title: 'AI Soil Analysis', icon: FlaskConical, color: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/20' },
    { id: 'disease-detection', path: '/disease-detection', title: 'Disease Detection', icon: Microscope, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20' }
  ];

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">

      {/* 1. Large Warm Farmer Greeting Banner */}
      <div className="bg-[#FAF8F5] dark:bg-[#15251C] border border-brand-borderLight dark:border-brand-borderDark p-6 sm:p-8 rounded-2xl premium-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold dark:text-brand-goldDark block">
            {districtName} · {zoneName.split(' (')[0]}
          </span>
          <h1 className="text-3xl font-extrabold text-brand-primary dark:text-[#EDEFE9] tracking-tight">
            {t('common.language') === 'ta' ? `வணக்கம், ${userName}!` : `Vanakkam, ${userName}!`}
          </h1>
          <p className="text-sm text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
            {t('common.language') === 'ta'
              ? `உங்கள் ${cropName} பயிரை வளர்ப்பதற்கான எளிய தினசரி விவசாய ஆலோசனைகள் தயார் நிலையில் உள்ளன.`
              : `Your personalized daily farm instructions for ${cropName} are ready below.`}
          </p>
        </div>

        {/* Change context link */}
        <Link
          to="/crop-recommendation"
          className="px-4 py-2 border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-darkSurface rounded-xl text-xs font-bold text-brand-primary dark:text-[#EDEFE9] hover:opacity-85 transition-opacity premium-shadow shrink-0"
        >
          {t('dashboard.change_crop')}
        </Link>
      </div>

      {/* 2. Terminal Quick Links Grid (Modules Menu moved on top) */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondaryLight/80 dark:text-brand-textSecondaryDark/80">
          Command Terminal Modules
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Link
                  to={mod.path}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-xl premium-shadow hover:border-brand-primary/30 dark:hover:border-brand-gold/30 transition-all text-left"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${mod.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-xs text-brand-primary dark:text-[#EDEFE9] group-hover:text-brand-gold transition-colors line-clamp-2 leading-snug">
                    {mod.title}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Simplified Daily Action Checklist (Farmer-First Layout) */}
      <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark p-6 sm:p-8 rounded-2xl premium-shadow space-y-6">
        <div className="flex items-center gap-2.5 border-b border-brand-borderLight dark:border-brand-borderDark pb-4">
          <CheckCircle className="w-6 h-6 text-brand-gold shrink-0" />
          <h2 className="text-lg font-bold text-brand-primary dark:text-[#EDEFE9] tracking-tight">
            {t('dashboard.checklist_title')}
          </h2>
        </div>

        {/* Big checklist bullet items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">

          {/* Bullet 1: Growth Stage */}
          <div className="flex gap-3 bg-[#FAF8F5] dark:bg-[#1C2C22] p-4 rounded-xl border border-brand-borderLight dark:border-brand-borderDark">
            <Sprout className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-primary dark:text-[#EDEFE9] block mb-1">
                {t('dashboard.growth_stage_bullet')}
              </span>
              <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
                {t('common.language') === 'ta'
                  ? `விதைப்புப் பருவம் தொடங்கிவிட்டதால், மண்ணை நன்கு தயார் செய்து பரிந்துரைக்கப்பட்ட அடி உரத்தைப் போடுங்கள்.`
                  : `Ensure correct land levelling and moisture availability before sowing your seeds today.`}
              </p>
            </div>
          </div>

          {/* Bullet 2: Soil Nutrients */}
          <div className="flex gap-3 bg-[#FAF8F5] dark:bg-[#1C2C22] p-4 rounded-xl border border-brand-borderLight dark:border-brand-borderDark">
            <Activity className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-primary dark:text-[#EDEFE9] block mb-1">
                {t('dashboard.soil_bullet', { n: cropIntel.N, p: cropIntel.P, k: cropIntel.K })}
              </span>
              <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
                {t('common.language') === 'ta'
                  ? `உரக் கணக்கீட்டுக் கருவியைப் பயன்படுத்தி உங்கள் நில அளவுக்குத் தேவையான யூரியா மற்றும் சூப்பர் பாஸ்பேட்டைத் தேர்வுசெய்யுங்கள்.`
                  : `Use the calculator below to weigh quantities of Urea, SSP, and MOP customized to your acreage.`}
              </p>
            </div>
          </div>

          {/* Bullet 3: Weather conditions */}
          <div className="flex gap-3 bg-[#FAF8F5] dark:bg-[#1C2C22] p-4 rounded-xl border border-brand-borderLight dark:border-brand-borderDark">
            <CloudSun className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-primary dark:text-[#EDEFE9] block mb-1">
                {t('dashboard.weather_bullet')}
              </span>
              <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
                {t('common.language') === 'ta'
                  ? `இன்றைய வானிலை மிதமான வெப்பநிலை (29°C) மற்றும் காற்றோட்டத்துடன் சாதகமாக உள்ளது. உரம் கரைவதற்கு உகந்த நேரம்.`
                  : `Good soil temperature of 29°C. Best window for split application of fertilizer doses.`}
              </p>
            </div>
          </div>

          {/* Bullet 4: Extension Officer */}
          <div className="flex gap-3 bg-[#FAF8F5] dark:bg-[#1C2C22] p-4 rounded-xl border border-brand-borderLight dark:border-brand-borderDark">
            <Phone className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-primary dark:text-[#EDEFE9] block mb-1">
                {t('dashboard.officer_bullet', { name: activeOfficerInfo.split(' (+')[0] })}
              </span>
              <p className="text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark leading-relaxed">
                {t('common.language') === 'ta'
                  ? `உங்கள் பயிருக்குத் தேவையான அரசு மானியங்கள் மற்றும் கடன் வசதிகள் குறித்து ஆலோசனை பெற அதிகாரியைத் தொடர்பு கொள்ளவும்: ${activeOfficerInfo.split(' (Agri Officer: ')[1] || activeOfficerInfo.split(' (+')[1].replace(')', '')}`
                  : `Get assistance with Patta verification and seed subsidies directly at: ${activeOfficerInfo.split(' (Agri Officer: ')[1] || activeOfficerInfo.split(' (+')[1].replace(')', '')}`}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Core Quick-Read Metric Blocks */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondaryLight/80 dark:text-brand-textSecondaryDark/80">
          {t('dashboard.metrics_title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Fertilizer Dose */}
          <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark p-6 rounded-2xl premium-shadow flex flex-col justify-between h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-brand-textSecondaryLight dark:text-brand-textSecondaryDark uppercase block">
                {t('dashboard.nutrient_box')}
              </span>
              <div className="mt-3.5 space-y-1.5 text-sm">
                <div className="flex justify-between font-bold">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">Urea (Nitrogen)</span>
                  <span className="text-[#1b7c3f] font-extrabold">{cropIntel.ureaPerAcre} kg / acre</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">SSP (Phosphorus)</span>
                  <span className="text-[#9e8020] dark:text-brand-gold font-extrabold">{cropIntel.sspPerAcre} kg / acre</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">MOP (Potassium)</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">{cropIntel.mopPerAcre} kg / acre</span>
                </div>
              </div>
            </div>
            <Link to="/fertilizer" className="text-xs font-bold text-brand-gold hover:opacity-85 flex items-center gap-1 mt-3">
              <span>View Nutrient Calculator</span>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </Link>
          </div>

          {/* Card 2: Market Prices */}
          <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark p-6 rounded-2xl premium-shadow flex flex-col justify-between h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-brand-textSecondaryLight dark:text-brand-textSecondaryDark uppercase block">
                {t('dashboard.market_box')}
              </span>
              <div className="mt-3.5 space-y-2 text-sm font-bold">
                <div className="flex justify-between">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">Local Mandi</span>
                  <span className="text-brand-primary dark:text-[#EDEFE9] font-extrabold">₹{currentPrices.mandi.toLocaleString('en-IN')} / Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">Govt Floor (MSP)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{currentPrices.msp.toLocaleString('en-IN')} / Qtl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">Corporate Deal</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">₹{currentPrices.corp.toLocaleString('en-IN')} / Qtl</span>
                </div>
              </div>
            </div>
            <Link to="/market" className="text-xs font-bold text-brand-gold hover:opacity-85 flex items-center gap-1 mt-3">
              <span>View Market Trends</span>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </Link>
          </div>

          {/* Card 3: Storage & Nearest Warehouse */}
          <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark p-6 rounded-2xl premium-shadow flex flex-col justify-between h-[180px]">
            <div>
              <span className="text-[10px] font-bold text-brand-textSecondaryLight dark:text-brand-textSecondaryDark uppercase block">
                {t('dashboard.weather_box')}
              </span>
              <div className="mt-3.5 space-y-2 text-sm font-bold">
                <div className="flex justify-between">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">Storage Temp</span>
                  <span className="text-brand-primary dark:text-[#EDEFE9] font-extrabold">{currentTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">Max Humidity</span>
                  <span className="text-brand-primary dark:text-[#EDEFE9] font-extrabold">{cropIntel.humidity || 60}% RH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">Nearest Storage</span>
                  <span className="text-brand-primary dark:text-[#EDEFE9] font-extrabold">{cropIntel.dist || 3.5} km</span>
                </div>
              </div>
            </div>
            <Link to="/storage" className="text-xs font-bold text-brand-gold hover:opacity-85 flex items-center gap-1 mt-3">
              <span>Find Warehouse Location</span>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
            </Link>
          </div>

        </div>
      </div>

      {/* 5. Show/Hide Advanced Charts Toggle (For simple layout preference) */}
      <div className="bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-4 premium-shadow flex flex-col items-center">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary dark:text-brand-gold dark:bg-brand-gold/5 dark:hover:bg-brand-gold/10 text-xs font-bold transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>{showCharts ? t('dashboard.hide_charts') : t('dashboard.show_charts')}</span>
          {showCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Collapsible Recharts Grid */}
        <AnimatePresence>
          {showCharts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mt-6 pt-6 border-t border-brand-borderLight dark:border-brand-borderDark overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Composed Chart Soil Nutrients */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9]">
                    TNAU Soil Nutrient Deficit Analysis
                  </h3>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={soilNutrientData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(11, 61, 32, 0.03)" />
                        <XAxis dataKey="name" stroke="#8fa396" fontSize={10} tickLine={false} />
                        <YAxis stroke="#8fa396" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#101F16', borderColor: 'rgba(212, 175, 55, 0.12)', borderRadius: '8px' }}
                          labelStyle={{ color: '#EDEFE9', fontSize: '11px', fontWeight: 'bold' }}
                          itemStyle={{ fontSize: '11px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <Bar dataKey="actual" name="Actual Soil Nutrient" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={25} />
                        <Line type="monotone" dataKey="target" name="Recommended Target" stroke="#1b7c3f" strokeWidth={3} dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Price comparison Bar Chart */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9]">
                    Market Pricing Channels (₹ / Qtl)
                  </h3>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pricingData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#8fa396" fontSize={9} tickLine={false} />
                        <YAxis stroke="#8fa396" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#101F16', borderColor: 'rgba(212, 175, 55, 0.12)', borderRadius: '8px' }}
                          labelStyle={{ color: '#EDEFE9', fontSize: '11px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#C9A93E', fontSize: '11px' }}
                        />
                        <Bar dataKey="price" radius={[5, 5, 0, 0]}>
                          {pricingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
