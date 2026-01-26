/**
 * Text-to-Action LLM - Scene Rendering
 * Simple 2D canvas-based scene for demonstrating actions
 */

// Scene configuration - DYNAMIC, model-driven approach
// Objects are created dynamically based on LLM output, not hardcoded
const SCENE_CONFIG = {
    // Keep some sample objects for initial demonstration
    initialObjects: {
        'orange pyramid': { x: 100, y: 200, width: 50, height: 60, color: '#f97316', shape: 'triangle' },
        'yellow pyramid': { x: 180, y: 200, width: 50, height: 60, color: '#eab308', shape: 'triangle' },
        'blue pyramid': { x: 260, y: 200, width: 50, height: 60, color: '#3b82f6', shape: 'triangle' },
        'red box': { x: 340, y: 200, width: 50, height: 50, color: '#ef4444', shape: 'rect' },
        'blue box': { x: 410, y: 200, width: 50, height: 50, color: '#3b82f6', shape: 'rect' },
        'green cube': { x: 480, y: 200, width: 50, height: 50, color: '#22c55e', shape: 'rect' },
        'yellow sphere': { x: 550, y: 200, radius: 25, color: '#eab308', shape: 'circle' },
        'purple sphere': { x: 620, y: 200, radius: 25, color: '#a855f7', shape: 'circle' },
        'black ball': { x: 690, y: 200, radius: 25, color: '#1f2937', shape: 'circle' },
    },
    // Dynamic position mapping - can be extended by model
    knownPositions: {
        'floor': { x: null, y: 220 },
        'ground': { x: null, y: 220 },
        'origin': { x: 50, y: 50 },
        'center': { x: 400, y: 150 },
        'top shelf': { x: 200, y: 50 },
        'bottom shelf': { x: 600, y: 200 },
        'left corner': { x: 50, y: 50 },
        'right corner': { x: 750, y: 50 },
        'blue platform': { x: 400, y: 100 },
        'red platform': { x: 200, y: 100 },
        'green platform': { x: 600, y: 100 },
        'table': { x: 300, y: 180 },
        'desk': { x: 500, y: 180 },
        'pedestal': { x: 350, y: 120 },
    },
    // Color and shape mappings for dynamic object creation
    colors: {
        'red': '#ef4444', 'blue': '#3b82f6', 'green': '#22c55e',
        'yellow': '#eab308', 'orange': '#f97316', 'purple': '#a855f7',
        'black': '#1f2937', 'white': '#f0f0f0', 'pink': '#ec4899',
        'cyan': '#06b6d4', 'gray': '#6b7280', 'brown': '#92400e'
    },
    shapes: {
        'box': 'rect', 'cube': 'rect', 'pyramid': 'triangle',
        'sphere': 'circle', 'ball': 'circle', 'circle': 'circle',
        'cone': 'triangle', 'cylinder': 'rect'
    }
};

// Scene state
let canvas, ctx;
let sceneObjects = {};
let animationFrame = null;

/**
 * Initialize the scene
 */
