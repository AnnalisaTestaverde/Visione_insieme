// ===== CONFIGURAZIONE =====
const CONFIG = {
    colors: {
        background: '#ffffffff',
        text: '#000000ff',
        accent: '#FF2B00',
        accentLight: '#FF2B00',
        circle: '#111010b3',
        continentBase: '#FF2B00',
        highlightGlow: '#FF2B00',
        infoBox: '#ffffffff',
        infoBoxText: '#000000ff',
        infoBoxStroke: '#000000ff',
        timeline: '#FF2B00',
        selectedContinent: '#b9b9b988'
    },
    layout: {
        centerXRatio: 0.70, //posizione cerchio destra o sinistra
        maxRadius: 400, //grandezza cerchio
        minRadius: 31.5,
        continentLabelOffset: 15, //distanza dal cerchio esterno dei continenti
        europeAsiaOffset: 15, //idem a sopra ma con europa e asia, se li mettevo assieme mi rompevano il codice
        infoBoxWidth: 200,
        infoBoxHeight: 80,
        bottomControlY: 100,
        marginX: 60,
        fontSizeControls: 36,
        centerYOffset: 10, //posizione cerchio su o giù
        topOffset: -20,
        leftPanelWidth: 300,
        controlButtonHeight: 50,
        controlButtonWidth: 50,
        // DIMENSIONI PER I TESTI
        timeframeFontSize: 30,   //dimensione time frame
        yearFontSize: 45,        // dimensioen year
        labelFontSize: 18,
        // POSIZIONI SELECT TIME, YEAR E TITOLO
        titleStartY: 60,
        buttonStartY: 350,      
        timeframeStartY: 650,   
        yearStartY: 780         
    },
    animation: { // NUOVA SEZIONE: parametri per le animazioni
        dotEntryDuration: 800,
        dotStaggerDelay: 30,
        dotPopScale: 1.4,
        randomDelayMax: 600,
        waveDuration: 1000,
        easingFunction: 'easeOutBack',
        // NUOVO: parametri per animazioni veloci (quando si clicca Start Animation)
        fastDotEntryDuration: 400,
        fastRandomDelayMax: 200
    },
    centuries: [
        { label: 'all centuries', value: null },
        { label: '4200 BC', value: -4200 },
        { label: '3200 BC', value: -3200 },
        { label: '2200 BC', value: -2200 },
        { label: '1200 BC', value: -1200 },
        { label: '200 BC', value: -200 },
        { label: '800 AD', value: 800 },
        { label: '1800 AD', value: 1800 },
        { label: '1850 AD', value: 1850 },
        { label: '1900 AD', value: 1900 },
        { label: '1950 AD', value: 1950 },
        { label: '2000 AD', value: 2000 },
        { label: '2050 AD', value: 2050 }
    ]
};

let impactLevels = []; //Variabili globali
let allImpacts = [];

const CONCENTRIC_YEARS = [-4200, -3200, -2200, -1200, -200, 800, 1800, 1850, 1900, 1950, 2000, 2050];

// Costanti per l'animazione
const SELECTION_ANIMATION_DURATION = 800; // MODIFICATO: aumentato da 500 a 800ms per bagliore più visibile
const HOVER_ANIMATION_DURATION = 300; // ms
const CIRCLE_REVEAL_DURATION = 1500; // MODIFICATO: aumentato da 800ms a 1500ms per animazione più lenta
// MODIFICATO: Velocità diverse per animazione manuale vs automatica
const TIMELINE_ANIMATION_SPEED_NORMAL = 500; // Velocità normale (quando l'utente clicca manualmente)
const TIMELINE_ANIMATION_SPEED_FAST = 800; // MODIFICATO: Velocità più lenta per Start Animation (era 200ms, ora 800ms)
const TIMELINE_PAUSE_BETWEEN_CYCLES = 1000; // Pausa tra un ciclo e l'altro

// ===== STATO APPLICAZIONE =====
let state = {
    volcanoData: [],
    filteredData: [],
    selectedCentury: null,
    selectedContinent: null,
    hoveredVolcano: null,
    timelineYear: null,
    centerX: 0,
    centerY: 0,
    continentAngles: {},
    continentCounts: {},
    volcanoPositions: new Map(),
    globalYearRange: { min: 0, max: 0 },
    timelineButtons: [],
    currentCenturiesIndex: 0,
    isPlaying: false,
    leftControlAreas: null,
    rightControlAreas: null,
    asiaLabelY: 0,
    // VARIABILI PER ANIMAZIONE
    animationTimer: 0,
    animationSpeed: TIMELINE_ANIMATION_SPEED_NORMAL, // MODIFICATO: usa costante
    pauseBetweenCycles: TIMELINE_PAUSE_BETWEEN_CYCLES, // MODIFICATO: usa costante
    isPausedBetweenCycles: false,
    // VARIABILI PER I NUOVI CONTROLLI
    startButtonArea: null,
    timeFrameLeftArrows: null,
    timeFrameRightArrows: null,
    yearLeftArrow: null,
    yearRightArrow: null,
    // NUOVO: gestione dinamica degli anni
    availableYears: [],
    currentYearIndex: 0,
    // NUOVO: variabile per mostrare l'anno nel selettore senza attivare l'evidenziazione
    displayedYear: null,
    // NUOVO: flag per tracciare se l'anno è stato attivato dall'utente
    yearActivatedByUser: false,
    // NUOVO: mappe per le animazioni
    selectionAnimationStart: new Map(),
    hoverAnimationStart: new Map(),
    // NUOVO: animazione per i cerchi rossi
    circleRevealStart: null,
    circleRevealProgress: 0,
    // NUOVE VARIABILI PER ANIMAZIONE DOTS
    dotAnimationStart: null,
    dotAnimationProgress: 0,
    dotAppearTimes: new Map(),
    waveAnimationStart: null,
    waveAnimationProgress: 0,
    // NUOVA: flag per disabilitare animazione entrata dots durante timeline
    disableDotEntryAnimation: false,
    // NUOVA: flag per indicare se usare animazioni veloci
    useFastAnimations: false
};

// Variabile per l'immagine di sfondo radiale
let radialBgImage;

