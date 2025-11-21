// DOM Elements
const startButton = document.getElementById('startButton');
const firstText = document.getElementById('firstText');
const secondText = document.getElementById('secondText');
const trollText = document.getElementById('trollText');
const buttonsContainer = document.getElementById('buttonsContainer');
const greenBtn = document.getElementById('greenBtn');
const redBtn = document.getElementById('redBtn');
const emergencyLights = document.getElementById('emergencyLights');
const scratchCanvas = document.getElementById('scratchCanvas');
const revealContent = document.getElementById('revealContent');
const copyButton = document.getElementById('copyButton');

// Audio Elements
const bgMusic = document.getElementById('bgMusic');
const typingSound = document.getElementById('typingSound');
const sirenSound = document.getElementById('sirenSound');

// Game State
let greenAttempts = 0;
let typingInterval = null;

// ========== PHASE 1: Start Button ==========
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    bgMusic.volume = 0.5;
    bgMusic.play();
    
    // Start typewriter sequence
    typeText(
        "Do you want to know what's lies behind the darkness?",
        firstText,
        () => {
            typeText(
                "If yes then press red. If not then go for green.",
                secondText,
                () => {
                    // Show buttons after second text
                    buttonsContainer.style.opacity = '1';
                }
            );
        }
    );
});

// ========== PHASE 2: Typewriter Effect ==========
function typeText(text, element, callback) {
    element.style.opacity = '1';
    element.textContent = '';
    let index = 0;
    
    // Play typing sound
    typingSound.currentTime = 0;
    typingSound.loop = true;
    typingSound.volume = 0.3;
    typingSound.play();
    
    typingInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(typingInterval);
            typingSound.pause();
            typingSound.currentTime = 0;
            if (callback) callback();
        }
    }, 80);
}

// ========== PHASE 3: Green Button Troll ==========
function handleGreenButton(event) {
    event.preventDefault();
    greenAttempts++;
    
    // Get button dimensions
    const btnWidth = greenBtn.offsetWidth;
    const btnHeight = greenBtn.offsetHeight;
    
    // Calculate safe boundaries (keeping button fully visible)
    const minX = 20;
    const maxX = window.innerWidth - btnWidth - 20;
    const minY = 20;
    const maxY = window.innerHeight - btnHeight - 20;
    
    // Random position within safe boundaries
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomY = Math.random() * (maxY - minY) + minY;
    
    greenBtn.style.position = 'fixed';
    greenBtn.style.left = randomX + 'px';
    greenBtn.style.top = randomY + 'px';
    
    // Vibrate animation
    greenBtn.classList.add('vibrating');
    setTimeout(() => greenBtn.classList.remove('vibrating'), 500);
    
    // Red button glow
    redBtn.classList.add('glow');
    setTimeout(() => redBtn.classList.remove('glow'), 800);
    
    // Show troll note after exactly 6 attempts
    if (greenAttempts === 6) {
        typeText(
            "Maybe the button doesn't want to let you touch it. Try the other one.",
            trollText,
            null
        );
    }
}

greenBtn.addEventListener('mouseenter', handleGreenButton);
greenBtn.addEventListener('click', handleGreenButton);

// ========== PHASE 4: Red Button - Emergency ==========
redBtn.addEventListener('click', () => {
    // Fade out all text and buttons
    firstText.style.opacity = '0';
    secondText.style.opacity = '0';
    trollText.style.opacity = '0';
    buttonsContainer.style.opacity = '0';
    
    // Show emergency lights
    emergencyLights.classList.add('active');
    
    // Play siren for exactly 6 seconds
    sirenSound.volume = 0.6;
    sirenSound.play();
    
    setTimeout(() => {
        sirenSound.pause();
        sirenSound.currentTime = 0;
    }, 6000);
    
    // After 6 seconds, fade out lights and transition to scratch
    setTimeout(() => {
        emergencyLights.classList.remove('active');
        emergencyLights.style.opacity = '0';
        
        // Wait for lights to fade, then prepare scratch canvas
        setTimeout(() => {
            prepareScratchCanvas();
        }, 600);
    }, 6000);
});

// ========== PHASE 5: Scratch Canvas ==========
function prepareScratchCanvas() {
    const canvas = scratchCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Load and draw scratch cover image
    const coverImage = new Image();
    coverImage.onload = () => {
        // Scale image to cover full screen
        const scale = Math.max(
            canvas.width / coverImage.width,
            canvas.height / coverImage.height
        );
        
        const x = (canvas.width - coverImage.width * scale) / 2;
        const y = (canvas.height - coverImage.height * scale) / 2;
        
        ctx.drawImage(
            coverImage,
            x, y,
            coverImage.width * scale,
            coverImage.height * scale
        );
        
        // Set composite mode for erasing
        ctx.globalCompositeOperation = 'destination-out';
        
        // Now fade in the canvas VERY slowly
        canvas.style.display = 'block';
        canvas.style.opacity = '0';
        
        // Very slow fade in over 8 seconds
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            opacity += 0.00125; // Very small increment for slow fade
            canvas.style.opacity = opacity;
            
            if (opacity >= 1) {
                clearInterval(fadeInterval);
                // Enable scratch after fade completes
                enableScratch(canvas, ctx);
                // Show reveal content underneath
                revealContent.style.display = 'flex';
            }
        }, 10);
    };
    coverImage.src = 'scratchcover.jpeg';
}

function enableScratch(canvas, ctx) {
    let isScratching = false;
    
    canvas.addEventListener('mousedown', () => isScratching = true);
    canvas.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mouseleave', () => isScratching = false);
    
    canvas.addEventListener('mousemove', (e) => {
        if (isScratching) {
            scratch(ctx, e.clientX, e.clientY);
        }
    });
    
    canvas.addEventListener('touchstart', (e) => {
        isScratching = true;
        const touch = e.touches[0];
        scratch(ctx, touch.clientX, touch.clientY);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isScratching) {
            const touch = e.touches[0];
            scratch(ctx, touch.clientX, touch.clientY);
        }
    });
    
    canvas.addEventListener('touchend', () => isScratching = false);
}

function scratch(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();
}

// ========== PHASE 6: Copy Button ==========
copyButton.addEventListener('click', () => {
    const password = '20.11.2001';
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(password).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        }).catch(err => {
            console.error('Clipboard failed:', err);
            fallbackCopy(password);
        });
    } else {
        fallbackCopy(password);
    }
});

// Fallback copy method
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy';
        }, 2000);
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textarea);
      }
