/***********************************
 * Objects
 * ***********************************/
class Upgrade {
    constructor(startingCost, growthFactor) {
        this.cost = startingCost;
        this.currentLevel = 1;
        this.growthFactor = growthFactor;
    }

    buy(game) {
        if (game.money >= this.cost) {
            game.money -= this.cost;
            this.cost *= this.growthFactor;
            this.currentLevel++;
            this.effect();
            return true;
        }
        return false;
    }

    effect(){
        throw new Error("Not implemented");
    }
}

class AutoCardMachines extends Upgrade {
    constructor(){
        super(100, 1.15);
        this.count = 0;
    }

    effect(){
        this.count++;
    }
}

class ManualProduction extends Upgrade{
    constructor(){
        super(50, 1.5);
        this.manualProductionRate = 1;
    }

    effect(){
        this.manualProductionRate += 1;
    }
}

class MachineProduction extends Upgrade {
    constructor(){
        super(200, 1.7);
        this.autoProductionRate = 0.1;
        this.autoProducers = new AutoCardMachines();
    }

    get totalProduction() {
        return this.autoProductionRate * this.autoProducers.count;
    }

    effect() {
        this.autoProductionRate += 0.1;
    }

    produce() {
        return this.totalProduction;
    }
}

class Game {
    constructor() {
        this.gifts = 0;
        this.total_gifts = 0;
        this.manualProduction = new ManualProduction();
        this.autoProduction = new MachineProduction();
        this.money = 0.00;
        this.giftPrice = 1.00;
        this.demand = 1.0;
        this.demandTimer = 0;
        this.isMusicPlaying = false;
    }

    save() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this));
        console.log("Game saved!");
    }

    load() {
        const savedState = localStorage.getItem(SAVE_KEY);
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.gifts = gameState.gifts || 0;
            this.total_gifts = gameState.total_gifts || 0;
            this.money = gameState.money || 0.00;
            this.giftPrice = gameState.giftPrice || 1.00;
            this.demand = gameState.demand || 1.0;
            this.demandTimer = gameState.demandTimer || 0;

            // Re-instantiate classes to restore methods
            if (gameState.manualProduction) {
                this.manualProduction = new ManualProduction();
                Object.assign(this.manualProduction, gameState.manualProduction);
            }
            if (gameState.autoProduction) {
                this.autoProduction = new MachineProduction();
                Object.assign(this.autoProduction, gameState.autoProduction);

                // Also re-instantiate nested objects
                if (gameState.autoProduction.autoProducers) {
                    this.autoProduction.autoProducers = new AutoCardMachines();
                    Object.assign(this.autoProduction.autoProducers, gameState.autoProduction.autoProducers);
                }
            }

            console.log("Game loaded!");
            return true; // Indicate that a save was loaded
        }
        console.log("No saved game found.");
        return false; // Indicate no save was found
    }

    update() {
        // Automated Production: Add gifts based on auto producers and their rate
        const autoProduction = this.autoProduction.produce();
        this.gifts += autoProduction;
        this.total_gifts += autoProduction;

        // Demand Fluctuation: Update demand and price every DEMAND_CYCLE_DURATION seconds
        this.demandTimer++;
        if (this.demandTimer % DEMAND_CYCLE_DURATION === 0) {
            // Demand fluctuates randomly between 0.5 and 1.5
            this.demand = 0.5 + Math.random();
            // Price also fluctuates based on demand to create a dynamic market
            this.giftPrice = 0.5 + this.demand * 0.7; // Base price of 0.5 + demand influence
        }
    }

    produceGifts(){
        this.gifts += this.manualProduction.manualProductionRate;
        this.total_gifts += this.manualProduction.manualProductionRate;
        this.save(); // Save the game after every interaction
    }

    sellGifts(){
        const giftsToSell = Math.floor(this.gifts * this.demand); // Sell gifts based on demand
        this.money += giftsToSell * this.giftPrice;
        this.gifts -= giftsToSell;
        if (this.gifts < 0) this.gifts = 0; // Ensure gifts doesn't go negative
        this.save(); // Save game after selling
    }

    purchaseAutomatedMachines() {
        this.autoProduction.autoProducers.buy(this);
    }

    upgradeManualEfficiency(){
        this.manualProduction.buy(this);
    }

    upgradeMachineEfficiency() {
        this.autoProduction.buy(this);
    }

    toggleMusic(){
        if (this.isMusicPlaying) {
            backgroundMusic.pause();
            this.isMusicPlaying = false;
            toggleMusicBtn.textContent = 'Play Song';
        } else {
            // Autoplay policy: Browsers require a user gesture to play media.
            // We attempt to play here, but it might be blocked if not initiated by the user.
            backgroundMusic.play().then(() => {
                this.isMusicPlaying = true;
                toggleMusicBtn.textContent = 'Pause Song';
            }).catch(error => {
                console.error("Autoplay prevented:", error);
                // Inform the user or handle the error, e.g., show a message
            });
        }
    }
}