// ===== MAPPATURA CONTINENTI =====
const CONTINENT_MAP = {
    'Arabia-S': 'Asia', 'Arabia-W': 'Asia', 'China-S': 'Asia', 'Halmahera-Indonesia': 'Asia',
    'Hokkaido-Japan': 'Asia', 'Honshu-Japan': 'Asia', 'Indonesia': 'Asia', 'Izu Is-Japan': 'Asia',
    'Java': 'Asia', 'Kamchatka': 'Asia', 'Kuril Is': 'Asia', 'Kyushu-Japan': 'Asia',
    'Lesser Sunda Is': 'Asia', 'Luzon-Philippines': 'Asia', 'Mindanao-Philippines': 'Asia',
    'Philippines-C': 'Asia', 'Ryukyu Is': 'Asia', 'Sangihe Is-Indonesia': 'Asia',
    'Sulawesi-Indonesia': 'Asia', 'Sumatra': 'Asia', 'Turkey': 'Asia',
    
    'Alaska Peninsula': 'Americhe', 'Alaska-SW': 'Americhe', 'Aleutian Is': 'Americhe',
    'Canada': 'Americhe', 'Chile-C': 'Americhe', 'Chile-S': 'Americhe', 'Colombia': 'Americhe',
    'Costa Rica': 'Americhe', 'Ecuador': 'Americhe', 'El Salvador': 'Americhe', 'Galapagos': 'Americhe',
    'Guatemala': 'Americhe', 'Hawaiian Is': 'Americhe', 'Mexico': 'Americhe', 'Nicaragua': 'Americhe',
    'Peru': 'Americhe', 'US-Oregon': 'Americhe', 'US-Washington': 'Americhe', 'US-Wyoming': 'Americhe',
    'W Indies': 'Americhe',
    
    'Azores': 'Europa', 'Canary Is': 'Europa', 'Greece': 'Europa', 'Iceland-NE': 'Europa',
    'Iceland-S': 'Europa', 'Iceland-SE': 'Europa', 'Iceland-SW': 'Europa', 'Italy': 'Europa',
    
    'Admiralty Is-SW Paci': 'Oceania', 'Banda Sea': 'Oceania', 'Bougainville-SW Paci': 'Oceania',
    'Kermadec Is': 'Oceania', 'New Britain-SW Pac': 'Oceania', 'New Guinea': 'Oceania',
    'New Guinea-NE of': 'Oceania', 'New Zealand': 'Oceania', 'Samoa-SW Pacific': 'Oceania',
    'Santa Cruz Is-SW Pac': 'Oceania', 'Solomon Is-SW Pacifi': 'Oceania', 'Tonga-SW Pacific': 'Oceania',
    'Vanuatu-SW Pacific': 'Oceania',
    
    'Africa-C': 'Africa', 'Africa-E': 'Africa', 'Africa-NE': 'Africa', 'Africa-W': 'Africa',
    'Cape Verde Is': 'Africa', 'Indian O-W': 'Africa', 'Red Sea': 'Africa'
};

const CONTINENTS = ['Asia', 'Americhe', 'Europa', 'Oceania', 'Africa'];

// FUNZIONE: Carica i dati CSV e l'immagine di sfondo
function preload() {
    loadTable('assets/data_impatto.csv', 'csv', 'header', processTableData);
    radialBgImage = loadImage('assets/radial_bg.png');
}

// FUNZIONE: Processa i dati della tabella CSV e inizializza i dati dei vulcani
function processTableData(table) {
    state.volcanoData = [];
    allImpacts = [];
    
    for (let r = 0; r < table.getRowCount(); r++) {
        let row = table.getRow(r);
        let location = row.getString('Location');
        
        let deaths = parseInt(row.getString('Deaths')) || 0;
        let impact = parseInt(row.getString('Impact')) || 1;
        
        if (!isNaN(impact)) {
            allImpacts.push(impact);
        }
        
        state.volcanoData.push({
            year: parseInt(row.getString('Year')) || 0,
            name: row.getString('Name'),
            location: location,
            country: row.getString('Country'),
            type: row.getString('Type'),
            impact: impact,
            deaths: deaths,
            continent: CONTINENT_MAP[location] || 'Sconosciuto'
        });
    }
    
    impactLevels = [...new Set(allImpacts)].sort((a, b) => a - b);
    
    if (!impactLevels.includes(15)) {
        impactLevels.push(15);
    }
    
    impactLevels.sort((a, b) => a - b);
    
    state.volcanoData.sort((a, b) => b.year - a.year);
    initializeData();
}

// FUNZIONE: Inizializza i dati dopo il caricamento
function initializeData() {
    state.filteredData = [...state.volcanoData];
    state.globalYearRange = getGlobalYearRange();
    calculateContinentData();
    calculateVolcanoPositions();
    calculateTimelineButtons();
    updateAvailableYears(); // Inizializza gli anni disponibili
    
    // Inizia l'animazione di apertura dei cerchi
    state.circleRevealStart = millis();
    
    // Inizia l'animazione dei dots dopo i cerchi (usando animazioni normali)
    state.dotAnimationStart = millis() + 300;
    state.dotAnimationProgress = 0;
    state.useFastAnimations = false;
    
    // Inizializza l'animazione a onde
    state.waveAnimationStart = null;
    state.waveAnimationProgress = 0;
    
    // Calcola i tempi di apparizione randomica per ogni dot (usando tempi normali)
    state.dotAppearTimes.clear();
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
        state.dotAppearTimes.set(key, randomDelay);
    });
    
    state.disableDotEntryAnimation = false;
}

// FUNZIONE: Setup iniziale di p5.js
function setup() {
    createCanvas(windowWidth, windowHeight);
    updateLayout();
}

// FUNZIONE: Aggiorna il layout quando la finestra cambia dimensione
function updateLayout() {
    state.centerX = width * CONFIG.layout.centerXRatio;
    state.centerY = height / 2 + CONFIG.layout.centerYOffset;
    calculateTimelineButtons();
}

// FUNZIONE: Calcola la distribuzione angolare dei continenti
function calculateContinentData() {
    state.continentCounts = CONTINENTS.reduce((acc, cont) => {
        acc[cont] = 0;
        return acc;
    }, {});
    
    state.volcanoData.forEach(v => {
        if (state.continentCounts[v.continent] !== undefined) {
            state.continentCounts[v.continent]++;
        }
    });
    
    let total = state.volcanoData.length;
    let startAngle = 0;
    
    state.continentAngles = {};
    CONTINENTS.forEach(cont => {
        let proportion = total > 0 ? state.continentCounts[cont] / total : 0;
        let angleSize = proportion * TWO_PI;
        
        state.continentAngles[cont] = {
            start: startAngle,
            end: startAngle + angleSize,
            mid: startAngle + angleSize / 2
        };
        
        startAngle += angleSize;
    });
}

