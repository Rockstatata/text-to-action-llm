/**
 * Text-to-Action LLM - Scene Rendering
 * Simple 2D canvas-based scene for demonstrating actions
 */

// Scene configuration
const SCENE_CONFIG = {
    objects: {
        'red box': { x: 100, y: 200, width: 60, height: 60, color: '#ef4444', shape: 'rect' },
        'blue box': { x: 200, y: 200, width: 60, height: 60, color: '#3b82f6', shape: 'rect' },
        'green sphere': { x: 350, y: 200, radius: 30, color: '#22c55e', shape: 'circle' },
        'yellow cube': { x: 500, y: 200, width: 50, height: 50, color: '#eab308', shape: 'rect' },
        'purple cylinder': { x: 650, y: 200, width: 40, height: 70, color: '#a855f7', shape: 'rect' },
    },
    positions: {
        'floor': { x: null, y: 220 },
        'blue platform': { x: 400, y: 100 },
        'red platform': { x: 200, y: 100 },
        'left corner': { x: 50, y: 50 },
        'right corner': { x: 750, y: 50 },
        'center': { x: 400, y: 150 },
        'table': { x: 300, y: 180 },
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
    sceneObjects = JSON.parse(JSON.stringify(SCENE_CONFIG.objects));
    
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
    ];
    
    platforms.forEach(platform => {
        // Draw platform
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x - 50, platform.y, 100, 10);
        
        // Draw label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(platform.name, platform.x, platform.y - 10);
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
    } else {
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
 * Execute an action in the scene
 */
function executeSceneAction(actionPlan) {
    const { object, action, target_position } = actionPlan;
    
    // Find object (fuzzy match)
    const objName = Object.keys(sceneObjects).find(name => 
        name.toLowerCase().includes(object.toLowerCase()) ||
        object.toLowerCase().includes(name.toLowerCase())
    );
    
    if (!objName) {
        console.log('Object not found in scene:', object);
        return;
    }
    
    const obj = sceneObjects[objName];
    
    switch (action.toLowerCase()) {
        case 'move':
            animateMove(obj, target_position);
            break;
        case 'rotate':
            animateRotate(obj);
            break;
        case 'scale':
            animateScale(obj, target_position);
            break;
    }
}

/**
 * Animate move action
 */
function animateMove(obj, target) {
    // Get target position
    const targetPos = SCENE_CONFIG.positions[target.toLowerCase()] || 
                      SCENE_CONFIG.positions['center'];
    
    const targetX = targetPos.x || obj.x;
    const targetY = targetPos.y || obj.y;
    
    const startX = obj.x;
    const startY = obj.y;
    const duration = 1000;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        
        obj.x = startX + (targetX - startX) * eased;
        obj.y = startY + (targetY - startY) * eased;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
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
