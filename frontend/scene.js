// Scene.js - 2D Graph Canvas with Coordinate System
const Scene = (() => {
    let canvas, ctx;
    let objects = {};
    let animations = [];
    let animationFrame = null;
    let hoveredCoords = null;
    
    // Canvas settings
    const GRID_SPACING = 50;
    const AXIS_COLOR = '#475569';
    const GRID_COLOR = '#1e293b';
    const LABEL_COLOR = '#64748b';
    
    // Platform/shelf storage
    let platforms = [];
    let customPositions = {}; // Store custom platform positions
    
    // Named positions (relative to canvas center for flexibility)
    const getNamedPositions = () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const positions = {
            // Center
            'center': { x: cx, y: cy },
            
            // Cardinal directions
            'left': { x: cx - 200, y: cy },
            'right': { x: cx + 200, y: cy },
            'top': { x: cx, y: cy - 150 },
            'bottom': { x: cx, y: cy + 150 },
            
            // Corners
            'top left': { x: cx - 200, y: cy - 150 },
            'top right': { x: cx + 200, y: cy - 150 },
            'bottom left': { x: cx - 200, y: cy + 150 },
            'bottom right': { x: cx + 200, y: cy + 150 },
            
            // Platforms
            'red platform': { x: cx - 180, y: cy + 100 },
            'blue platform': { x: cx + 180, y: cy + 100 },
            'green platform': { x: cx, y: cy + 100 },
            'platform a': { x: cx - 180, y: cy + 100 },
            'platform b': { x: cx + 180, y: cy + 100 },
            'platform c': { x: cx, y: cy + 100 },
            'left platform': { x: cx - 180, y: cy + 100 },
            'right platform': { x: cx + 180, y: cy + 100 },
            'middle platform': { x: cx, y: cy + 100 },
            
            // Shelves
            'top shelf': { x: cx, y: cy - 120 },
            'bottom shelf': { x: cx, y: cy + 120 },
            'left shelf': { x: cx - 180, y: cy },
            'right shelf': { x: cx + 180, y: cy },
            
            // Table/Floor
            'table': { x: cx, y: cy + 80 },
            'floor': { x: cx, y: cy + 150 },
            'ground': { x: cx, y: cy + 150 },
            
            // Corners explicit
            'corner': { x: cx + 200, y: cy + 150 },
        };
        
        // Merge with custom platform positions
        return { ...positions, ...customPositions };
    };
    
    // Initialize canvas
    const init = (canvasId) => {
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        
        // Set canvas size
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Track mouse for coordinate display
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', () => {
            hoveredCoords = null;
            updateCoordDisplay();
        });
        
        startRenderLoop();
        return true;
    };
    
    const resizeCanvas = () => {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width || 800;
        canvas.height = rect.height || 450;
        
        // Reinitialize default platforms after resize
        initDefaultPlatforms();
    };
    
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        hoveredCoords = { x, y };
        updateCoordDisplay();
    };
    
    const updateCoordDisplay = () => {
        const display = document.getElementById('coord-display');
        if (display) {
            if (hoveredCoords) {
                display.textContent = `Cursor: (${hoveredCoords.x}, ${hoveredCoords.y})`;
            } else {
                display.textContent = 'Hover over canvas for coordinates';
            }
        }
    };
    
    // Initialize default platforms and shelves
    const initDefaultPlatforms = () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        platforms = [
            // Floor
            { x: 0, y: cy + 150, width: canvas.width, height: 8, color: '#334155', label: 'Floor' },
            
            // Three platforms
            { x: cx - 200, y: cy + 100, width: 100, height: 12, color: '#dc2626', label: 'Red Platform' },
            { x: cx + 100, y: cy + 100, width: 100, height: 12, color: '#2563eb', label: 'Blue Platform' },
            { x: cx - 50, y: cy + 100, width: 100, height: 12, color: '#16a34a', label: 'Green Platform' },
            
            // Shelves
            { x: cx - 100, y: cy - 120, width: 200, height: 10, color: '#78716c', label: 'Top Shelf' },
            { x: cx - 100, y: cy + 120, width: 200, height: 10, color: '#78716c', label: 'Bottom Shelf' },
            { x: cx - 200, y: cy, width: 80, height: 10, color: '#78716c', label: 'Left Shelf' },
            { x: cx + 120, y: cy, width: 80, height: 10, color: '#78716c', label: 'Right Shelf' },
        ];
        
        // Register all default platforms as named positions
        customPositions = {};
        for (const platform of platforms) {
            const normalizedLabel = platform.label.toLowerCase().trim();
            customPositions[normalizedLabel] = {
                x: platform.x + platform.width / 2,
                y: platform.y  // Top surface
            };
        }
    };
    
    // Draw platforms and shelves
    const drawPlatforms = () => {
        for (const platform of platforms) {
            // Shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 3;
            
            // Platform
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Highlight
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height / 2);
            
            // Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(platform.label, platform.x + platform.width / 2, platform.y - 6);
        }
    };
    
    // Draw coordinate grid
    const drawGrid = () => {
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += GRID_SPACING) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += GRID_SPACING) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = AXIS_COLOR;
        ctx.lineWidth = 2;
        
        // X-axis at top
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, 0);
        ctx.stroke();
        
        // Y-axis at left
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas.height);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = LABEL_COLOR;
        ctx.font = '10px Consolas, monospace';
        ctx.textAlign = 'center';
        
        // X labels (every 100px for clarity)
        for (let x = 0; x <= canvas.width; x += 100) {
            ctx.fillText(x.toString(), x, 12);
        }
        
        // Y labels
        ctx.textAlign = 'left';
        for (let y = 100; y <= canvas.height; y += 100) {
            ctx.fillText(y.toString(), 4, y + 4);
        }
    };
    
    // Parse target position - supports both named positions and coordinates
    const resolvePosition = (target) => {
        if (!target) return null;
        
        const str = String(target).toLowerCase().trim();
        
        // Try coordinate format: "(x, y)" or "x, y" or "x:123 y:456"
        const coordMatch = str.match(/\(?\s*(\d+)\s*,\s*(\d+)\s*\)?/) ||
                          str.match(/x\s*:\s*(\d+)\s*y\s*:\s*(\d+)/i) ||
                          str.match(/^(\d+)\s+(\d+)$/);
        
        if (coordMatch) {
            return {
                x: parseInt(coordMatch[1]),
                y: parseInt(coordMatch[2])
            };
        }
        
        // Try named position
        const positions = getNamedPositions();
        
        // Direct match
        if (positions[str]) {
            return { ...positions[str] };
        }
        
        // Normalize and match
        const normalized = str.replace(/_/g, ' ').replace(/-/g, ' ').trim();
        if (positions[normalized]) {
            return { ...positions[normalized] };
        }
        
        // Partial match
        for (const [key, pos] of Object.entries(positions)) {
            if (str.includes(key) || key.includes(str)) {
                return { ...pos };
            }
        }
        
        // Return center as fallback
        return { x: canvas.width / 2, y: canvas.height / 2 };
    };
    
    // Parse color from object name (e.g., "red box" -> red)
    const parseColor = (objectName) => {
        const colorMap = {
            'red': '#ef4444',
            'blue': '#3b82f6',
            'green': '#10b981',
            'yellow': '#eab308',
            'purple': '#a855f7',
            'orange': '#f97316',
            'pink': '#ec4899',
            'cyan': '#06b6d4',
            'gray': '#6b7280',
            'black': '#1f2937',
            'white': '#f3f4f6'
        };
        
        const nameLower = String(objectName).toLowerCase();
        for (const [colorName, hex] of Object.entries(colorMap)) {
            if (nameLower.includes(colorName)) {
                return hex;
            }
        }
        return null;
    };
    
    // Parse shape from object name (e.g., "red box" -> box, "blue circle" -> circle)
    const parseShape = (objectName) => {
        const nameLower = String(objectName).toLowerCase();
        if (nameLower.includes('circle') || nameLower.includes('ball') || nameLower.includes('sphere')) {
            return 'circle';
        }
        if (nameLower.includes('box') || nameLower.includes('cube') || nameLower.includes('square')) {
            return 'box';
        }
        return 'box'; // default
    };
    
    // Add object to scene
    const addObject = (name, config) => {
        const position = resolvePosition(config.position) || { 
            x: config.x || canvas.width / 2, 
            y: config.y || canvas.height / 2 
        };
        
        objects[name] = {
            name,
            type: config.type || 'box',
            color: config.color || '#3b82f6',
            x: position.x,
            y: position.y,
            width: config.width || 50,
            height: config.height || 50,
            rotation: 0,
            scale: 1,
            opacity: 1,
            lastPosition: config.position || 'origin'  // Track named position
        };
        
        return objects[name];
    };
    
    // Remove object
    const removeObject = (name) => {
        const key = findObjectKey(name);
        if (key) {
            delete objects[key];
            return true;
        }
        return false;
    };
    
    // Find object by name (case-insensitive, normalized)
    const findObjectKey = (name) => {
        if (!name) return null;
        const normalized = String(name).toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
        
        for (const key of Object.keys(objects)) {
            const keyNorm = key.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ').trim();
            if (keyNorm === normalized || keyNorm.includes(normalized) || normalized.includes(keyNorm)) {
                return key;
            }
        }
        return null;
    };
    
    const getObject = (name) => {
        const key = findObjectKey(name);
        return key ? objects[key] : null;
    };
    
    // Update object's last position (named position, not coordinates)
    const updateLastPosition = (name, position) => {
        const key = findObjectKey(name);
        if (key && objects[key]) {
            objects[key].lastPosition = position;
        }
    };
    
    // Get all objects
    const getObjects = () => ({ ...objects });
    
    // Clear all objects
    const clearObjects = () => {
        objects = {};
        animations = [];
    };
    
    // Execute action
    const executeAction = (action) => {
        return new Promise((resolve) => {
            let obj = getObject(action.object);
            let actualInitialPosition = null;
            
            // If object exists, capture its current position before any changes
            if (obj) {
                actualInitialPosition = {
                    x: obj.x,
                    y: obj.y,
                    formatted: `(${Math.round(obj.x)}, ${Math.round(obj.y)})`
                };
            }
            
            // If object doesn't exist, create it using model's initial_position
            if (!obj) {
                console.log(`Creating new object: ${action.object}`);
                const initialPos = action.initial_position ? 
                    resolvePosition(action.initial_position) : 
                    { x: canvas.width / 2, y: canvas.height / 2 };
                
                // Parse color and shape from object name
                const color = parseColor(action.object) || '#3b82f6';
                const shape = parseShape(action.object) || 'box';
                
                obj = addObject(action.object, {
                    position: action.initial_position || 'center',
                    color: color,
                    type: shape,
                    x: initialPos.x,
                    y: initialPos.y
                });
                
                // Update actualInitialPosition for newly created object
                actualInitialPosition = {
                    x: obj.x,
                    y: obj.y,
                    formatted: `(${Math.round(obj.x)}, ${Math.round(obj.y)})`
                };
            }
            
            // Store the actual initial position in the action for reference
            action.actualInitialPosition = actualInitialPosition;
            
            const actionType = String(action.action || '').toLowerCase();
            const duration = 800;
            
            switch (actionType) {
                case 'move':
                case 'slide':
                case 'push':
                case 'pull':
                case 'drag':
                    const target = resolvePosition(action.target_position);
                    if (target) {
                        animate(obj, { x: target.x, y: target.y }, duration, resolve);
                    } else {
                        resolve(false);
                    }
                    break;
                    
                case 'jump':
                case 'hop':
                    const jumpTarget = resolvePosition(action.target_position);
                    animateJump(obj, jumpTarget, duration, resolve);
                    break;
                    
                case 'rotate':
                case 'spin':
                case 'turn':
                    const degrees = parseFloat(action.target_position) || 360;
                    animate(obj, { rotation: obj.rotation + degrees }, duration, resolve);
                    break;
                    
                case 'grow':
                case 'expand':
                    animate(obj, { scale: obj.scale * 1.5 }, duration, resolve);
                    break;
                    
                case 'shrink':
                case 'contract':
                    animate(obj, { scale: obj.scale * 0.6 }, duration, resolve);
                    break;
                    
                case 'fade':
                case 'fadeout':
                case 'disappear':
                    animate(obj, { opacity: 0 }, duration, resolve);
                    break;
                    
                case 'fadein':
                case 'appear':
                    animate(obj, { opacity: 1 }, duration, resolve);
                    break;
                    
                case 'bounce':
                    animateBounce(obj, duration, resolve);
                    break;
                    
                default:
                    // Try to move if target_position exists
                    if (action.target_position) {
                        const defaultTarget = resolvePosition(action.target_position);
                        if (defaultTarget) {
                            animate(obj, { x: defaultTarget.x, y: defaultTarget.y }, duration, resolve);
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
            }
        });
    };
    
    // Animation with easing
    const animate = (obj, targetProps, duration, onComplete) => {
        const startProps = {};
        for (const key of Object.keys(targetProps)) {
            startProps[key] = obj[key];
        }
        
        const startTime = performance.now();
        
        const animation = {
            obj,
            startProps,
            targetProps,
            startTime,
            duration,
            onComplete
        };
        
        animations.push(animation);
    };
    
    const animateJump = (obj, target, duration, onComplete) => {
        const startX = obj.x;
        const startY = obj.y;
        const endX = target ? target.x : obj.x;
        const endY = target ? target.y : obj.y;
        const peakY = Math.min(startY, endY) - 100;
        
        const startTime = performance.now();
        
        const jumpAnim = {
            obj,
            startTime,
            duration,
            update: (progress) => {
                obj.x = startX + (endX - startX) * progress;
                // Parabolic arc
                const arc = -4 * progress * (progress - 1);
                const baseY = startY + (endY - startY) * progress;
                obj.y = baseY - arc * (startY - peakY);
            },
            onComplete
        };
        
        animations.push(jumpAnim);
    };
    
    const animateBounce = (obj, duration, onComplete) => {
        const startY = obj.y;
        const bounceHeight = 50;
        const startTime = performance.now();
        
        const bounceAnim = {
            obj,
            startTime,
            duration,
            update: (progress) => {
                const bounces = 3;
                const decay = Math.pow(0.5, progress * bounces);
                const wave = Math.abs(Math.sin(progress * Math.PI * bounces));
                obj.y = startY - wave * bounceHeight * decay;
            },
            onComplete
        };
        
        animations.push(bounceAnim);
    };
    
    // Easing function
    const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Update animations
    const updateAnimations = () => {
        const now = performance.now();
        
        for (let i = animations.length - 1; i >= 0; i--) {
            const anim = animations[i];
            const elapsed = now - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            const eased = easeInOutCubic(progress);
            
            if (anim.update) {
                // Custom update function
                anim.update(eased);
            } else {
                // Standard property animation
                for (const [key, targetVal] of Object.entries(anim.targetProps)) {
                    const startVal = anim.startProps[key];
                    anim.obj[key] = startVal + (targetVal - startVal) * eased;
                }
            }
            
            if (progress >= 1) {
                animations.splice(i, 1);
                if (anim.onComplete) anim.onComplete(true);
            }
        }
    };
    
    // Draw object
    const drawObject = (obj) => {
        ctx.save();
        ctx.globalAlpha = obj.opacity;
        ctx.translate(obj.x, obj.y);
        ctx.rotate((obj.rotation * Math.PI) / 180);
        ctx.scale(obj.scale, obj.scale);
        
        const w = obj.width;
        const h = obj.height;
        
        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        ctx.fillStyle = obj.color;
        
        switch (obj.type) {
            case 'circle':
            case 'ball':
            case 'sphere':
                ctx.beginPath();
                ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
                ctx.fill();
                // Highlight
                ctx.shadowColor = 'transparent';
                ctx.beginPath();
                ctx.arc(-w / 6, -h / 6, w / 6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fill();
                break;
                
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -h / 2);
                ctx.lineTo(-w / 2, h / 2);
                ctx.lineTo(w / 2, h / 2);
                ctx.closePath();
                ctx.fill();
                break;
                
            default: // box/cube/square
                ctx.fillRect(-w / 2, -h / 2, w, h);
                // Highlight
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(-w / 2, -h / 2, w, h / 3);
        }
        
        ctx.restore();
        
        // Draw label with coordinates
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.name, obj.x, obj.y + obj.height / 2 + 16);
        ctx.font = '9px Consolas, monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`(${Math.round(obj.x)}, ${Math.round(obj.y)})`, obj.x, obj.y + obj.height / 2 + 28);
    };
    
    // Render loop
    const render = () => {
        if (!ctx) return;
        
        // Clear
        ctx.fillStyle = '#0a0f1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        // Draw platforms and shelves (behind objects)
        drawPlatforms();
        
        // Update animations
        updateAnimations();
        
        // Draw objects
        for (const obj of Object.values(objects)) {
            drawObject(obj);
        }
    };
    
    const startRenderLoop = () => {
        const loop = () => {
            render();
            animationFrame = requestAnimationFrame(loop);
        };
        loop();
    };
    
    // Get list of named positions for UI
    const getPositionNames = () => {
        return Object.keys(getNamedPositions()).sort();
    };
    
    // Public API
    return {
        init,
        addObject,
        removeObject,
        getObject,
        getObjects,
        clearObjects,
        executeAction,
        resolvePosition,
        getPositionNames,
        updateLastPosition,  // Add new method
        isAnimating: () => animations.length > 0,
        addPlatform: (config) => {
            const platform = {
                x: config.x || 0,
                y: config.y || 0,
                width: config.width || 100,
                height: config.height || 10,
                color: config.color || '#78716c',
                label: config.label || 'Platform'
            };
            platforms.push(platform);
            
            // Register as named position (center of platform)
            const normalizedLabel = platform.label.toLowerCase().trim();
            customPositions[normalizedLabel] = {
                x: platform.x + platform.width / 2,
                y: platform.y  // Top surface of platform
            };
        },
        getPlatforms: () => [...platforms],
        clearPlatforms: () => { 
            platforms = []; 
            customPositions = {}; 
            initDefaultPlatforms(); 
        }
    };
})();