// FUNZIONE: Calcola le posizioni angolari casuali dei vulcani
function calculateVolcanoPositions() {
    state.volcanoPositions.clear();
    
    state.volcanoData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        let angles = state.continentAngles[v.continent];
        if (angles && !state.volcanoPositions.has(key)) {
            state.volcanoPositions.set(key, random(angles.start, angles.end));
        }
    });
}

// NUOVA FUNZIONE: Aggiorna gli anni disponibili in base al periodo selezionato
function updateAvailableYears() {
    if (state.selectedCentury === null) {
        // Se nessun periodo selezionato, mostra tutti gli anni unici
        state.availableYears = [...new Set(state.volcanoData.map(v => v.year))].sort((a, b) => a - b);
    } else {
        // Se periodo selezionato, mostra solo gli anni in quel periodo
        const centuryIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
        if (centuryIndex !== -1 && centuryIndex < CONCENTRIC_YEARS.length - 1) {
            const startYear = CONCENTRIC_YEARS[centuryIndex];
            const endYear = CONCENTRIC_YEARS[centuryIndex + 1];
            
            const filteredYears = state.volcanoData
                .filter(v => {
                    if (centuryIndex === CONCENTRIC_YEARS.length - 2) {
                        return v.year >= startYear && v.year <= endYear;
                    } else {
                        return v.year >= startYear && v.year < endYear;
                    }
                })
                .map(v => v.year);
            
            state.availableYears = [...new Set(filteredYears)].sort((a, b) => a - b);
        } else {
            state.availableYears = [];
        }
    }
    
    // Quando cambiamo periodo, resettiamo l'evidenziazione
    // Ma manteniamo l'anno da mostrare nel selettore (il primo disponibile)
    state.timelineYear = null;
    state.displayedYear = state.availableYears.length > 0 ? state.availableYears[0] : null;
    state.currentYearIndex = 0;
    state.yearActivatedByUser = false; // Resetta il flag
    
    // Ferma l'animazione quando si cambia periodo
    state.isPlaying = false;
    state.animationTimer = 0;
    state.isPausedBetweenCycles = false;
    state.useFastAnimations = false; // MODIFICATO: reset animazioni veloci
    
    // Resetta le animazioni dei vulcani
    state.selectionAnimationStart.clear();
    state.hoverAnimationStart.clear();
    
    // Resetta animazione dots (usando animazioni normali)
    state.dotAnimationStart = millis();
    state.dotAnimationProgress = 0;
    state.disableDotEntryAnimation = false;
    
    // Calcola i tempi di apparizione randomica per ogni dot (usando tempi normali)
    state.dotAppearTimes.clear();
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
        state.dotAppearTimes.set(key, randomDelay);
    });
}

// FUNZIONE: Calcola il raggio in base al livello di impatto
function getRadiusForImpact(impact) {
    if (impactLevels.length <= 1) return CONFIG.layout.minRadius;
    
    let idx = impactLevels.indexOf(impact);
    if (idx === -1) return CONFIG.layout.minRadius;
    
    const totalLevels = impactLevels.length;
    const normalized = idx / (totalLevels - 1);
    
    return map(normalized, 0, 1, CONFIG.layout.maxRadius, CONFIG.layout.minRadius);
}

// FUNZIONE: Disegna i cerchi concentrici dei livelli di impatto
function drawImpactCircles() {
    // Indici speciali: 0, 4, 8, 12 (corrispondenti ai cerchi 1, 5, 9, 13 partendo dall'esterno)
    // NOTA: il cerchio 16 (indice 15) NON è incluso
    const specialIndices = [0, 4, 8, 12].filter(index => index < impactLevels.length);
    
    // Aggiorna l'animazione di apertura dei cerchi
    if (state.circleRevealStart !== null) {
        const elapsed = millis() - state.circleRevealStart;
        state.circleRevealProgress = constrain(elapsed / CIRCLE_REVEAL_DURATION, 0, 1);
        
        if (state.circleRevealProgress >= 1) {
            state.circleRevealStart = null;
        }
    }
    
    for (let i = 0; i < impactLevels.length; i++) {
        let radius = map(i, 0, impactLevels.length - 1, 
                        CONFIG.layout.maxRadius, CONFIG.layout.minRadius);
        noFill();
        
        // Determina se è un cerchio speciale
        const isSpecial = specialIndices.includes(i);
        
        if (isSpecial) {
            // Animazione di apertura per i cerchi speciali
            let animatedRadius = radius;
            let animatedStrokeWeight = 2;
            let animatedAlpha = 255;
            
            if (state.circleRevealProgress < 1) {
                // Calcola progresso per questo cerchio (i cerchi si aprono dall'interno verso l'esterno)
                const circleProgress = constrain((state.circleRevealProgress * impactLevels.length - i) / 4, 0, 1);
                animatedRadius = radius * circleProgress;
                animatedStrokeWeight = 2 * circleProgress;
                animatedAlpha = 255 * circleProgress;
            }
            
            stroke(255, 43, 0, animatedAlpha); // rosso con animazione alpha
            strokeWeight(animatedStrokeWeight); // più spesso con animazione
            ellipse(0, 0, animatedRadius * 2);
            
            // Se l'animazione è completa, aggiungi etichetta
            if (state.circleRevealProgress >= 1) {
                // Il numero del cerchio partendo da 1
                const circleNumber = i + 1;
                // Calcola il punto sull'asse Y (in alto)
                const labelX = 0;
                const labelY = -radius - 15; // 15 pixel sopra il cerchio
                
                push();
                fill(CONFIG.colors.accent);
                noStroke();
                textSize(14);
                textAlign(CENTER, CENTER);
                text(circleNumber, labelX, labelY);
                pop();
            }
        } else {
            // Cerchi normali con animazione
            let animatedRadius = radius;
            if (state.circleRevealProgress < 1) {
                const circleProgress = constrain((state.circleRevealProgress * impactLevels.length - i) / 4, 0, 1);
                animatedRadius = radius * circleProgress;
            }
            
            stroke(CONFIG.colors.circle);
            strokeWeight(0.5);
            ellipse(0, 0, animatedRadius * 2);
        }
    }
}

