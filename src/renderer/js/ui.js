export const UI = {
    els: {
        statusText: document.getElementById('statusText'),
        runningModelsList: document.getElementById('runningModelsList'),
        availableModelsList: document.getElementById('availableModelsList'),
        refreshBtn: document.getElementById('refreshBtn'),
        minimizeBtn: document.getElementById('minimizeBtn'),
        closeBtn: document.getElementById('closeBtn'),
        alwaysOnTopBtn: document.getElementById('alwaysOnTopBtn'),
        themeBtn: document.getElementById('themeBtn'),
        compactBtn: document.getElementById('compactBtn'),
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        // Modal
        modelModal: document.getElementById('modelModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        closeModal: document.getElementById('closeModal')
    },

    updateStatus(text) {
        this.els.statusText.textContent = text;
        // Fix: Toggle connected class for visual indicator
        this.els.statusText.classList.toggle('connected', text === 'Connected');
    },

    switchTab(tabName) {
        this.els.tabBtns.forEach(btn => 
            btn.classList.toggle('active', btn.dataset.tab === tabName));
        this.els.tabContents.forEach(content => 
            content.classList.toggle('active', content.id === `${tabName}-tab`));
    },

    updateAlwaysOnTopIcon(isAlwaysOnTop) {
        const btn = this.els.alwaysOnTopBtn;
        if (isAlwaysOnTop) {
            btn.classList.add('active');
            btn.innerHTML = '📌';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '📍';
        }
    },

    updateTheme(isLight) {
        const btn = this.els.themeBtn;
        if (isLight) {
            document.body.classList.add('light-theme');
            btn.innerHTML = '🌙';
        } else {
            document.body.classList.remove('light-theme');
            btn.innerHTML = '☀';
        }
    },

    updateCompactMode(isCompact) {
        const btn = this.els.compactBtn;
        if (isCompact) {
            document.body.classList.add('compact-mode');
            btn.classList.add('active');
        } else {
            document.body.classList.remove('compact-mode');
            btn.classList.remove('active');
        }
    },

    displayError(message) {
        const html = `<div class="error-message">${message}</div>`;
        this.els.runningModelsList.innerHTML = html;
        this.els.availableModelsList.innerHTML = html;
    },

    // OPTIMIZATION: Diffing Logic for Lists
    updateList(container, items, idKey, createFn, updateFn) {
        // Handle Empty State
        if (items.length === 0) {
            container.innerHTML = '<div class="empty-state">No models</div>';
            return;
        }
        if (container.querySelector('.empty-state')) {
            container.innerHTML = '';
        }

        const loadingEl = container.querySelector('.loading');
        if (loadingEl) {
            loadingEl.remove();
        }

        const existingMap = new Map();
        Array.from(container.children).forEach(el => {
            if (el.dataset.id) existingMap.set(el.dataset.id, el);
        });

        const currentIds = new Set();

        items.forEach((item, index) => {
            const id = item[idKey];
            currentIds.add(id);
            
            let el = existingMap.get(id);
            if (el) {
                // Update existing
                updateFn(el, item);
                // Reorder if necessary: If the element at this index isn't the correct one, move it
                if (container.children[index] !== el) {
                    container.insertBefore(el, container.children[index]);
                }
            } else {
                // Create new
                el = createFn(item);
                el.dataset.id = id;
                if (index < container.children.length) {
                    container.insertBefore(el, container.children[index]);
                } else {
                    container.appendChild(el);
                }
            }
        });

        // Remove stale
        existingMap.forEach((el, id) => {
            if (!currentIds.has(id)) el.remove();
        });
    },

    renderRunningModels(models, onStop, onDetails) {
        const createFn = (model) => {
            const item = document.createElement('div');
            item.className = 'model-item';
            
            const sizeGB = (model.size / (1024 * 1024 * 1024)).toFixed(1);
            const vramGB = model.size_vram ? (model.size_vram / (1024 * 1024 * 1024)).toFixed(1) : 'N/A';
            
            item.innerHTML = `
                <div class="model-header">
                    <div class="model-name" title="Click for details" style="cursor: pointer; text-decoration: underline; text-decoration-style: dotted;">${model.name}</div>
                    <button class="stop-btn" title="Stop Model">⏹</button>
                </div>
                <div class="model-details">
                    <div class="detail-item"><span class="detail-label">Size</span><span class="detail-value size-val">${sizeGB}GB</span></div>
                    <div class="detail-item"><span class="detail-label">VRAM</span><span class="detail-value vram-val">${vramGB}GB</span></div>
                    <div class="detail-item"><span class="detail-label">Context</span><span class="detail-value ctx-val">${model.context_length || 'N/A'}</span></div>
                </div>
            `;
            
            item.querySelector('.stop-btn').onclick = () => onStop(model.name);
            item.querySelector('.model-name').onclick = () => onDetails(model.name);
            return item;
        };

        const updateFn = (el, model) => {
            const sizeGB = (model.size / (1024 * 1024 * 1024)).toFixed(1);
            const vramGB = model.size_vram ? (model.size_vram / (1024 * 1024 * 1024)).toFixed(1) : 'N/A';
            
            // Only update text content if changed
            const sizeEl = el.querySelector('.size-val');
            if (sizeEl.textContent !== `${sizeGB}GB`) sizeEl.textContent = `${sizeGB}GB`;
            
            const vramEl = el.querySelector('.vram-val');
            if (vramEl.textContent !== `${vramGB}GB`) vramEl.textContent = `${vramGB}GB`;
            
            const ctxEl = el.querySelector('.ctx-val');
            const ctxText = `${model.context_length || 'N/A'}`;
            if (ctxEl.textContent !== ctxText) ctxEl.textContent = ctxText;
        };

        this.updateList(this.els.runningModelsList, models, 'name', createFn, updateFn);
    },

    renderAvailableModels(models, pinnedModels, onTogglePin, onDetails) {
        const createFn = (model) => {
            const item = document.createElement('div');
            item.className = 'available-model';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';

            const isPinned = pinnedModels.has(model.name);
            
            item.innerHTML = `
                <span class="model-name-text">${model.name}</span>
                <button class="pin-btn" title="${isPinned ? 'Unpin' : 'Pin'}">${isPinned ? '★' : '☆'}</button>
            `;
            
            const nameEl = item.querySelector('.model-name-text');
            const pinBtn = item.querySelector('.pin-btn');
            
            nameEl.onclick = (e) => {
                e.stopPropagation();
                onDetails(model.name);
            };
            
            pinBtn.onclick = (e) => {
                e.stopPropagation();
                onTogglePin(model.name);
            };
            
            item.onclick = (e) => {
                if (e.target !== pinBtn) onDetails(model.name);
            };

            if (isPinned) item.classList.add('pinned');
            return item;
        };

        const updateFn = (el, model) => {
            const isPinned = pinnedModels.has(model.name);
            const pinBtn = el.querySelector('.pin-btn');
            
            // Update Pin State
            if (isPinned) {
                el.classList.add('pinned');
                if (pinBtn.textContent !== '★') {
                    pinBtn.textContent = '★';
                    pinBtn.title = 'Unpin';
                }
            } else {
                el.classList.remove('pinned');
                if (pinBtn.textContent !== '☆') {
                    pinBtn.textContent = '☆';
                    pinBtn.title = 'Pin';
                }
            }
        };

        this.updateList(this.els.availableModelsList, models, 'name', createFn, updateFn);
    },

    openModal(title, htmlContent) {
        this.els.modalTitle.textContent = title;
        this.els.modalBody.innerHTML = htmlContent;
        this.els.modelModal.classList.add('active');
    },

    closeModal() {
        this.els.modelModal.classList.remove('active');
    }
};