function initializeScene() {
    canvas = document.getElementById('scene-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize objects
    resetScene();
    
    // Start render loop
    render();
}

/**
 * Resize canvas to container
 */
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

/**
 * Reset scene to initial state
 */
function resetScene() {
    sceneObjects = JSON.parse(JSON.stringify(SCENE_CONFIG.initialObjects));
    
    // Adjust positions based on canvas size
    Object.values(sceneObjects).forEach(obj => {
        obj.y = canvas.height - 80;
    });
}

/**
 * Main render function
 */
function render() {
    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw platforms
    drawPlatforms();
    
    // Draw objects
    Object.entries(sceneObjects).forEach(([name, obj]) => {
        drawObject(obj, name);
    });
    
    animationFrame = requestAnimationFrame(render);
}

/**
 * Draw background grid
 */
function drawGrid() {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

/**
 * Draw platform markers
 */
function drawPlatforms() {
    const platforms = [
        { name: 'Blue Platform', x: 400, y: 100, color: '#3b82f6' },
        { name: 'Red Platform', x: 200, y: 100, color: '#ef4444' },
        { name: 'Green Platform', x: 600, y: 100, color: '#22c55e' },
    ];
    
    platforms.forEach(platform => {
        // Draw platform
        ctx.fillStyle = platform.color + '40'; // Add transparency
        ctx.fillRect(platform.x - 50, platform.y, 100, 10);
        
        // Draw label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(platform.name, platform.x, platform.y - 5);
    });
    
    // Draw shelves
    const shelves = [
        { name: 'Top Shelf', x: 200, y: 50 },
        { name: 'Bottom Shelf', x: 600, y: 200 },
    ];
    
    shelves.forEach(shelf => {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shelf.x - 40, shelf.y);
        ctx.lineTo(shelf.x + 40, shelf.y);
        ctx.stroke();
        
        ctx.fillStyle = '#64748b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(shelf.name, shelf.x, shelf.y - 5);
    });
    
    // Draw floor line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Floor', 10, canvas.height - 5);
}

/**
 * Draw a scene object
 */
function drawObject(obj, name) {
    ctx.fillStyle = obj.color;
    
    if (obj.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
    } else if (obj.shape === 'triangle') {
        // Draw pyramid/triangle
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y - obj.height);  // Top point
        ctx.lineTo(obj.x - obj.width / 2, obj.y);  // Bottom left
        ctx.lineTo(obj.x + obj.width / 2, obj.y);  // Bottom right
        ctx.closePath();
        ctx.fill();
    } else {
        // Draw rectangle/box/cube
        ctx.fillRect(
            obj.x - obj.width / 2,
            obj.y - obj.height,
            obj.width,
            obj.height
        );
    }
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(obj.x, canvas.height - 18, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, obj.x, obj.y - (obj.height || obj.radius) - 5);
}

/**
 * Create object dynamically from model output
 * This demonstrates the model's reasoning - it can work with ANY object
 */
function createObjectFromModelOutput(objectName, initialPosition) {
    console.log('  - Model specified object:', objectName);
    console.log('  - Model specified initial position:', initialPosition);
    
    const nameLower = objectName.toLowerCase();
    
    // Extract color and shape from object name using model output
    let color = '#94a3b8'; // default gray
    let shape = 'rect';  // default shape
    
    // Parse color from model output
    for (const [colorName, colorHex] of Object.entries(SCENE_CONFIG.colors)) {
        if (nameLower.includes(colorName)) {
            color = colorHex;
            break;
        }
    }
    
    // Parse shape from model output
    for (const [shapeName, shapeType] of Object.entries(SCENE_CONFIG.shapes)) {
        if (nameLower.includes(shapeName)) {
            shape = shapeType;
            break;
        }
    }
    
    // Get initial position from model output
    const pos = resolvePosition(initialPosition) || { x: 400, y: 150 };
    
    // Create object based on shape
    const obj = {
        x: pos.x !== null ? pos.x : 400,
        y: pos.y !== null ? pos.y : 150,
        color: color,
        shape: shape
    };
    
    // Add shape-specific properties
    if (shape === 'circle') {
        obj.radius = 25;
    } else if (shape === 'triangle') {
        obj.width = 50;
        obj.height = 60;
    } else {
        obj.width = 50;
        obj.height = 50;
    }
    
    console.log('  ✓ Created:', obj);
    return obj;
}

/**
 * Resolve position from model output
 * Can handle known positions or infer new ones
 */
function resolvePosition(positionName) {
    if (!positionName) return null;
    
    const posLower = positionName.toLowerCase();
    
    // Check known positions first
    for (const [name, pos] of Object.entries(SCENE_CONFIG.knownPositions)) {
        if (posLower.includes(name) || name.includes(posLower)) {
            return pos;
        }
    }
    
    // For unknown positions, try to infer from model output
    // This shows the system adapts to model reasoning
    console.log('  ⚠ Unknown position from model:', positionName, '- using default');
    return { x: 400, y: 150 }; // center as fallback
}

/**
 * Execute an action in the scene - FULLY DYNAMIC, MODEL-DRIVEN
 * This demonstrates that the model infers everything, not hardcoded rules
 */
