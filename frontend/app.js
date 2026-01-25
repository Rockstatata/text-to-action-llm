/**
 * Text-to-Action LLM - Main Application Logic
 * Handles API communication and UI interactions
 */

// Configuration
const CONFIG = {
    apiUrl: 'http://localhost:8000',
    endpoints: {
        infer: '/api/infer',
        health: '/health'
    }
};

// State
let isLoading = false;
let lastActionPlan = null;

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeScene();
    checkApiHealth();
    setupEventListeners();
});

/**
 * Set up event listeners
 */
function setupEventListeners() {
    const input = document.getElementById('instruction');
    
    // Submit on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isLoading) {
            submitInstruction();
        }
    });
    
    // Check API health periodically
    setInterval(checkApiHealth, 30000);
}

/**
 * Submit instruction to API
 */
async function submitInstruction() {
    const input = document.getElementById('instruction');
    const instruction = input.value.trim();
    
    if (!instruction) {
        showError('Please enter an instruction');
        return;
    }
    
    if (isLoading) return;
    
    setLoading(true);
    const startTime = performance.now();
    
    try {
        const response = await fetch(`${CONFIG.apiUrl}${CONFIG.endpoints.infer}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ instruction })
        });
        
        const latency = Math.round(performance.now() - startTime);
        updateLatency(latency);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'API request failed');
        }
        
        const actionPlan = await response.json();
        lastActionPlan = actionPlan;
        
        // Display result
        displayActionPlan(actionPlan);
        
        // Animate scene
        animateAction(actionPlan);
        
    } catch (error) {
        console.error('Inference error:', error);
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

/**
 * Display action plan in output section
 */
function displayActionPlan(actionPlan) {
    const output = document.getElementById('output-json');
    output.textContent = JSON.stringify(actionPlan, null, 2);
    
    // Syntax highlighting (simple)
    output.innerHTML = output.textContent
        .replace(/"([^"]+)":/g, '<span style="color: #7dd3fc">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span style="color: #86efac">"$1"</span>');
}

/**
 * Set example instruction
 */
function setExample(text) {
    document.getElementById('instruction').value = text;
    document.getElementById('instruction').focus();
}

/**
 * Copy output to clipboard
 */
async function copyOutput() {
    if (!lastActionPlan) return;
    
    try {
        await navigator.clipboard.writeText(JSON.stringify(lastActionPlan, null, 2));
        
        const btn = document.getElementById('copy-btn');
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = '📋', 1500);
    } catch (err) {
        console.error('Copy failed:', err);
    }
}

/**
 * Check API health status
 */
async function checkApiHealth() {
    const statusDot = document.getElementById('api-status');
    const statusText = document.getElementById('api-status-text');
    
    try {
        const response = await fetch(`${CONFIG.apiUrl}${CONFIG.endpoints.health}`);
        const data = await response.json();
        
        if (response.ok && data.status === 'healthy') {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'API Connected';
        } else {
            statusDot.className = 'status-dot error';
            statusText.textContent = 'API Unhealthy';
        }
    } catch (error) {
        statusDot.className = 'status-dot error';
        statusText.textContent = 'API Offline';
    }
}

/**
 * Update latency display
 */
function updateLatency(ms) {
    document.getElementById('latency').textContent = `${ms}ms`;
}

/**
 * Set loading state
 */
function setLoading(loading) {
    isLoading = loading;
    
    const btn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    
    btn.disabled = loading;
    btnText.textContent = loading ? 'Generating...' : 'Generate Action';
    btnLoader.classList.toggle('hidden', !loading);
}

/**
 * Show error message
 */
function showError(message) {
    const output = document.getElementById('output-json');
    output.innerHTML = `<span style="color: #f87171">Error: ${message}</span>`;
}

/**
 * Animate action in scene
 */
function animateAction(actionPlan) {
    // Show overlay with action
    const overlay = document.getElementById('scene-overlay');
    const indicator = document.getElementById('action-indicator');
    
    indicator.textContent = `${actionPlan.action.toUpperCase()}: ${actionPlan.object}`;
    overlay.classList.remove('hidden');
    
    // Trigger scene animation
    if (typeof executeSceneAction === 'function') {
        executeSceneAction(actionPlan);
    }
    
    // Hide overlay after animation
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 2000);
}
