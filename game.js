/***********************************
 * Global variables
 ***********************************/
const DEMAND_CYCLE_DURATION = 30;  // seconds for demand fluctuation
const SAVE_KEY = 'bonneFeteCardTycoonSave'; // Unique key for this game save data
const GAME = new Game();

/***********************************
 * Objects
 * ***********************************/
class Game {
    constructor() {
        this.gifts = 0;
        this.total_gifts = 0;
        this.money = 0.00;
        this.giftPrice = 1.00;
        this.manualProductionRate = 1;
        this.autoProducers = 0;
        this.autoProductionRate = 0.1;
        this.autoProducerCost = 100;
        this.manualUpgradeCost = 50;
        this.autoRateUpgradeCost = 200;
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
            this.manualProductionRate = gameState.manualProductionRate || 1;
            this.autoProducers = gameState.autoProducers || 0;
            this.autoProductionRate = gameState.autoProductionRate || 0.1;
            this.autoProducerCost = gameState.autoProducerCost || 100;
            this.manualUpgradeCost = gameState.manualUpgradeCost || 50;
            this.autoRateUpgradeCost = gameState.autoRateUpgradeCost || 200;
            this.demand = gameState.demand || 1.0;
            this.demandTimer = gameState.demandTimer || 0;
            console.log("Game loaded!");
            return true; // Indicate that a save was loaded
        }
        console.log("No saved game found.");
        return false; // Indicate no save was found
    }

    update() {
        // Automated Production: Add gifts based on auto producers and their rate
        this.gifts += this.autoProducers * this.autoProductionRate;
        this.total_gifts += this.autoProducers * this.autoProductionRate;

        // Demand Fluctuation: Update demand and price every DEMAND_CYCLE_DURATION seconds
        this.demandTimer++;
        if (this.demandTimer % DEMAND_CYCLE_DURATION === 0) {
            // Demand fluctuates randomly between 0.5 and 1.5
            this.demand = 0.5 + Math.random();
            // Price also fluctuates based on demand to create a dynamic market
            this.giftPrice = 0.5 + this.demand * 0.7; // Base price of 0.5 + demand influence
        }

        // Save game state in the game loop, less frequently than every interaction
        // This ensures progress is saved even if the user just idles.
        if (this.demandTimer % (DEMAND_CYCLE_DURATION / 2) === 0) { // Save every half-demand cycle
            this.save();
        }
    }

    produceGifts(){
        this.gifts += this.manualProductionRate;
        this.total_gifts += this.manualProductionRate;
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
        if (this.money >= this.autoProducerCost) {
            this.money -= this.autoProducerCost;
            this.autoProducers++;
            this.autoProducerCost *= 1.15; // Increase cost for the next one
            this.save(); // Save game after buying
        }
    }

    upgradeManualEfficiency(){
        if (this.money >= this.manualUpgradeCost) {
            this.money -= this.manualUpgradeCost;
            this.manualProductionRate += 1; // Increase manual production by 1
            this.manualUpgradeCost *= 1.5; // Increase cost for the next upgrade
            this.save(); // Save game after upgrading
        }
    }

    upgradeMachineEfficiency() {
        if (this.money >= this.autoRateUpgradeCost) {
            this.money -= this.autoRateUpgradeCost;
            this.autoProductionRate += 0.1; // Increase auto production rate
            this.autoRateUpgradeCost *= 1.7; // Increase cost for the next upgrade
            this.save(); // Save game after upgrading
        }
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

const upgradeAutoRateBtn = document.getElementById('upgradeAutoRateBtn');
const autoRateUpgradeCostDisplay = document.getElementById('autoRateUpgradeCostDisplay');
const tooltipAutoRateUpgradeCost = document.getElementById('tooltipAutoRateUpgradeCost');

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
    autoProducersDisplay.textContent = GAME.autoProducers;

    // Update upgrade costs on display and tooltips
    autoProducerCostDisplay.textContent = `${GAME.autoProducerCost.toFixed(2)}F`; // Changed to display with 'F'
    tooltipAutoProducerCost.textContent = `${GAME.autoProducerCost.toFixed(2)}F`; // Changed to display with 'F'

    manualUpgradeCostDisplay.textContent = `${GAME.manualUpgradeCost.toFixed(2)}F`; // Changed to display with 'F'
    tooltipManualUpgradeCost.textContent = `${GAME.manualUpgradeCost.toFixed(2)}F`; // Changed to display with 'F'

    autoRateUpgradeCostDisplay.textContent = `${GAME.autoRateUpgradeCost.toFixed(2)}F`; // Changed to display with 'F'
    tooltipAutoRateUpgradeCost.textContent = `${GAME.autoRateUpgradeCost.toFixed(2)}F`; // Changed to display with 'F'

    // Update statistics
    statsTotalCards.textContent = GAME.total_gifts;

    // Disable buttons if not enough money or no gifts to sell
    buyAutoProducerBtn.disabled = GAME.money < GAME.autoProducerCost;
    upgradeManualBtn.disabled = GAME.money < GAME.manualUpgradeCost;
    upgradeAutoRateBtn.disabled = GAME.money < GAME.autoRateUpgradeCost;
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

    // Run gameLoop every 100 milliseconds (10 times per second)
    setInterval(() => {
        GAME.update();
        updateDisplay();
    }, 100);
};