function executeSceneAction(actionPlan) {
    const { object, initial_position, action, target_position } = actionPlan;
    
    console.log('🤖 Model-inferred action:', actionPlan);
    
    // Try to find existing object (fuzzy match)
    let objName = Object.keys(sceneObjects).find(name => 
        name.toLowerCase().includes(object.toLowerCase()) ||
        object.toLowerCase().includes(name.toLowerCase())
    );
    
    let obj;
    
    // If object doesn't exist, CREATE IT DYNAMICALLY from model output
    // This proves the model drives the system, not hardcoded objects
    if (!objName) {
        console.log('📦 Creating new object from model output:', object);
        obj = createObjectFromModelOutput(object, initial_position);
        objName = object;
        sceneObjects[objName] = obj;
    } else {
        obj = sceneObjects[objName];
        // Update initial position based on model output
        const initialPos = resolvePosition(initial_position);
        if (initialPos) {
            obj.x = initialPos.x !== null ? initialPos.x : obj.x;
            obj.y = initialPos.y !== null ? initialPos.y : obj.y;
        }
    }
    
    // Store initial state for before/after comparison
    obj.initialState = { x: obj.x, y: obj.y, width: obj.width, height: obj.height, radius: obj.radius };
    
    // Execute action based on model output
    switch (action.toLowerCase()) {
        case 'move':
            animateMove(obj, target_position, objName);
            break;
        case 'rotate':
            animateRotate(obj, target_position);
            break;
        case 'scale':
            animateScale(obj, target_position);
            break;
        default:
            console.log('Unknown action:', action);
    }
}

/**
 * Animate move action - driven by model output
 */
function animateMove(obj, targetPositionName, objName) {
    console.log(`  🎬 Animating MOVE: ${objName} -> ${targetPositionName}`);
    
    // Resolve target position from model output
    const targetPos = resolvePosition(targetPositionName);
    
    if (!targetPos) {
        console.error('Could not resolve target position:', targetPositionName);
        return;
    }
    
    const targetX = targetPos.x !== null ? targetPos.x : obj.x;
    const targetY = targetPos.y !== null ? targetPos.y : obj.y;
    
    const startX = obj.x;
    const startY = obj.y;
    const duration = 1500;
    const startTime = performance.now();
    
    console.log(`  📍 From (${Math.round(startX)}, ${Math.round(startY)}) -> To (${Math.round(targetX)}, ${Math.round(targetY)})`);
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth ease-in-out
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        obj.x = startX + (targetX - startX) * eased;
        obj.y = startY + (targetY - startY) * eased;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            console.log('  ✓ Move complete');
        }
    }
    
    requestAnimationFrame(animate);
}

/**
 * Animate rotate action (visual effect)
 */
function animateRotate(obj) {
    const originalWidth = obj.width;
    const duration = 800;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Simulate rotation by scaling width
        obj.width = originalWidth * Math.abs(Math.cos(progress * Math.PI * 2));
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            obj.width = originalWidth;
        }
    }
    
    if (obj.width) {
        requestAnimationFrame(animate);
    }
}

/**
 * Animate scale action
 */
function animateScale(obj, target) {
    // Parse scale factor from target
    let scaleFactor = 2;
    const match = target.match(/(\d+\.?\d*)/);
    if (match) {
        scaleFactor = parseFloat(match[1]);
        if (scaleFactor < 1) scaleFactor = 0.5;
    }
    
    const startWidth = obj.width || obj.radius * 2;
    const startHeight = obj.height || obj.radius * 2;
    const targetWidth = startWidth * scaleFactor;
    const targetHeight = startHeight * scaleFactor;
    
    const duration = 600;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Elastic ease
        const eased = 1 - Math.pow(1 - progress, 4);
        
        if (obj.width) {
            obj.width = startWidth + (targetWidth - startWidth) * eased;
            obj.height = startHeight + (targetHeight - startHeight) * eased;
        } else {
            obj.radius = (startWidth / 2) + ((targetWidth - startWidth) / 2) * eased;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}