// FUNZIONE: Calcola le posizioni dei bottoni della timeline
function calculateTimelineButtons() {
    state.timelineButtons = [];
    const tlY = height - CONFIG.layout.bottomControlY;
    const tlXStart = width * 0.2;
    const tlXEnd = width * 0.8;
    const tlW = tlXEnd - tlXStart;
    
    state.timelineButtons.push({
        label: 'all centuries',
        value: null,
        x: tlXStart - 40,
        y: tlY,
        radius: 8
    });
    
    CONCENTRIC_YEARS.forEach((year, i) => {
        const normalized = i / (CONCENTRIC_YEARS.length - 1);
        const xPos = tlXStart + normalized * tlW;
        
        state.timelineButtons.push({
            label: formatYearShort(year),
            value: year,
            x: xPos,
            y: tlY,
            radius: 8
        });
    });
}

// FUNZIONE: Applica i filtri in base al secolo e continente selezionati
function applyFilters() {
    state.filteredData = state.volcanoData.filter(v => {
        let centuryMatch = true;
        
        if (state.selectedCentury !== null) {
            const centuryIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
            if (centuryIndex !== -1 && centuryIndex < CONCENTRIC_YEARS.length - 1) {
                const startYear = CONCENTRIC_YEARS[centuryIndex];
                const endYear = CONCENTRIC_YEARS[centuryIndex + 1];
                
                if (centuryIndex === CONCENTRIC_YEARS.length - 2) {
                    centuryMatch = (v.year >= startYear && v.year <= endYear);
                } else {
                    centuryMatch = (v.year >= startYear && v.year < endYear);
                }
            } else {
                centuryMatch = false;
            }
        }
        
        const continentMatch = state.selectedContinent === null || 
                             v.continent === state.selectedContinent;
        return centuryMatch && continentMatch;
    });

    calculateContinentData();
    updateAvailableYears(); // Aggiorna gli anni disponibili dopo il filtro
    
    // MODIFICATO: Inizia animazione dots quando si applicano filtri (usando animazioni normali)
    if (state.selectedCentury !== null || state.selectedContinent !== null) {
        state.useFastAnimations = false;
        state.dotAnimationStart = millis();
        state.dotAnimationProgress = 0;
        
        state.dotAppearTimes.clear();
        state.filteredData.forEach(v => {
            let key = `${v.name}-${v.year}-${v.deaths}`;
            const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
            state.dotAppearTimes.set(key, randomDelay);
        });
    }
}

// FUNZIONE: Ottiene il range globale di anni dai dati
function getGlobalYearRange() {
    const years = state.volcanoData.map(v => v.year);
    return {
        min: Math.min(...years),
        max: Math.max(...years)
    };
}

// FUNZIONE: Gestisce l'animazione della timeline
function updateAnimation() {
    if (!state.isPlaying || state.availableYears.length === 0) return;
    
    // Se l'anno non è stato attivato dall'utente, lo attiviamo ora
    if (!state.yearActivatedByUser) {
        state.yearActivatedByUser = true;
        state.timelineYear = state.availableYears[state.currentYearIndex];
        // MODIFICATO: aggiorna anche displayedYear
        state.displayedYear = state.availableYears[state.currentYearIndex];
        // Resetta le animazioni di selezione
        state.selectionAnimationStart.clear();
    }
    
    if (state.isPausedBetweenCycles) {
        state.animationTimer += deltaTime;
        if (state.animationTimer >= state.pauseBetweenCycles) {
            state.animationTimer = 0;
            state.isPausedBetweenCycles = false;
            state.currentYearIndex = 0;
            state.timelineYear = state.availableYears[0];
            // MODIFICATO: aggiorna anche displayedYear
            state.displayedYear = state.availableYears[0];
        }
        return;
    }
    
    state.animationTimer += deltaTime;
    
    if (state.animationTimer >= state.animationSpeed) {
        state.animationTimer = 0;
        
        if (state.currentYearIndex < state.availableYears.length - 1) {
            state.currentYearIndex++;
        } else {
            state.isPausedBetweenCycles = true;
            return;
        }
    }
    
    // MODIFICATO: Aggiorna sia timelineYear che displayedYear durante l'animazione
    state.timelineYear = state.availableYears[state.currentYearIndex];
    state.displayedYear = state.availableYears[state.currentYearIndex];
}

// NUOVA FUNZIONE: Aggiorna le animazioni dei dots
function updateDotAnimations() {
    if (state.isPlaying) {
        state.disableDotEntryAnimation = true;
    } else if (!state.isPlaying && state.dotAnimationStart === null) {
        state.disableDotEntryAnimation = false;
    }
    
    if (state.dotAnimationStart !== null) {
        const elapsed = millis() - state.dotAnimationStart;
        const duration = state.useFastAnimations ? 
            CONFIG.animation.fastDotEntryDuration : 
            CONFIG.animation.dotEntryDuration;
        
        state.dotAnimationProgress = constrain(elapsed / duration, 0, 1);
        
        if (state.dotAnimationProgress >= 1) {
            state.dotAnimationStart = null;
        }
    }
    
    if (state.waveAnimationStart !== null) {
        const waveElapsed = millis() - state.waveAnimationStart;
        state.waveAnimationProgress = constrain(waveElapsed / CONFIG.animation.waveDuration, 0, 1);
        
        if (state.waveAnimationProgress >= 1) {
            state.waveAnimationStart = null;
        }
    }
}

// NUOVA FUNZIONE: Inizia animazioni veloci per i dots
function startFastDotAnimations() {
    state.useFastAnimations = true;
    state.dotAnimationStart = millis();
    state.dotAnimationProgress = 0;
    
    state.dotAppearTimes.clear();
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        const randomDelay = Math.random() * CONFIG.animation.fastRandomDelayMax;
        state.dotAppearTimes.set(key, randomDelay);
    });
}

// NUOVA FUNZIONE: Trigger animazione a onde
function triggerWaveAnimation() {
    state.waveAnimationStart = millis();
    state.waveAnimationProgress = 0;
}

// FUNZIONE: Loop principale di disegno
function draw() {
    background(CONFIG.colors.background);
    updateLayout();
    
    updateAnimation();
    updateDotAnimations();
    
    drawTitle();
    drawStartAnimationButton();
    drawMainCircle();
    drawContinentLabels();
    drawTemporalRangeSelector();
    drawYearSelector();
    drawInfobox();
    
    checkHover();
}

