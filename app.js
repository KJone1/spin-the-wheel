let entries = [
    { id: '1', text: 'YES', replicas: 3, color: '#ffcc00' },
    { id: '2', text: 'NO', replicas: 3, color: '#0055ff' }
];

let respin = {
    active: false,
    replicas: 1,
    text: 'RESPIN ↻',
    color: '#e63b2e'
};

let slices = [];

const SLICE_COLORS = ['#ffcc00', '#0055ff', '#ffffff', '#f5f0e8'];
let colorIndex = 2;

let audioCtx = null;

let currentAngle = 0;
let isSpinning = false;
let lastTickSliceIndex = -1;
let animationFrameId = null;

let spinDuration = 10;
let spinStartTime = 0;
let spinDurationMs = 10000;
let startAngle = 0;
let totalRotation = 0;
let isDefaultState = true;

const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const presetsBtn = document.getElementById('presets-btn');
const settingsBtn = document.getElementById('settings-btn');
const entriesList = document.getElementById('entries-list');
const totalSlicesBadge = document.getElementById('total-slices');
const entryForm = document.getElementById('entry-form');
const entryTextInp = document.getElementById('entry-text');
const entryReplicasInp = document.getElementById('entry-replicas');

const respinToggle = document.getElementById('respin-toggle');
const respinReplicasInp = document.getElementById('respin-replicas');
const respinReplicasContainer = document.getElementById('respin-replicas-container');

const tickerPin = document.getElementById('ticker-pin');

const presetsModal = document.getElementById('presets-modal');
const closePresetsBtn = document.getElementById('close-presets-btn');
const presetYesNoBtn = document.getElementById('preset-yes-no-btn');
const presetWhoPaysBtn = document.getElementById('preset-who-pays-btn');
const presetFoodBtn = document.getElementById('preset-food-btn');
const presetWoltBtn = document.getElementById('preset-wolt-btn');

const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsForm = document.getElementById('settings-form');
const spinDurationInp = document.getElementById('spin-duration');

const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const winnerSubMsg = document.getElementById('winner-sub-msg');
const winnerSpinAgain = document.getElementById('winner-spin-again');
const closeWinnerBtn = document.getElementById('close-winner-btn');

function updateSlices() {
    slices = [];
    
    let entrySlices = [];
    entries.forEach(entry => {
        let list = [];
        for (let i = 0; i < entry.replicas; i++) {
            list.push({
                text: entry.text,
                color: entry.color,
                isRespin: false
            });
        }
        if (list.length > 0) {
            entrySlices.push(list);
        }
    });

    if (respin.active) {
        let list = [];
        for (let i = 0; i < respin.replicas; i++) {
            list.push({
                text: respin.text,
                color: respin.color,
                isRespin: true
            });
        }
        if (list.length > 0) {
            entrySlices.push(list);
        }
    }

    let hasMore = true;
    while (hasMore) {
        hasMore = false;
        entrySlices.forEach(list => {
            if (list.length > 0) {
                slices.push(list.shift());
                hasMore = true;
            }
        });
    }

    totalSlicesBadge.textContent = `${slices.length} SLICES`;
    
    if (slices.length === 0) {
        spinBtn.disabled = true;
    } else {
        spinBtn.disabled = false;
    }

    drawWheel();
    renderEntriesList();
}

function shuffleSlices() {
    if (slices.length <= 1) return;
    
    for (let i = slices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slices[i], slices[j]] = [slices[j], slices[i]];
    }

    drawWheel();
    playTickSound(1200, 0.08);
    setTimeout(() => playTickSound(1500, 0.08), 50);
}

function playTickSound(frequency = 1000, duration = 0.012) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration + 0.005);
    } catch (e) {
        console.warn("Audio synthesis not allowed or supported by browser: ", e);
    }
}

function triggerPinWiggle() {
    tickerPin.classList.remove('wiggle');
    void tickerPin.offsetWidth;
    tickerPin.classList.add('wiggle');
}