/***********************************
 * Global variables
 ***********************************/
const DEMAND_CYCLE_DURATION = 30;  // seconds for demand fluctuation
const SAVE_KEY = 'bonneFeteCardTycoonSave'; // Unique key for this game save data
const GAME = new Game();

/***********************************
 * DOM elements
 ***********************************/
const giftsDisplay = document.getElementById('giftsDisplay');
const moneyDisplay = document.getElementById('moneyDisplay');
const giftPriceDisplay = document.getElementById('giftPriceDisplay');
const autoProducersDisplay = document.getElementById('autoProducersDisplay');
const produceGiftBtn = document.getElementById('produceGiftBtn');
const sellGiftsBtn = document.getElementById('sellGiftsBtn');
const buyAutoProducerBtn = document.getElementById('buyAutoProducerBtn');
const autoProducerCostDisplay = document.getElementById('autoProducerCostDisplay');
const tooltipAutoProducerCost = document.getElementById('tooltipAutoProducerCost');

const statsTotalCards = document.getElementById('total_gifts');

const upgradeManualBtn = document.getElementById('upgradeManualBtn');
const manualUpgradeCostDisplay = document.getElementById('manualUpgradeCostDisplay');
const tooltipManualUpgradeCost = document.getElementById('tooltipManualUpgradeCost');
const manualUpgradeLevelDisplay = document.getElementById('manualUpgradeLevelDisplay');

const upgradeAutoRateBtn = document.getElementById('upgradeAutoRateBtn');
const autoRateUpgradeCostDisplay = document.getElementById('autoRateUpgradeCostDisplay');
const tooltipAutoRateUpgradeCost = document.getElementById('tooltipAutoRateUpgradeCost');
const autoUpgradeLevelDisplay = document.getElementById('autoUpgradeLevelDisplay');
const autoProductionRateDisplay = document.getElementById('autoProducersProduction');

const demandProgressBar = document.getElementById('demandProgressBar');
const demandStatus = document.getElementById('demandStatus');
const toggleMusicBtn = document.getElementById('toggleMusicBtn');
const backgroundMusic = document.getElementById('backgroundMusic'); // Audio element


/***********************************
 * UI-related functions
 ***********************************/