// FUNZIONE: Disegna il titolo principale (su tre righe a sinistra)
function drawTitle() {
    textSize(96);
    textFont('Helvetica');
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    
    const titleY = CONFIG.layout.titleStartY + CONFIG.layout.topOffset;
    
    fill(CONFIG.colors.text);
    text('SIGNIFICANT', CONFIG.layout.marginX, titleY);

    fill(CONFIG.colors.text);
    text('VOLCANIC', CONFIG.layout.marginX, titleY + 90);
     
    fill(CONFIG.colors.accent);
    text('ERUPTIONS', CONFIG.layout.marginX, titleY + 180);
    
    textStyle(NORMAL);
}

// FUNZIONE: Disegna il pulsante Start Animation
function drawStartAnimationButton() {
    const buttonX = CONFIG.layout.marginX;
    const buttonY = CONFIG.layout.buttonStartY;
    const buttonWidth = 200;
    const buttonHeight = CONFIG.layout.controlButtonHeight;

    // Disegna il bordo rosso fine
    stroke(CONFIG.colors.accent);
    strokeWeight(1);
    noFill();
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 5);

    // Disegna il triangolino play o quadratino stop
    fill(CONFIG.colors.accent);
    noStroke();
    
    if (state.isPlaying) {
        // Disegna quadratino stop
        rect(buttonX + 15, buttonY + 15, 20, 20);
    } else {
        // Disegna triangolino play
        triangle(
            buttonX + 15, buttonY + 15,
            buttonX + 15, buttonY + 35,
            buttonX + 35, buttonY + 25
        );
    }

    // Disegna il testo
    fill(CONFIG.colors.text);
    noStroke();
    textSize(14);
    textAlign(LEFT, CENTER);
    const buttonText = state.isPlaying ? 'Stop Animation' : 'Start Animation';
    text(buttonText, buttonX + 50, buttonY + 25);

    // Memorizza l'area del pulsante per il click
    state.startButtonArea = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
    };
}

// FUNZIONE: Disegna il selettore del time frame, quindi le freccettine
function drawTemporalRangeSelector() {
    const startX = CONFIG.layout.marginX;
    const startY = CONFIG.layout.timeframeStartY; // MODIFICATO: posizione più in basso
    const labelY = startY;
    const controlsY = startY + 40;

    // Etichetta "select time frame:"
    fill(CONFIG.colors.text);
    noStroke();
    textSize(CONFIG.layout.labelFontSize);
    textAlign(LEFT, TOP);
    text('Select time frame:', startX, labelY);

    // Calcola gli anni del periodo selezionato
    let yearString;
    
    if (state.selectedCentury === null) {
        yearString = 'all centuries';
    } else {
        const index = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
        if (index !== -1 && index < CONCENTRIC_YEARS.length - 1) {
            const startYear = formatYearShort(CONCENTRIC_YEARS[index]);
            const endYear = formatYearShort(CONCENTRIC_YEARS[index + 1]);
            yearString = startYear + ' - ' + endYear;
        } else {
            yearString = 'all centuries';
        }
    }

    // Disegna le due frecce a sinistra con quadratino (NERO)
    const leftArrowsX = startX;
    const leftArrowsY = controlsY;
    drawDoubleArrowWithBox(leftArrowsX, leftArrowsY, 60, 40, '<<', CONFIG.colors.text, true); // true = nero

    // Disegna gli anni al centro con più spazio
    const yearX = leftArrowsX + 60; 
    fill(CONFIG.colors.text); // Nero
    textSize(CONFIG.layout.timeframeFontSize);
    textAlign(CENTER, CENTER);
    text(yearString, yearX + 140, leftArrowsY + 20); 

    // Disegna le due frecce a destra con quadratino (NERO)
    const rightArrowsX = yearX + 280; 
    drawDoubleArrowWithBox(rightArrowsX, leftArrowsY, 60, 40, '>>', CONFIG.colors.text, true); // true = nero

    // Memorizza le aree per il click (aggiornate per le nuove dimensioni)
    state.timeFrameLeftArrows = {
        x: leftArrowsX,
        y: leftArrowsY,
        width: 60,
        height: 40
    };
    state.timeFrameRightArrows = {
        x: rightArrowsX,
        y: leftArrowsY,
        width: 60,
        height: 40
    };
}

// FUNZIONE: Disegna il selettore dell'anno
function drawYearSelector() {
    const startX = CONFIG.layout.marginX;
    const startY = CONFIG.layout.yearStartY; 
    const labelY = startY;
    const controlsY = startY + 40;

    // Etichetta "select year:" in ROSSO
    fill(CONFIG.colors.accent); // ROSSO
    noStroke();
    textSize(CONFIG.layout.labelFontSize);
    textAlign(LEFT, TOP);
    text('Select year:', startX, labelY);


    // Freccia sinistra con quadratino (ROSSO)
    const leftArrowX = startX;
    const leftArrowY = controlsY;
    drawSingleArrowWithBox(leftArrowX, leftArrowY, 50, 40, '<', CONFIG.colors.accent, false); // false = rosso

    // Anno da mostrare (displayedYear, non timelineYear)
    const yearX = leftArrowX + 70;
    
    let yearText;
    if (state.displayedYear !== null) {
        yearText = formatYear(state.displayedYear);
    } else if (state.availableYears.length > 0) {
        // Mostra l'anno più vecchio disponibile
        yearText = formatYear(state.availableYears[0]);
    } else {
        yearText = 'No data';
    }
    
    // Anno sempre in ROSSO
    fill(CONFIG.colors.accent); // SEMPRE ROSSO
    textSize(CONFIG.layout.yearFontSize); 
    textAlign(CENTER, CENTER);
    text(yearText, yearX + 110, leftArrowY + 20); 

    // Freccia destra con quadratino (ROSSO)
    const rightArrowX = yearX + 240; // MODIFICATO: aumentato da 200 a 240
    drawSingleArrowWithBox(rightArrowX, leftArrowY, 50, 40, '>', CONFIG.colors.accent, false); // false = rosso

    // Memorizza le aree per il click
    state.yearLeftArrow = {
        x: leftArrowX,
        y: leftArrowY,
        width: 50,
        height: 40
    };
    state.yearRightArrow = {
        x: rightArrowX,
        y: leftArrowY,
        width: 50,
        height: 40
    };
}