function getSliceUnderPointer() {
    if (slices.length === 0) return -1;
    
    const anglePerSlice = (2 * Math.PI) / slices.length;
    let pointerAngle = 1.5 * Math.PI - currentAngle;
    
    pointerAngle = pointerAngle % (2 * Math.PI);
    if (pointerAngle < 0) {
        pointerAngle += 2 * Math.PI;
    }
    
    const index = Math.floor(pointerAngle / anglePerSlice);
    return Math.min(index, slices.length - 1);
}

function drawWheel() {
    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = 280;

    ctx.clearRect(0, 0, width, height);

    if (slices.length === 0) {
        ctx.fillStyle = '#1a1a1a';
        ctx.font = "bold 20px 'Space Grotesk', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ADD ENTRIES TO BEGIN', center, center);
        
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1a1a1a';
        ctx.stroke();
        return;
    }

    const anglePerSlice = (2 * Math.PI) / slices.length;

    slices.forEach((slice, index) => {
        const startAngle = index * anglePerSlice + currentAngle;
        const endAngle = (index + 1) * anglePerSlice + currentAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = slice.color;
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#1a1a1a';
        ctx.stroke();
    });

    slices.forEach((slice, index) => {
        const startAngle = index * anglePerSlice + currentAngle;
        const endAngle = (index + 1) * anglePerSlice + currentAngle;
        const midAngle = startAngle + (endAngle - startAngle) / 2;

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(midAngle);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1a1a1a';

        const maxTextWidth = radius - 60;
        
        let fontSize = Math.min(42, Math.max(14, 320 / slices.length));
        ctx.font = `800 ${fontSize}px 'Space Grotesk', sans-serif`;

        let text = slice.text.toUpperCase();
        let textWidth = ctx.measureText(text).width;
        if (textWidth > maxTextWidth) {
            fontSize = Math.max(10, fontSize - 3);
            ctx.font = `800 ${fontSize}px 'Space Grotesk', sans-serif`;
            textWidth = ctx.measureText(text).width;
            
            if (textWidth > maxTextWidth) {
                while (text.length > 3 && textWidth > maxTextWidth) {
                    text = text.slice(0, -1);
                    textWidth = ctx.measureText(text + '...').width;
                }
                text = text + '...';
            }
        }

        ctx.fillText(text, radius - 20, 0);
        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 35, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1a1a1a';
    ctx.stroke();
}

function renderEntriesList() {
    entriesList.innerHTML = '';
    
    entries.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'entry-item';
        
        li.innerHTML = `
            <div class="entry-item-info">
                <span class="entry-color-indicator" style="background-color: ${entry.color};"></span>
                <span class="entry-label" title="${entry.text}">${entry.text.toUpperCase()}</span>
                <span class="entry-replicas-count">x${entry.replicas}</span>
            </div>
            <div class="entry-item-actions">
                <button class="brutalist-btn btn-small btn-yellow increment-btn" data-id="${entry.id}">+</button>
                <button class="brutalist-btn btn-small btn-yellow decrement-btn" data-id="${entry.id}">-</button>
                <button class="brutalist-btn btn-small btn-red delete-btn" data-id="${entry.id}">X</button>
            </div>
        `;
        
        entriesList.appendChild(li);
    });

    if (respin.active) {
        const li = document.createElement('li');
        li.className = 'entry-item';
        li.style.borderLeft = `6px solid ${respin.color}`;
        
        li.innerHTML = `
            <div class="entry-item-info" style="padding-left: 4px;">
                <span class="entry-color-indicator" style="background-color: ${respin.color};"></span>
                <span class="entry-label" style="color: var(--accent-red); font-weight: 800;">${respin.text}</span>
                <span class="entry-replicas-count">x${respin.replicas}</span>
            </div>
            <div class="entry-item-actions">
                <button class="brutalist-btn btn-small btn-yellow respin-inc">+</button>
                <button class="brutalist-btn btn-small btn-yellow respin-dec">-</button>
            </div>
        `;
        
        li.querySelector('.respin-inc').addEventListener('click', () => {
            respin.replicas = Math.min(100, respin.replicas + 1);
            respinReplicasInp.value = respin.replicas;
            updateSlices();
        });
        li.querySelector('.respin-dec').addEventListener('click', () => {
            respin.replicas = Math.max(1, respin.replicas - 1);
            respinReplicasInp.value = respin.replicas;
            updateSlices();
        });

        entriesList.appendChild(li);
    }

    const incrementBtns = entriesList.querySelectorAll('.increment-btn');
    const decrementBtns = entriesList.querySelectorAll('.decrement-btn');
    const deleteBtns = entriesList.querySelectorAll('.delete-btn');

    incrementBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const entry = entries.find(item => item.id === id);
            if (entry) {
                entry.replicas = Math.min(100, entry.replicas + 1);
                isDefaultState = false;
                updateSlices();
            }
        });
    });

    decrementBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const entry = entries.find(item => item.id === id);
            if (entry && entry.replicas > 1) {
                entry.replicas--;
                isDefaultState = false;
                updateSlices();
            }
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            entries = entries.filter(item => item.id !== id);
            isDefaultState = false;
            updateSlices();
        });
    });
}

