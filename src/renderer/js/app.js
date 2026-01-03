import { UI } from './ui.js';

// State
const state = {
    isAlwaysOnTop: true,
    isLightMode: localStorage.getItem('theme') === 'light',
    isCompactMode: localStorage.getItem('compact') === 'true',
    pinnedModels: new Set(JSON.parse(localStorage.getItem('pinnedModels') || '[]')),
    refreshInterval: null
};

// Initialization
async function init() {
    setupEventListeners();
    
    // Initial UI State
    UI.updateTheme(state.isLightMode);
    UI.updateCompactMode(state.isCompactMode);
    UI.updateAlwaysOnTopIcon(state.isAlwaysOnTop);

    // Initial Fetch
    await fetchAllData();
    startAutoRefresh();
}

function setupEventListeners() {
    // Window Controls
    UI.els.minimizeBtn.onclick = () => window.api.minimize();
    UI.els.closeBtn.onclick = () => window.api.close();
    UI.els.alwaysOnTopBtn.onclick = async () => {
        state.isAlwaysOnTop = !state.isAlwaysOnTop;
        await window.api.toggleAlwaysOnTop(state.isAlwaysOnTop);
        UI.updateAlwaysOnTopIcon(state.isAlwaysOnTop);
    };

    // Theme & Compact
    UI.els.themeBtn.onclick = () => {
        state.isLightMode = !state.isLightMode;
        localStorage.setItem('theme', state.isLightMode ? 'light' : 'dark');
        UI.updateTheme(state.isLightMode);
    };

    UI.els.compactBtn.onclick = () => {
        state.isCompactMode = !state.isCompactMode;
        localStorage.setItem('compact', String(state.isCompactMode));
        UI.updateCompactMode(state.isCompactMode);
    };

    // Tabs & Refresh
    UI.els.refreshBtn.onclick = fetchAllData;
    UI.els.tabBtns.forEach(btn => {
        btn.onclick = () => UI.switchTab(btn.dataset.tab);
    });

    // Modal
    UI.els.closeModal.onclick = () => UI.closeModal();
    UI.els.modelModal.onclick = (e) => {
        if (e.target === UI.els.modelModal) UI.closeModal();
    };

    // Listeners from Main
    window.api.onAlwaysOnTopChanged((value) => {
        state.isAlwaysOnTop = value;
        UI.updateAlwaysOnTopIcon(value);
    });
    
    // Visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAutoRefresh();
        else startAutoRefresh();
    });
}

async function fetchAllData() {
    try {
        UI.updateStatus('Connecting...');
        
        // OPTIMIZATION: Batched IPC call
        const response = await window.api.getAllData();
        const { running, available } = response;

        if (running.success && available.success) {
            UI.updateStatus('Connected');
            
            // Sort Available Models (Pinned First)
            const availableModels = (available.data.models || []).sort((a, b) => {
                const pinA = state.pinnedModels.has(a.name);
                const pinB = state.pinnedModels.has(b.name);
                if (pinA && !pinB) return -1;
                if (!pinA && pinB) return 1;
                return a.name.localeCompare(b.name);
            });

            // Render Lists
            UI.renderRunningModels(
                running.data.models || [], 
                handleStopModel, 
                handleModelDetails
            );
            UI.renderAvailableModels(
                availableModels, 
                state.pinnedModels,
                handleTogglePin,
                handleModelDetails
            );

        } else {
            UI.updateStatus('Connection failed');
            UI.displayError('Failed to connect to Ollama API');
        }
    } catch (e) {
        console.error(e);
        UI.updateStatus('Error');
    }
}

function handleTogglePin(name) {
    if (state.pinnedModels.has(name)) {
        state.pinnedModels.delete(name);
    } else {
        state.pinnedModels.add(name);
    }
    localStorage.setItem('pinnedModels', JSON.stringify([...state.pinnedModels]));
    fetchAllData(); // Re-render to update sort and icon
}

async function handleStopModel(name) {
    if (!confirm(`Stop model ${name}?`)) return;
    const res = await window.api.stopModel(name);
    if (res.success) fetchAllData();
    else alert('Failed to stop model');
}

async function handleModelDetails(name) {
    UI.openModal(name, '<div class="loading">Loading details...</div>');
    
    try {
        const res = await window.api.getModelDetails(name);
        if (res.success && res.data) {
            const d = res.data;
            let html = '';
            
            if (d.details) {
                html += `
                    <div class="detail-row"><strong>Family:</strong> ${d.details.family || 'N/A'}</div>
                    <div class="detail-row"><strong>Format:</strong> ${d.details.format || 'N/A'}</div>
                    <div class="detail-row"><strong>Params:</strong> ${d.details.parameter_size || 'N/A'}</div>
                    <div class="detail-row"><strong>Quant:</strong> ${d.details.quantization_level || 'N/A'}</div>
                `;
            }
            if (d.template) {
                html += `<div class="detail-row"><strong>Template:</strong><pre>${d.template}</pre></div>`;
            }
            
            UI.openModal(name, html);
        } else {
            UI.openModal(name, `<div class="error-message">${res.error || 'Failed'}</div>`);
        }
    } catch (e) {
        UI.openModal(name, '<div class="error-message">Error loading details</div>');
    }
}

function startAutoRefresh() {
    state.refreshInterval = setInterval(fetchAllData, 5000);
}

function stopAutoRefresh() {
    if (state.refreshInterval) clearInterval(state.refreshInterval);
}

// Start
document.addEventListener('DOMContentLoaded', init);