// NUOVA FUNZIONE: Disegna doppia freccia con quadratino (per secoli)
function drawDoubleArrowWithBox(x, y, w, h, arrows, arrowColor, isBlack) {
    // Disegna il quadratino bianco con bordo
    fill(255);
    stroke(isBlack ? CONFIG.colors.text : CONFIG.colors.accent); // MODIFICATO: nero per secoli, rosso per anni
    strokeWeight(1);
    rect(x, y, w, h, 5);
    
    // Disegna le frecce
    fill(arrowColor);
    noStroke();
    textSize(24);
    textAlign(CENTER, CENTER);
    text(arrows, x + w/2, y + h/2);
}

// NUOVA FUNZIONE: Disegna singola freccia con quadratino (per anni)
function drawSingleArrowWithBox(x, y, w, h, arrow, arrowColor, isBlack) {
    // Disegna il quadratino bianco con bordo
    fill(255);
    stroke(isBlack ? CONFIG.colors.text : CONFIG.colors.accent); // MODIFICATO: nero per secoli, rosso per anni
    strokeWeight(1);
    rect(x, y, w, h, 5);
    
    // Disegna la freccia
    fill(arrowColor);
    noStroke();
    textSize(24);
    textAlign(CENTER, CENTER);
    text(arrow, x + w/2, y + h/2);
}

// FUNZIONE: Disegna l'infobox per il vulcano hovered
function drawInfobox() {
    if (state.hoveredVolcano) {
        const volcano = state.hoveredVolcano;
        const boxWidth = CONFIG.layout.infoBoxWidth;
        const boxHeight = CONFIG.layout.infoBoxHeight;

        // Posiziona il box vicino al mouse
        let x = mouseX + 20;
        let y = mouseY - boxHeight / 2;

        // Evita che il box esca dallo schermo
        if (x + boxWidth > width) x = mouseX - boxWidth - 20;
        if (y < 0) y = 0;
        if (y + boxHeight > height) y = height - boxHeight;

        // Disegna il rettangolo bianco con bordo nero
        fill(CONFIG.colors.infoBox);
        stroke(CONFIG.colors.infoBoxStroke);
        strokeWeight(1);
        rect(x, y, boxWidth, boxHeight, 5);

        // Testo
        fill(CONFIG.colors.infoBoxText);
        noStroke();
        textSize(16);
        textAlign(LEFT, TOP);
        text(volcano.name, x + 10, y + 10);
        textSize(14);
        text('Year: ' + formatYear(volcano.year), x + 10, y + 40);
    }
}

// FUNZIONE: Disegna il cerchio principale con tutti gli elementi
function drawMainCircle() {
    push();
    translate(state.centerX, state.centerY);
    
    if (radialBgImage) {
        let imageDim = 2;
        let imageSize = CONFIG.layout.maxRadius * imageDim;
        imageMode(CENTER);
        image(radialBgImage, 0, 0, imageSize, imageSize);
    }
    
    drawImpactCircles();
    drawContinentDividers();
    
    if (state.filteredData.length > 0) {
        drawVolcanoes();
    }
    
    pop();
}

// FUNZIONE: Disegna le linee divisorie tra i continenti
function drawContinentDividers() {
    stroke(CONFIG.colors.circle);
    strokeWeight(1);
    
    CONTINENTS.forEach(cont => {
        const angles = state.continentAngles[cont];
        if (angles) {
            line(0, 0, 
                 cos(angles.start) * CONFIG.layout.maxRadius, 
                 sin(angles.start) * CONFIG.layout.maxRadius);
        }
    });
}

// FUNZIONE: Disegna tutti i vulcani filtrati
function drawVolcanoes() {
    state.filteredData.forEach(v => {
        let key = `${v.name}-${v.year}-${v.deaths}`;
        let angle = state.volcanoPositions.get(key);
        const angles = state.continentAngles[v.continent];

        if (!angle && angles) angle = angles.mid;
        if (!angle) return; 

        const r = getRadiusForImpact(v.impact);
        const x = cos(angle) * r;
        const y = sin(angle) * r;

        // MODIFICATO: ora l'evidenziazione avviene solo se timelineYear non è null
        // E se l'anno è stato attivato dall'utente (yearActivatedByUser)
        const isHighlighted = (state.timelineYear !== null && state.yearActivatedByUser && v.year === state.timelineYear);
        const isHovered = (state.hoveredVolcano === v);

        // Gestione animazione selezione
        if (isHighlighted) {
            if (!state.selectionAnimationStart.has(key)) {
                state.selectionAnimationStart.set(key, millis());
            }
        } else {
            state.selectionAnimationStart.delete(key);
        }

        // Gestione animazione hover
        if (isHovered) {
            if (!state.hoverAnimationStart.has(key)) {
                state.hoverAnimationStart.set(key, millis());
            }
        } else {
            state.hoverAnimationStart.delete(key);
        }

        // Calcolo progressi animazione
        let selectionProgress = 0;
        if (isHighlighted && state.selectionAnimationStart.has(key)) {
            const startTime = state.selectionAnimationStart.get(key);
            const elapsed = millis() - startTime;
            selectionProgress = constrain(elapsed / SELECTION_ANIMATION_DURATION, 0, 1);
        }

        let hoverProgress = 0;
        if (isHovered && state.hoverAnimationStart.has(key)) {
            const startTime = state.hoverAnimationStart.get(key);
            const elapsed = millis() - startTime;
            hoverProgress = constrain(elapsed / HOVER_ANIMATION_DURATION, 0, 1);
        }

        // Disegna il bagliore se necessario
        if (isHighlighted || isHovered) {
            drawVolcanoGlow(v, x, y, isHighlighted, isHovered, selectionProgress, hoverProgress);
        }
        
        // Disegna il punto del vulcano con animazione
        drawVolcanoDotAnimated(x, y, isHighlighted, isHovered, v, key);
    });
}

// MODIFICATA: Disegna il punto del vulcano con animazione
function drawVolcanoDotAnimated(x, y, isHighlighted, isHovered, volcano, key) {
    let entryProgress = 1;
    
    if (!state.disableDotEntryAnimation && state.dotAnimationStart !== null && state.dotAnimationProgress < 1) {
        const appearTime = state.dotAppearTimes.get(key) || 0;
        const elapsed = millis() - state.dotAnimationStart;
        
        if (elapsed >= appearTime) {
            const dotElapsed = elapsed - appearTime;
            const duration = state.useFastAnimations ? 
                CONFIG.animation.fastDotEntryDuration : 
                CONFIG.animation.dotEntryDuration;
            entryProgress = constrain(dotElapsed / duration, 0, 1);
        } else {
            entryProgress = 0;
        }
    }
    
    if (entryProgress === 0) return;
    
    const baseSize = isHighlighted ? 10 : isHovered ? 8 : 5;
    const finalSize = baseSize * entryProgress;
    const alpha = 255 * entryProgress;
    
    let color;
    if (isHighlighted) {
        color = CONFIG.colors.highlightGlow;
    } else if (isHovered) {
        color = CONFIG.colors.text;
    } else {
        color = CONFIG.colors.text;
    }
    
    fill(red(color), green(color), blue(color), alpha);
    noStroke();
    circle(x, y, finalSize);
}

