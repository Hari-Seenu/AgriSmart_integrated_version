import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store.jsx';
import { MapPin, User, ChevronDown, Check, Sun, Moon, Languages, Search, X, Loader2, Navigation } from 'lucide-react';

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    updateOnboarding, 
    language, 
    theme, 
    toggleLanguage, 
    toggleTheme,
    googleMapsApiKey 
  } = useAppState();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Map state
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lat, setLat] = useState(10.7905); // Central Tamil Nadu
  const [lng, setLng] = useState(78.7047);
  const [address, setAddress] = useState('');
  const [mapError, setMapError] = useState('');

  const districts = [
    'ariyalur', 'chengalpattu', 'chennai', 'coimbatore', 'cuddalore', 
    'dharmapuri', 'dindigul', 'erode', 'kallakurichi', 'kancheepuram', 
    'kanyakumari', 'karur', 'krishnagiri', 'madurai', 'mayiladuthurai', 
    'nagapattinam', 'namakkal', 'nilgiris', 'perambalur', 'pudukkottai', 
    'ramanathapuram', 'ranipet', 'salem', 'sivagangai', 'tenkasi', 
    'thanjavur', 'theni', 'thiruvallur', 'thiruvannamalai', 'thiruvarur', 
    'thoothukudi', 'tiruchirappalli', 'tirunelveli', 'tirupathur', 
    'tiruppur', 'vellore', 'viluppuram', 'virudhunagar'
  ];

  const filteredDistricts = districts.filter(d => {
    const localName = t(`districts.${d}`).toLowerCase();
    const searchVal = searchTerm.toLowerCase();
    return localName.includes(searchVal);
  });

  // Start pre-loading Google Maps script immediately on component mount (Step 1)
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.onload = () => setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      script.onerror = () => {
        setMapError(t('onboarding.maps.load_error') || 'Failed to load Google Maps script.');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when entering Step 2
  useEffect(() => {
    if (step === 2 && mapLoaded) {
      initializeMap();
    }
  }, [step, mapLoaded]);

  const initializeMap = () => {
    if (!mapRef.current) return;
    setMapLoaded(true);

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: lat, lng: lng },
        zoom: 7,
        styles: theme === 'dark' ? getDarkMapStyles() : [],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const markerInstance = new window.google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      // Places Search Autocomplete
      if (searchInputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
        autocomplete.bindTo('bounds', mapInstance);

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry) return;

          if (place.geometry.viewport) {
            mapInstance.fitBounds(place.geometry.viewport);
          } else {
            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(15);
          }

          const position = place.geometry.location;
          markerInstance.setPosition(position);
          setLat(position.lat());
          setLng(position.lng());
          setAddress(place.formatted_address || place.name || '');
          detectDistrictFromAddress(place.formatted_address || '');
        });
      }

      // Drag marker listener
      markerInstance.addListener('dragend', () => {
        const pos = markerInstance.getPosition();
        setLat(pos.lat());
        setLng(pos.lng());
        reverseGeocode(pos.lat(), pos.lng());
      });

      // Map click listener
      mapInstance.addListener('click', (e) => {
        markerInstance.setPosition(e.latLng);
        setLat(e.latLng.lat());
        setLng(e.latLng.lng());
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      });

      // Initial reverse geocode if address is empty
      if (!address) {
        reverseGeocode(lat, lng);
      }

    } catch (err) {
      console.error("Map Init Error:", err);
      setMapError('Failed to render Google Map. Verify your network or API keys.');
    }
  };

  const reverseGeocode = (latitude, longitude) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const formatted = results[0].formatted_address;
        setAddress(formatted);
        detectDistrictFromAddress(formatted);
      } else {
        setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }
    });
  };

  const detectDistrictFromAddress = (addressStr) => {
    const lowerAddress = addressStr.toLowerCase();
    
    // Scan address string for district matches
    const matched = districts.find(d => {
      const englishName = d.toLowerCase();
      // Also match tamil names if present
      const tamilName = t(`districts.${d}`).toLowerCase();
      return lowerAddress.includes(englishName) || lowerAddress.includes(tamilName);
    });

    if (matched) {
      setDistrict(matched);
      setError('');
    }
  };

  // Get current GPS location
  const getCurrentGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        reverseGeocode(latitude, longitude);
        
        // Re-center map if loaded
        if (window.google && window.google.maps && mapRef.current) {
          initializeMap();
        }
      },
      (err) => {
        console.error(err);
        setError('Failed to acquire GPS location. Please place marker manually.');
      }
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim()) {
        setError(t('onboarding.validation_name'));
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!address) {
        setError(t('onboarding.validation_map') || 'Please select a location on the map.');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!district) {
      setError(t('onboarding.validation_district'));
      return;
    }
    setError('');
    updateOnboarding(name.trim(), district, lat, lng, address);
    navigate('/crop-recommendation');
  };

  const getDarkMapStyles = () => [
    { elementType: 'geometry', stylers: [{ color: '#101F16' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#101F16' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8fa396' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c9a93e' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8fa396' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0b3d20' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a3022' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#132319' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8fa396' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#091410' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8fa396' }] }
  ];

  return (
    <div className="min-h-screen bg-brand-primary/5 dark:bg-brand-darkBg flex flex-col justify-between p-6 transition-colors duration-200">
      
      {/* Top Utility Bar */}
      <div className="w-full max-w-lg mx-auto flex justify-end gap-3">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-darkSurface text-xs font-medium premium-shadow hover:opacity-80 transition-opacity"
        >
          <Languages className="w-3.5 h-3.5" />
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-borderLight dark:border-brand-borderDark bg-white dark:bg-brand-darkSurface text-xs font-medium premium-shadow hover:opacity-80 transition-opacity"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-brand-primary" />
              <span>{t('common.dark')}</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-brand-gold" />
              <span>{t('common.light')}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Multi-Step Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-2xl p-6 sm:p-8 premium-shadow"
        >
          <div className="text-center mb-6">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-gold dark:text-brand-goldDark mb-1">
              {t('common.app_name')} · Step {step} of 3
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-brand-primary dark:text-[#EDEFE9]">
              {step === 1 && t('onboarding.title')}
              {step === 2 && (t('onboarding.maps.title') || 'Select Farm Location')}
              {step === 3 && (t('onboarding.district_confirm.title') || 'Confirm District')}
            </h1>
            <p className="mt-1.5 text-xs text-brand-textSecondaryLight dark:text-brand-textSecondaryDark font-normal">
              {step === 1 && t('onboarding.subtitle')}
              {step === 2 && (t('onboarding.maps.subtitle') || 'Search or place marker on Google Maps')}
              {step === 3 && (t('onboarding.district_confirm.subtitle') || 'Verify resolved zone for TNAU calculations')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Farmer Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="space-y-2 text-left">
                  <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9]">
                    {t('onboarding.name_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder={t('onboarding.name_placeholder')}
                      className="block w-full pl-10 pr-4 py-3 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                    />
                  </div>
                </div>

                {error && <p className="text-xs font-bold text-red-600 dark:text-red-400 text-left">{error}</p>}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white dark:bg-brand-gold dark:hover:bg-brand-gold/90 dark:text-brand-darkBg font-bold py-3 rounded-xl text-xs transition-all shadow-md"
                >
                  {t('common.continue')}
                </button>
              </motion.div>
            )}

            {/* Step 2: Google Maps Location Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {/* Autocomplete Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-textSecondaryLight dark:text-brand-textSecondaryDark">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('onboarding.maps.search_placeholder') || "Search village, farm address, or city..."}
                    className="block w-full pl-10 pr-10 py-2.5 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                  />
                  <button
                    type="button"
                    onClick={getCurrentGPS}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-gold hover:opacity-85"
                    title="Find My Location via GPS"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>

                {/* Map Canvas */}
                <div className="relative rounded-xl border border-brand-borderLight dark:border-brand-borderDark overflow-hidden premium-shadow bg-brand-primary/[0.01]">
                  <div 
                    ref={mapRef} 
                    className="w-full h-52 relative"
                  />
                  
                  {!mapLoaded && !mapError && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-brand-darkSurface/70 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-brand-gold animate-spin" />
                      <span className="text-[10px] font-bold text-brand-textSecondaryLight">Initializing Map...</span>
                    </div>
                  )}

                  {mapError && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-brand-darkSurface/95 p-4 flex flex-col items-center justify-center text-center gap-2">
                      <MapPin className="w-8 h-8 text-brand-gold" />
                      <span className="text-xs font-bold text-brand-primary dark:text-[#EDEFE9]">{mapError}</span>
                      <span className="text-[9px] text-brand-textSecondaryLight">Double-click or drag to select coordinate fallbacks.</span>
                    </div>
                  )}
                </div>

                {/* Selected Location info panel */}
                {address && (
                  <div className="bg-[#FAF8F5] dark:bg-[#1C2C22] p-3 rounded-xl border border-brand-borderLight dark:border-brand-borderDark text-left space-y-1.5">
                    <span className="text-[8px] uppercase font-bold text-brand-gold block">Selected Address</span>
                    <p className="text-xs text-brand-primary dark:text-[#EDEFE9] font-medium leading-relaxed line-clamp-2">
                      {address}
                    </p>
                    <span className="text-[9px] font-mono text-brand-textSecondaryLight/80 block">
                      Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
                    </span>
                  </div>
                )}

                {error && <p className="text-xs font-bold text-red-600 dark:text-red-400 text-left">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-xs font-bold text-brand-textSecondaryLight hover:bg-brand-primary/5 transition-all py-3"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-brand-primary hover:bg-brand-primary/95 text-white dark:bg-brand-gold dark:hover:bg-brand-gold/90 dark:text-brand-darkBg font-bold py-3 rounded-xl text-xs transition-all shadow-md"
                  >
                    Confirm Location
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: District verification dropdown */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="space-y-2 relative text-left">
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-[#EDEFE9]">
                    Confirm Agricultural District
                  </label>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 bg-brand-primary/[0.02] dark:bg-brand-primary/[0.04] border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-sm font-semibold text-left focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4.5 w-4.5 text-brand-gold" />
                        {district ? t(`districts.${district}`) : <span className="text-brand-textSecondaryLight/50">Select matching district</span>}
                      </span>
                      <ChevronDown className={`h-4.5 w-4.5 text-brand-textSecondaryLight transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => { setIsOpen(false); setSearchTerm(''); }} />
                        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-brand-darkSurface border border-brand-borderLight dark:border-brand-borderDark rounded-xl shadow-lg z-20 overflow-hidden premium-shadow flex flex-col max-h-[220px]">
                          
                          <div className="p-2 border-b border-brand-borderLight dark:border-brand-borderDark bg-brand-primary/[0.01] flex items-center gap-2 sticky top-0 z-10">
                            <Search className="w-3.5 h-3.5 text-brand-textSecondaryLight shrink-0" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search..."
                              className="w-full bg-transparent text-xs focus:outline-none py-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div className="overflow-y-auto divide-y divide-brand-borderLight dark:divide-brand-borderDark flex-1">
                            {filteredDistricts.length > 0 ? (
                              filteredDistricts.map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => {
                                    setDistrict(d);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                    if (error) setError('');
                                  }}
                                  className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-brand-primary/5 text-left text-xs font-semibold transition-colors"
                                >
                                  <span>{t(`districts.${d}`)}</span>
                                  {district === d && <Check className="w-3.5 h-3.5 text-brand-gold" />}
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-xs text-center text-brand-textSecondaryLight">
                                No matching districts.
                              </div>
                            )}
                          </div>

                        </div>
                      </>
                    )}
                  </div>
                </div>

                {error && <p className="text-xs font-bold text-red-600 dark:text-red-400 text-left">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border border-brand-borderLight dark:border-brand-borderDark rounded-xl text-xs font-bold text-brand-textSecondaryLight hover:bg-brand-primary/5 transition-all py-3"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-brand-primary hover:bg-brand-primary/95 text-white dark:bg-brand-gold dark:hover:bg-brand-gold/90 dark:text-brand-darkBg font-bold py-3 rounded-xl text-xs transition-all shadow-md"
                  >
                    {t('onboarding.get_started')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="w-full text-center py-4 text-xs font-medium text-brand-textSecondaryLight/60 dark:text-brand-textSecondaryDark/40">
        © 2026 Tamil Nadu Agriculture Extension Department. Powered by Smart Agri Intelligence.
      </div>
    </div>
  );
}