function easeOutQuint(x) {
    return 1 - Math.pow(1 - x, 5);
}

function animateSpin() {
    if (!isSpinning) return;

    const now = Date.now();
    const elapsed = now - spinStartTime;
    const progress = Math.min(1, elapsed / spinDurationMs);

    currentAngle = startAngle + totalRotation * easeOutQuint(progress);

    const currentSliceIndex = getSliceUnderPointer();
    if (currentSliceIndex !== lastTickSliceIndex && currentSliceIndex !== -1) {
        const pitch = Math.max(600, Math.min(1400, 1100 - progress * 400));
        playTickSound(pitch, 0.012);
        triggerPinWiggle();
        lastTickSliceIndex = currentSliceIndex;
    }

    drawWheel();

    if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateSpin);
    } else {
        isSpinning = false;
        showWinner();
    }
}

function startSpin() {
    if (isSpinning || slices.length === 0) return;

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    isSpinning = true;
    lastTickSliceIndex = -1;
    spinStartTime = Date.now();
    spinDurationMs = spinDuration * 1000;
    startAngle = currentAngle % (2 * Math.PI);
    
    totalRotation = (5 + Math.random() * 3) * 2 * Math.PI + Math.random() * 2 * Math.PI;

    spinBtn.disabled = true;
    shuffleBtn.disabled = true;
    presetsBtn.disabled = true;
    settingsBtn.disabled = true;

    animateSpin();
}

function showWinner() {
    const winningIndex = getSliceUnderPointer();
    const winner = slices[winningIndex];

    if (!winner) {
        spinBtn.disabled = false;
        shuffleBtn.disabled = false;
        presetsBtn.disabled = false;
        settingsBtn.disabled = false;
        return;
    }

    if (winner.isRespin) {
        spinBtn.textContent = 'HERE WE GO AGAIN...';
        spinBtn.disabled = true;
        shuffleBtn.disabled = true;
        presetsBtn.disabled = true;
        settingsBtn.disabled = true;

        playTickSound(600, 0.15);
        setTimeout(() => playTickSound(500, 0.15), 100);

        spinBtn.style.backgroundColor = 'var(--accent-red)';
        spinBtn.style.color = '#ffffff';

        setTimeout(() => {
            spinBtn.style.backgroundColor = '';
            spinBtn.style.color = '';
            spinBtn.textContent = 'SPIN!';
            startSpin();
        }, 1200);
    } else {
        spinBtn.disabled = false;
        shuffleBtn.disabled = false;
        presetsBtn.disabled = false;
        settingsBtn.disabled = false;
        
        winnerText.textContent = winner.text.toUpperCase();
        
        const winnerCard = winnerModal.querySelector('.modal-card');
        winnerCard.style.outlineColor = 'var(--accent-blue)';
        winnerSubMsg.textContent = '';
        winnerSpinAgain.style.display = 'none';

        winnerModal.classList.add('open');
        
        playTickSound(880, 0.1);
        setTimeout(() => playTickSound(1100, 0.1), 100);
        setTimeout(() => playTickSound(1320, 0.15), 200);
    }
}