// MODIFICATA: Disegna l'effetto glow con durata adattabile
function drawVolcanoGlow(volcano, x, y, isHighlighted, isHovered, selectionProgress, hoverProgress) {
    let entryProgress = 1;
    const key = `${volcano.name}-${volcano.year}-${volcano.deaths}`;
    
    if (!state.disableDotEntryAnimation && state.dotAnimationStart !== null && state.dotAnimationProgress < 1) {
        const appearTime = state.dotAppearTimes.get(key) || 0;
        const elapsed = millis() - state.dotAnimationStart;
        
        if (elapsed >= appearTime) {
            const dotElapsed = elapsed - appearTime;
            const duration = state.useFastAnimations ? 
                CONFIG.animation.fastDotEntryDuration : 
                CONFIG.animation.dotEntryDuration;
            entryProgress = constrain(dotElapsed / duration, 0, 1);
        } else {
            entryProgress = 0;
        }
    }
    
    if (entryProgress === 0) return;
    
    let glowSize, alpha;
    
    if (isHighlighted) {
        let baseSize = map(volcano.impact, 5, 15, 60, 90);
        let baseAlpha = map(volcano.impact, 5, 15, 70, 100);
        glowSize = selectionProgress * baseSize * entryProgress;
        alpha = selectionProgress * baseAlpha * entryProgress;
    } else if (isHovered) {
        let baseSize = map(volcano.impact, 5, 15, 50, 80);
        let baseAlpha = map(volcano.impact, 5, 15, 60, 90);
        glowSize = hoverProgress * baseSize * entryProgress;
        alpha = hoverProgress * baseAlpha * entryProgress;
    } else {
        return; // non dovrebbe succedere
    }

    fill(255, 43, 0, alpha);
    noStroke();
    circle(x, y, glowSize);
}

// FUNZIONE: Disegna le etichette dei continenti (SENZA cerchietto, posizione originale fuori dal cerchio)
// FUNZIONE: Disegna le etichette dei continenti
function drawContinentLabels() {
    CONTINENTS.forEach(cont => {
        const angles = state.continentAngles[cont];
        if (!angles) return;

        const angle = angles.mid;
        
        let r;
        if (cont === 'Europa' || cont === 'Asia') {
            r = CONFIG.layout.maxRadius + CONFIG.layout.europeAsiaOffset;
        } else {
            r = CONFIG.layout.maxRadius + CONFIG.layout.continentLabelOffset;
        }
        
        const x = state.centerX + cos(angle) * r;
        const y = state.centerY + sin(angle) * r;
        
        if (cont === 'Asia') {
            state.asiaLabelY = y;
        }

        fill(CONFIG.colors.text);
        noStroke();
        textSize(14);
        
        // Allineamento orizzontale in base alla posizione angolare
        let horizAlign = LEFT;
        if (cos(angle) < -0.1) { // Se è sul lato sinistro (coseno negativo)
            horizAlign = RIGHT;
        } else if (cos(angle) > 0.1) { // Se è sul lato destro (coseno positivo)
            horizAlign = LEFT;
        } else { // Se è circa in alto o in basso (coseno ~0)
            horizAlign = CENTER;
        }
        
        // Allineamento verticale in base alla posizione angolare
        let vertAlign = CENTER;
        if (sin(angle) < -0.1) { // Se è nella parte superiore (sin negativo, perché in p5.js l'asse Y va verso il basso)
            vertAlign = BOTTOM;
        } else if (sin(angle) > 0.1) { // Se è nella parte inferiore (sin positivo)
            vertAlign = TOP;
        } else {
            vertAlign = CENTER;
        }
        
        textAlign(horizAlign, vertAlign);
        text(cont, x, y);
    });
}

// FUNZIONE: Controlla hover sui vulcani
function checkHover() {
    if (state.filteredData.length === 0) {
        state.hoveredVolcano = null;
    } else {
        let newHovered = null;
        let minDist = Infinity;
        
        state.filteredData.forEach(v => {
            const angles = state.continentAngles[v.continent];
            if (!angles) return;

            const key = `${v.name}-${v.year}-${v.deaths}`;
            const angle = state.volcanoPositions.get(key) || angles.mid;
            const r = getRadiusForImpact(v.impact);
            const x = state.centerX + cos(angle) * r;
            const y = state.centerY + sin(angle) * r;

            const d = dist(mouseX, mouseY, x, y);
            if (d < 15 && d < minDist) {
                minDist = d;
                newHovered = v;
            }
        });
        
        state.hoveredVolcano = newHovered;
    }
}

