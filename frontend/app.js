// App.js - Main Application Logic
const App = (() => {
    const API_URL = 'http://localhost:8000';
    
    // DOM Elements
    let elements = {};
    
    // State
    let isProcessing = false;
    let objectCounter = 0;
    
    // Initialize
    const init = () => {
        cacheElements();
        setupEventListeners();
        Scene.init('scene-canvas');
        populatePositionSelector();
        addDefaultObjects();
        checkAPIStatus();
        log('System initialized', 'info');
    };
    
    const cacheElements = () => {
        elements = {
            instructionInput: document.getElementById('instruction-input'),
            sendBtn: document.getElementById('send-btn'),
            sendText: document.getElementById('send-text'),
            sendLoader: document.getElementById('send-loader'),
            outputJson: document.getElementById('output-json'),
            logContainer: document.getElementById('log-container'),
            objectList: document.getElementById('object-list'),
            objectCount: document.getElementById('object-count'),
            objColor: document.getElementById('obj-color'),
            objType: document.getElementById('obj-type'),
            objX: document.getElementById('obj-x'),
            objY: document.getElementById('obj-y'),
            positionSelect: document.getElementById('position-select'),
            addObjBtn: document.getElementById('add-obj-btn'),
            platformLabel: document.getElementById('platform-label'),
            platformColor: document.getElementById('platform-color'),
            platformX: document.getElementById('platform-x'),
            platformY: document.getElementById('platform-y'),
            platformWidth: document.getElementById('platform-width'),
            addPlatformBtn: document.getElementById('add-platform-btn'),
            resetSceneBtn: document.getElementById('reset-scene-btn'),
            clearObjectsBtn: document.getElementById('clear-objects-btn'),
            copyJsonBtn: document.getElementById('copy-json-btn'),
            clearLogBtn: document.getElementById('clear-log-btn'),
            apiStatus: document.getElementById('api-status'),
            statusDot: document.getElementById('status-dot'),
            actionOverlay: document.getElementById('action-overlay')
        };
    };
    
    const setupEventListeners = () => {
        // Send instruction
        elements.sendBtn.addEventListener('click', handleSendInstruction);
        elements.instructionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendInstruction();
            }
        });
        
        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.instructionInput.value = btn.dataset.text;
                elements.instructionInput.focus();
            });
        });
        
        // Object management
        elements.addObjBtn.addEventListener('click', handleAddObject);
        elements.addPlatformBtn.addEventListener('click', handleAddPlatform);
        elements.resetSceneBtn.addEventListener('click', resetScene);
        elements.clearObjectsBtn.addEventListener('click', clearObjects);
        
        // Position selector updates X/Y fields
        elements.positionSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const pos = Scene.resolvePosition(e.target.value);
                if (pos) {
                    elements.objX.value = Math.round(pos.x);
                    elements.objY.value = Math.round(pos.y);
                }
            }
        });
        
        // Copy JSON
        elements.copyJsonBtn.addEventListener('click', () => {
            const text = elements.outputJson.textContent;
            if (text && text !== 'Model response will appear here...') {
                navigator.clipboard.writeText(text);
                log('JSON copied to clipboard', 'success');
            }
        });
        
        // Clear log
        elements.clearLogBtn.addEventListener('click', () => {
            elements.logContainer.innerHTML = '';
        });
    };
    
    const populatePositionSelector = () => {
        const positions = Scene.getPositionNames();
        elements.positionSelect.innerHTML = '<option value="">Custom (use X, Y)</option>';
        positions.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name.replace(/\b\w/g, c => c.toUpperCase());
            elements.positionSelect.appendChild(opt);
        });
    };
    
    const addDefaultObjects = () => {
        addObjectToScene('Red Box', '#ef4444', 'box', 300, 300);
        addObjectToScene('Blue Ball', '#3b82f6', 'circle', 500, 300);
        log('Default objects created', 'info');
    };
    
    const handleAddObject = () => {
        const color = elements.objColor.value;
        const type = elements.objType.value;
        const x = parseInt(elements.objX.value) || 400;
        const y = parseInt(elements.objY.value) || 300;
        
        objectCounter++;
        const colorName = getColorName(color);
        const typeName = type.charAt(0).toUpperCase() + type.slice(1);
        const name = `${colorName} ${typeName} ${objectCounter}`;
        
        addObjectToScene(name, color, type, x, y);
        log(`Added: ${name} at (${x}, ${y})`, 'success');
        
        // Reset position select
        elements.positionSelect.value = '';
    };
    
    const handleAddPlatform = () => {
        const label = elements.platformLabel.value || 'Platform';
        const color = elements.platformColor.value;
        const x = parseInt(elements.platformX.value) || 300;
        const y = parseInt(elements.platformY.value) || 200;
        const width = parseInt(elements.platformWidth.value) || 120;
        
        Scene.addPlatform({ x, y, width, height: 10, color, label });
        log(`Added platform: ${label} at (${x}, ${y})`, 'success');
    };
    
    const addObjectToScene = (name, color, type, x, y) => {
        Scene.addObject(name, { color, type, x, y });
        updateObjectList();
    };
    
    const updateObjectList = () => {
        const objects = Scene.getObjects();
        const names = Object.keys(objects);
        
        elements.objectCount.textContent = names.length;
        elements.objectList.innerHTML = '';
        
        names.forEach(name => {
            const obj = objects[name];
            const item = document.createElement('div');
            item.className = 'object-item';
            item.innerHTML = `
                <div class="object-item-info">
                    <span class="object-color-dot" style="background:${obj.color}"></span>
                    <span>${name}</span>
                    <span class="object-coords">(${Math.round(obj.x)}, ${Math.round(obj.y)})</span>
                </div>
                <button class="object-remove-btn" data-name="${name}">×</button>
            `;
            elements.objectList.appendChild(item);
        });
        
        // Add remove listeners
        document.querySelectorAll('.object-remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Scene.removeObject(btn.dataset.name);
                updateObjectList();
                log(`Removed: ${btn.dataset.name}`, 'info');
            });
        });
    };
    
    const getColorName = (hex) => {
        const colors = {
            '#ef4444': 'Red', '#f97316': 'Orange', '#eab308': 'Yellow',
            '#22c55e': 'Green', '#3b82f6': 'Blue', '#8b5cf6': 'Purple',
            '#ec4899': 'Pink', '#6b7280': 'Gray', '#000000': 'Black'
        };
        return colors[hex] || 'Custom';
    };
    
    const resetScene = () => {
        Scene.clearObjects();
        Scene.clearPlatforms();
        objectCounter = 0;
        addDefaultObjects();
        updateObjectList();
        log('Scene reset to defaults', 'info');
    };
    
    const clearObjects = () => {
        Scene.clearObjects();
        objectCounter = 0;
        updateObjectList();
        log('All objects cleared', 'info');
    };
    
    const handleSendInstruction = async () => {
        const instruction = elements.instructionInput.value.trim();
        if (!instruction || isProcessing) return;
        
        isProcessing = true;
        setLoading(true);
        log(`Sending: "${instruction}"`, 'info');
        
        try {
            // Call API
            const response = await fetch(`${API_URL}/infer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instruction })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            log('Response received', 'success');
            
            // Display JSON
            displayOutput(data);
            
            // Execute actions
            await executeActions(data);
            
        } catch (error) {
            log(`Error: ${error.message}`, 'error');
            elements.outputJson.textContent = `Error: ${error.message}`;
        } finally {
            isProcessing = false;
            setLoading(false);
            updateObjectList(); // Update coords after animation
        }
    };
    
    const displayOutput = (data) => {
        try {
            // Show actual current positions (not model's predictions)
            const enriched = enrichWithActualPositions(data);
            elements.outputJson.textContent = JSON.stringify(enriched, null, 2);
        } catch {
            elements.outputJson.textContent = String(data);
        }
    };
    
    const enrichWithActualPositions = (data) => {
        const addActualPos = (action) => {
            // Show the named position from last move, not coordinates
            if (action.object) {
                const obj = Scene.getObject(action.object);
                if (obj) {
                    // Use the remembered named position
                    action.initial_position = obj.lastPosition || 'origin';
                } else {
                    // Object doesn't exist yet - keep model's prediction or use 'origin'
                    action.initial_position = action.initial_position || 'origin';
                }
            }
            return action;
        };
        
        if (data.sequence && Array.isArray(data.sequence)) {
            return {
                ...data,
                sequence: data.sequence.map(addActualPos)
            };
        } else if (data.object && data.action) {
            return addActualPos({ ...data });
        } else if (Array.isArray(data)) {
            return data.map(addActualPos);
        }
        return data;
    };
    
    const executeActions = async (data) => {
        let actions = [];
        
        // Handle different response formats
        if (data.sequence && Array.isArray(data.sequence)) {
            actions = data.sequence;
        } else if (data.object && data.action) {
            actions = [data];
        } else if (Array.isArray(data)) {
            actions = data;
        }
        
        if (actions.length === 0) {
            log('No executable actions found', 'error');
            return;
        }
        
        log(`Executing ${actions.length} action(s)...`, 'action');
        showActionOverlay(true);
        
        for (let i = 0; i < actions.length; i++) {
            const action = normalizeAction(actions[i]);
            
            // Capture actual named position BEFORE executing
            const obj = Scene.getObject(action.object);
            if (obj) {
                action.initial_position = obj.lastPosition || 'origin';
            } else {
                action.initial_position = action.initial_position || 'origin';
            }
            
            // Update display with actual initial position
            if (data.sequence) {
                data.sequence[i] = action;
            } else {
                Object.assign(data, action);
            }
            displayOutput(data);
            
            log(`[${i + 1}/${actions.length}] ${action.action} ${action.object} → ${action.target_position}`, 'action');
            
            const success = await Scene.executeAction(action);
            
            // After successful execution, update object's lastPosition
            if (success) {
                const updatedObj = Scene.getObject(action.object);
                if (updatedObj && action.target_position) {
                    Scene.updateLastPosition(action.object, action.target_position);
                }
            }
            
            if (!success) {
                log(`Action failed: object "${action.object}" not found`, 'error');
            }
            
            // Small delay between actions
            if (i < actions.length - 1) {
                await delay(200);
            }
        }
        
        showActionOverlay(false);
        log('Execution complete', 'success');
    };
    
    const normalizeAction = (action) => {
        // Normalize keys and values
        return {
            object: String(action.object || '').replace(/_/g, ' '),
            action: String(action.action || 'move').replace(/_/g, ' '),
            target_position: String(action.target_position || action.targetPosition || 'center').replace(/_/g, ' ')
        };
    };
    
    const setLoading = (loading) => {
        elements.sendBtn.disabled = loading;
        elements.sendText.classList.toggle('hidden', loading);
        elements.sendLoader.classList.toggle('hidden', !loading);
    };
    
    const showActionOverlay = (show) => {
        elements.actionOverlay.classList.toggle('hidden', !show);
    };
    
    const log = (message, type = 'info') => {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        entry.textContent = `[${time}] ${message}`;
        elements.logContainer.appendChild(entry);
        elements.logContainer.scrollTop = elements.logContainer.scrollHeight;
    };
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    const checkAPIStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/health`);
            if (response.ok) {
                elements.apiStatus.textContent = 'Connected';
                elements.statusDot.className = 'status-dot connected';
                log('API connection established', 'success');
            } else {
                throw new Error('Not OK');
            }
        } catch {
            elements.apiStatus.textContent = 'Disconnected';
            elements.statusDot.className = 'status-dot error';
            log('API not available - start backend server', 'error');
        }
    };
    
    // Expose init
    return { init };
})();

// Start app when DOM ready
document.addEventListener('DOMContentLoaded', App.init);