function updateDisplay() {
    giftsDisplay.textContent = Math.floor(GAME.gifts).toString();
    moneyDisplay.textContent = `${GAME.money.toFixed(2)}F`; // Changed to display with 'F'
    giftPriceDisplay.textContent = `${GAME.giftPrice.toFixed(2)}F`; // Changed to display with 'F'
    autoProducersDisplay.textContent = GAME.autoProduction.autoProducers.count;

    // Update upgrade costs on display and tooltips
    // Automated Card Machine
    autoProducerCostDisplay.textContent = `${GAME.autoProduction.autoProducers.cost.toFixed(2)}F`; // Changed to display with 'F'
    tooltipAutoProducerCost.textContent = `${GAME.autoProduction.autoProducers.cost.toFixed(2)}F`; // Changed to display with 'F'
    // Manual Efficiency Upgrade
    manualUpgradeCostDisplay.textContent = `${GAME.manualProduction.cost.toFixed(2)}F`; // Changed to display with 'F'
    tooltipManualUpgradeCost.textContent = `${GAME.manualProduction.cost.toFixed(2)}F`; // Changed to display with 'F'
    manualUpgradeLevelDisplay.textContent = GAME.manualProduction.currentLevel;
    // Automated Machine Efficiency
    autoRateUpgradeCostDisplay.textContent = `${GAME.autoProduction.cost.toFixed(2)}F`; // Changed to display with 'F'
    tooltipAutoRateUpgradeCost.textContent = `${GAME.autoProduction.cost.toFixed(2)}F`; // Changed to display with 'F'
    autoUpgradeLevelDisplay.textContent = GAME.autoProduction.currentLevel;
    autoProductionRateDisplay.textContent = `${GAME.autoProduction.totalProduction.toFixed(2)}/sec`;

    // Update statistics
    statsTotalCards.textContent = Math.floor(GAME.total_gifts);

    // Disable buttons if not enough money or no gifts to sell
    buyAutoProducerBtn.disabled = GAME.money < GAME.autoProduction.autoProducers.cost;
    upgradeManualBtn.disabled = GAME.money < GAME.manualProduction.cost;
    upgradeAutoRateBtn.disabled = GAME.money < GAME.autoProduction.cost;
    sellGiftsBtn.disabled = GAME.gifts === 0;

    // Update demand display and progress bar color
    let demandPercentage = (GAME.demand + 0.5) / 1.5 * 100; // Normalize demand from 0.5-1.5 to 0-100%
    // Clamp the percentage to a maximum of 100% to prevent overflow
    demandProgressBar.style.width = `${Math.min(demandPercentage, 100)}%`;

    if (GAME.demand > 1.2) {
        demandStatus.textContent = 'Demand: Very High';
        demandProgressBar.style.backgroundColor = '#4CAF50'; // Green
    } else if (GAME.demand > 0.8) {
        demandStatus.textContent = 'Demand: Moderate';
        demandProgressBar.style.backgroundColor = '#2196F3'; // Blue
    } else {
        demandStatus.textContent = 'Demand: Low';
        demandProgressBar.style.backgroundColor = '#F44336'; // Red
    }
}

/**
 * Handles click on the "Produce a Card" button
 */
produceGiftBtn.addEventListener('click', () => {
    GAME.produceGifts();
    updateDisplay();
});

/**
 * Handles click on the "Sell All Cards" button
 */
sellGiftsBtn.addEventListener('click', () => {
   GAME.sellGifts();
    updateDisplay();
});

/**
 * Handles purchase of Automated Card Machines
 */
buyAutoProducerBtn.addEventListener('click', () => {
   GAME.purchaseAutomatedMachines();
   updateDisplay();
});

/**
 * Handles upgrades to the Manual Efficiency
 */
upgradeManualBtn.addEventListener('click', () => {
   GAME.upgradeManualEfficiency();
   updateDisplay();
});

/**
 * Handles upgrades to the Automated Machine Efficiency
 */
upgradeAutoRateBtn.addEventListener('click', () => {
   GAME.upgradeMachineEfficiency();
   updateDisplay();
});

// Event listener for the music toggle button
toggleMusicBtn.addEventListener('click', () => {
    GAME.toggleMusic();
});


/***********************************
 * Entry point
 ***********************************/
// Initialize the game when the window loads
window.onload = function() {
    // Try to load a saved game; if none exists, set initial money
    if (!GAME.load()) {
        GAME.money = 100.00; // Initial money for new games
    }

    updateDisplay(GAME); // Update UI with initial or loaded values

    // Run gameLoop every second
    setInterval(() => {
        GAME.update();
        updateDisplay();
    }, 1000);

    // Save game every 30 seconds
    setInterval(() => {
        GAME.save();
    }, 30000);
};