// MODIFICATA: Gestisce il click del mouse
function mousePressed() {
    // Controllo pulsante Start Animation
    if (state.startButtonArea &&
        mouseX > state.startButtonArea.x &&
        mouseX < state.startButtonArea.x + state.startButtonArea.width &&
        mouseY > state.startButtonArea.y &&
        mouseY < state.startButtonArea.y + state.startButtonArea.height) {
        
        state.isPlaying = !state.isPlaying;
        
        if (state.isPlaying && state.availableYears.length > 0) {
            state.animationSpeed = TIMELINE_ANIMATION_SPEED_FAST; // MODIFICATO: usa velocità più lenta
            state.animationTimer = 0;
            state.isPausedBetweenCycles = false;
            
            // MODIFICATO: usa animazioni veloci per i dots
            state.useFastAnimations = true;
            startFastDotAnimations();
            
            state.disableDotEntryAnimation = true;
            
            // Attiva l'anno solo se non è già attivo
            if (!state.yearActivatedByUser) {
                state.yearActivatedByUser = true;
                state.currentYearIndex = 0;
                state.timelineYear = state.availableYears[0];
                state.displayedYear = state.availableYears[0];
            }
        } else if (state.availableYears.length === 0) {
            state.isPlaying = false;
        } else {
            // MODIFICATO: torna a velocità normale e animazioni normali
            state.animationSpeed = TIMELINE_ANIMATION_SPEED_NORMAL;
            state.useFastAnimations = false;
            state.disableDotEntryAnimation = false;
            
            state.dotAnimationStart = millis();
            state.dotAnimationProgress = 0;
            
            state.dotAppearTimes.clear();
            state.filteredData.forEach(v => {
                let key = `${v.name}-${v.year}-${v.deaths}`;
                const randomDelay = Math.random() * CONFIG.animation.randomDelayMax;
                state.dotAppearTimes.set(key, randomDelay);
            });
        }
        return;
    }

    // Controllo frecce sinistre del time frame
    if (state.timeFrameLeftArrows &&
        mouseX > state.timeFrameLeftArrows.x &&
        mouseX < state.timeFrameLeftArrows.x + state.timeFrameLeftArrows.width &&
        mouseY > state.timeFrameLeftArrows.y &&
        mouseY < state.timeFrameLeftArrows.y + state.timeFrameLeftArrows.height) {
        
        if (state.selectedCentury === null) {
            // Se siamo in "all centuries", vai all'ultimo periodo
            state.selectedCentury = CONCENTRIC_YEARS[CONCENTRIC_YEARS.length - 2];
        } else {
            const currentIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
            if (currentIndex > 0) {
                // Vai al periodo precedente
                state.selectedCentury = CONCENTRIC_YEARS[currentIndex - 1];
            } else if (currentIndex === 0) {
                // Torna a "all centuries"
                state.selectedCentury = null;
            }
        }
        applyFilters();
        return;
    }

    // Controllo frecce destre del time frame
    if (state.timeFrameRightArrows &&
        mouseX > state.timeFrameRightArrows.x &&
        mouseX < state.timeFrameRightArrows.x + state.timeFrameRightArrows.width &&
        mouseY > state.timeFrameRightArrows.y &&
        mouseY < state.timeFrameRightArrows.y + state.timeFrameRightArrows.height) {
        
        if (state.selectedCentury === null) {
            // Se siamo in "all centuries", vai al primo periodo
            state.selectedCentury = CONCENTRIC_YEARS[0];
        } else {
            const currentIndex = CONCENTRIC_YEARS.indexOf(state.selectedCentury);
            if (currentIndex < CONCENTRIC_YEARS.length - 2) {
                // Vai al periodo successivo
                state.selectedCentury = CONCENTRIC_YEARS[currentIndex + 1];
            } else if (currentIndex === CONCENTRIC_YEARS.length - 2) {
                // Torna a "all centuries"
                state.selectedCentury = null;
            }
        }
        applyFilters();
        return;
    }

    // Controllo freccia sinistra anno
    if (state.yearLeftArrow &&
        mouseX > state.yearLeftArrow.x &&
        mouseX < state.yearLeftArrow.x + state.yearLeftArrow.width &&
        mouseY > state.yearLeftArrow.y &&
        mouseY < state.yearLeftArrow.y + state.yearLeftArrow.height &&
        state.availableYears.length > 0) {
        
        // Attiva l'anno (prima interazione utente)
        state.yearActivatedByUser = true;
        state.isPlaying = false; // Ferma l'animazione se era attiva
        state.animationSpeed = TIMELINE_ANIMATION_SPEED_NORMAL; // MODIFICATO: velocità normale
        state.useFastAnimations = false; // MODIFICATO: animazioni normali
        state.disableDotEntryAnimation = false; // MODIFICATO: riabilita animazione dots
        
        if (state.timelineYear === null) {
            // Se non c'è un anno attivato, vai all'ultimo
            state.currentYearIndex = state.availableYears.length - 1;
        } else {
            // Trova l'indice corrente
            const currentIndex = state.availableYears.indexOf(state.timelineYear);
            if (currentIndex > 0) {
                state.currentYearIndex = currentIndex - 1;
            } else if (currentIndex === 0) {
                // Se siamo al primo anno, vai all'ultimo
                state.currentYearIndex = state.availableYears.length - 1;
            }
        }
        
        state.timelineYear = state.availableYears[state.currentYearIndex];
        state.displayedYear = state.availableYears[state.currentYearIndex];
        return;
    }

    // Controllo freccia destra anno
    if (state.yearRightArrow &&
        mouseX > state.yearRightArrow.x &&
        mouseX < state.yearRightArrow.x + state.yearRightArrow.width &&
        mouseY > state.yearRightArrow.y &&
        mouseY < state.yearRightArrow.y + state.yearRightArrow.height &&
        state.availableYears.length > 0) {
        
        // Attiva l'anno (prima interazione utente)
        state.yearActivatedByUser = true;
        state.isPlaying = false; // Ferma l'animazione se era attiva
        state.animationSpeed = TIMELINE_ANIMATION_SPEED_NORMAL; // MODIFICATO: velocità normale
        state.useFastAnimations = false; // MODIFICATO: animazioni normali
        state.disableDotEntryAnimation = false; // MODIFICATO: riabilita animazione dots
        
        if (state.timelineYear === null) {
            // Se non c'è un anno attivato, vai al primo
            state.currentYearIndex = 0;
        } else {
            // Trova l'indice corrente
            const currentIndex = state.availableYears.indexOf(state.timelineYear);
            if (currentIndex < state.availableYears.length - 1) {
                state.currentYearIndex = currentIndex + 1;
            } else if (currentIndex === state.availableYears.length - 1) {
                // Se siamo all'ultimo anno, vai al primo
                state.currentYearIndex = 0;
            }
        }
        
        state.timelineYear = state.availableYears[state.currentYearIndex];
        state.displayedYear = state.availableYears[state.currentYearIndex];
        return;
    }
    
    // MODIFICATO: Aggiunto click sul cerchio per attivare animazione a onde
    const d = dist(mouseX, mouseY, state.centerX, state.centerY);
    if (d < CONFIG.layout.maxRadius * 1.5) {
        triggerWaveAnimation();
    }
}

// FUNZIONE: Formatta l'anno in formato esteso
function formatYear(year) {
    return year + (year < 0 ? ' BC' : ' AD');
}

// FUNZIONE: Formatta l'anno in formato abbreviato
function formatYearShort(year) {
    if (year < 0) {
        return Math.abs(year) + ' BC';
    } else {
        return year + ' AD';
    }
}

// FUNZIONE: Gestisce il ridimensionamento della finestra
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateLayout();
}