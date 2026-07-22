// src/services/api.js
// This file handles ALL communication with the backend server
// Every API call goes through this file

import axios from 'axios';

// Backend server address
// Your teammate's Node.js server runs on port 5000
const BASE_URL = 'http://localhost:5000';

// Create axios instance with default settings
// timeout: 60000 means wait 60 seconds before giving up
// AI analysis takes 10-30 seconds, so we need enough time
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
});

// ==========================================
// 1. SOIL ANALYSIS
// Send soil data → Get crop recommendation + AI report
// ==========================================
export const analyzeSoil = async (soilData) => {
    // soilData = { n, p, k, ph, moisture, temperature, district }
    const response = await api.post('/api/analyze-soil', soilData);
    return response.data;
};

export const getSoilHistory = async () => {
    const response = await api.get('/api/soil-records');
    return response.data;
};

// ==========================================
// 2. DISEASE DETECTION
// Send leaf image → Get disease diagnosis + AI report
// ==========================================
export const detectDisease = async (imageFile, cropName) => {
    // File upload needs special format called FormData
    // NOT regular JSON - this is important
    const formData = new FormData();
    formData.append('file', imageFile);       // the image file
    formData.append('crop_name', cropName);   // text field

    const response = await api.post('/api/detect-disease', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getDiseaseHistory = async () => {
    const response = await api.get('/api/diseases');
    return response.data;
};

// ==========================================
// 3. MARKET TRENDS
// Send crop + district → Get live market prices + AI report
// ==========================================
export const getMarketTrends = async (crop, district) => {
    const response = await api.post('/api/market-trends', {
        crop,
        district
    });
    return response.data;
};

// ==========================================
// 4. YIELD MEASUREMENT
// Send area + production → Get efficiency comparison
// ==========================================
export const measureYield = async (data) => {
    // data = { district, crop, area, production }
    const response = await api.post('/api/measure', data);
    return response.data;
};

// ==========================================
// 5. AI CHAT ASSISTANT
// Send message → Get AI farming advice
// ==========================================
export const sendChatMessage = async (sessionId, message, district) => {
    const response = await api.post('/api/chat-message', {
        session_id: sessionId,
        message: message,
        district: district
    });
    return response.data;
};

export const getChatHistory = async (sessionId) => {
    const response = await api.get(`/api/chat-history/${sessionId}`);
    return response.data;
};