spinBtn.addEventListener('click', startSpin);
winnerSpinAgain.addEventListener('click', () => {
    winnerModal.classList.remove('open');
    setTimeout(startSpin, 300);
});

entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = entryTextInp.value.trim().toUpperCase();
    const replicas = parseInt(entryReplicasInp.value);
    
    if (text && replicas > 0) {
        if (isDefaultState) {
            entries = [];
            isDefaultState = false;
        }
        const id = Date.now().toString();
        
        const color = SLICE_COLORS[colorIndex];
        colorIndex = (colorIndex + 1) % SLICE_COLORS.length;

        entries.push({ id, text, replicas, color });
        updateSlices();

        entryTextInp.value = '';
        entryReplicasInp.value = '1';
        entryTextInp.focus();
    }
});

shuffleBtn.addEventListener('click', () => {
    shuffleSlices();
});

respinToggle.addEventListener('change', (e) => {
    respin.active = e.target.checked;
    
    if (respin.active) {
        respinReplicasInp.disabled = false;
        respinReplicasContainer.classList.remove('disabled');
    } else {
        respinReplicasInp.disabled = true;
        respinReplicasContainer.classList.add('disabled');
    }

    updateSlices();
});

respinReplicasInp.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (val > 0) {
        respin.replicas = val;
        updateSlices();
    }
});

presetsBtn.addEventListener('click', () => {
    presetsModal.classList.add('open');
});

closePresetsBtn.addEventListener('click', () => {
    presetsModal.classList.remove('open');
});

presetsModal.addEventListener('click', (e) => {
    if (e.target === presetsModal) {
        presetsModal.classList.remove('open');
    }
});

function applyPreset(presetEntries, presetRespinActive, presetRespinReplicas, isPresetDefault = false) {
    entries = presetEntries;
    respin.active = presetRespinActive;
    respin.replicas = presetRespinReplicas;
    isDefaultState = isPresetDefault;

    respinToggle.checked = respin.active;
    respinReplicasInp.value = respin.replicas;
    if (respin.active) {
        respinReplicasInp.disabled = false;
        respinReplicasContainer.classList.remove('disabled');
    } else {
        respinReplicasInp.disabled = true;
        respinReplicasContainer.classList.add('disabled');
    }

    colorIndex = entries.length % SLICE_COLORS.length;
    updateSlices();
    presetsModal.classList.remove('open');
    playTickSound(1000, 0.1);
    setTimeout(() => playTickSound(1300, 0.15), 100);
}

presetYesNoBtn.addEventListener('click', () => {
    applyPreset([
        { id: '1', text: 'YES', replicas: 3, color: '#ffcc00' },
        { id: '2', text: 'NO', replicas: 3, color: '#0055ff' }
    ], false, 1, true);
});

presetWhoPaysBtn.addEventListener('click', () => {
    applyPreset([
        { id: '1', text: 'DAVID', replicas: 3, color: '#ffcc00' },
        { id: '2', text: 'DOR', replicas: 3, color: '#0055ff' }
    ], true, 4);
});

presetFoodBtn.addEventListener('click', () => {
    applyPreset([
        { id: '1', text: 'HAMBURGER', replicas: 3, color: '#ffcc00' },
        { id: '2', text: 'SCHNITZEL', replicas: 3, color: '#0055ff' },
        { id: '3', text: 'TORTILLA', replicas: 3, color: '#ffffff' },
        { id: '4', text: 'ASIAN', replicas: 3, color: '#f5f0e8' }
    ], true, 2);
});

presetWoltBtn.addEventListener('click', () => {
    applyPreset([
        { id: '1', text: 'WOLT', replicas: 4, color: '#ffcc00' },
        { id: '2', text: 'NO WOLT', replicas: 4, color: '#0055ff' }
    ], true, 2);
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('open');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('open');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('open');
    }
});

settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = parseInt(spinDurationInp.value);
    if (val > 0) {
        spinDuration = val;
    }
    settingsModal.classList.remove('open');
});

closeWinnerBtn.addEventListener('click', () => {
    winnerModal.classList.remove('open');
});

winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
        winnerModal.classList.remove('open');
    }
});

window.addEventListener('load', () => {
    updateSlices();
});
