// 1. SELECT HTML ELEMENTS

// Blackboard and wiper
const board = document.getElementById("blackboard");
const wiper = document.getElementById("wiper");
// Monitoring elements
const robotStatus = document.getElementById("robotStatus");
const statusValue = document.getElementById("statusValue");
const progressValue = document.getElementById("progressValue");
const positionValue = document.getElementById("positionValue");
// Limit switch elements
const leftSwitch = document.getElementById("leftSwitch");
const rightSwitch = document.getElementById("rightSwitch");
// Cleaning history
const historyList = document.getElementById("historyList");
// Buttons
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// 2. ROBOT VARIABLES

let position = 0;
let progress = 0;
let direction = 1;
let speed = 5;
let isRunning = false;
let isPaused = false;
let movementTimer = null;
let movementMode = "Idle";

// 3. UPDATE DASHBOARD

function updateDashboard(){
    // Move the wiper to its current position
    wiper.style.left = position + "px";
    // Update cleaning progress
    progressValue.textContent = Math.round(progress) + "%";
    // Update robot status
    statusValue.textContent = movementMode;
    robotStatus.textContent = movementMode;
    // Update wiper position
    if(position <= 0){
        positionValue.textContent = "Left";
    }
    else if(position >= getMaxPosition()){
        positionValue.textContent = "Right";
    }
    else{
        positionValue.textContent = "Moving";
    }
    // Update limit switches
    leftSwitch.textContent = position <= 0 ? "Active" : "Inactive";
    rightSwitch.textContent = position >= getMaxPosition() ? "Active" : "Inactive";
}

// 4. GET MAXIMUM POSITION

function getMaxPosition(){
    return board.clientWidth - wiper.offsetWidth;
}

// 5. CLEANING HISTORY

function addHistory(message){
    const item = document.createElement("li");
    const time = new Date().toLocaleTimeString();
    item.textContent = time + " - " + message;
    historyList.prepend(item);
}

// 6. AUTOMATIC CLEANING

function startCleaning(){
    // Prevent duplicate timers
    if(isRunning){
        return;
    }
    clearInterval(movementTimer);
    movementTimer = null;
    // Check if cleaning is already complete
    if(progress >= 100){
        progress = 0;
        position = 0;
        direction = 1;
    }
    isRunning = true;
    isPaused = false;
    movementMode = "Cleaning";
    pauseBtn.textContent = "⏸ Pause";
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    addHistory("Automatic cleaning started");
    // Repeat movement every 30 milliseconds
    movementTimer = setInterval(function (){
        // Do nothing when paused
        if(isPaused){
            return;
        }
        // Calculate the right boundary
        const maxPosition = getMaxPosition();
        // Move the wiper
        position += direction * speed;
        // Check right limit
        if(position >= maxPosition){
            position = maxPosition;
            direction = -1;
            progress = Math.min(100, progress + 10);
            addHistory("Right limit reached - reversing");
        }
        // Check left limit
        else if(position <= 0){
            position = 0;
            direction = 1;
            addHistory("Left limit reached - reversing");
        }
        // Update the dashboard
        updateDashboard();
        // Check completion
        if(progress >= 100){
            finishCleaning();
        }
    }, 30);
}

// 7. FINISH CLEANING

function finishCleaning(){
    clearInterval(movementTimer);
    movementTimer = null;
    isRunning = false;
    isPaused = false;
    movementMode = "Completed";
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = "⏸ Pause";
    updateDashboard();
    addHistory("Cleaning completed successfully");
}
// PAUSE AND RESUME
function pauseCleaning(){
    if(!isRunning){
        return;
    }
    isPaused = !isPaused;
    if(isPaused){
        movementMode = "Paused";
        pauseBtn.textContent = "▶ Resume";
        addHistory("Cleaning paused");
    }
    else{
        movementMode = "Cleaning";
        pauseBtn.textContent = "⏸ Pause";
        addHistory("Cleaning resumed");
    }
    updateDashboard();
}
// STOP CLEANING
function stopCleaning(){
    clearInterval(movementTimer);
    movementTimer = null;
    isRunning = false;
    isPaused = false;
    movementMode = "Stopped";
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = "⏸ Pause";
    updateDashboard();
    addHistory("Cleaning stopped by user");
}
// RESET ROBOT
function resetRobot(){
    clearInterval(movementTimer);
    movementTimer = null;
    isRunning = false;
    isPaused = false;
    position = 0;
    progress = 0;
    direction = 1;
    movementMode = "Ready";
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = "⏸ Pause";
    updateDashboard();
    addHistory("Robot reset successfully");
}

// 8. MANUAL MOVEMENT

function manualMovement(moveDirection){
    // Stop automatic movement first
    clearInterval(movementTimer);
    movementTimer = null;
    isRunning = false;
    isPaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = false;
    direction = moveDirection;
    movementMode = "Manual";
    addHistory("Manual movement started");
    movementTimer = setInterval(function (){
        position += direction * speed;
        const maxPosition = getMaxPosition();
        // Stop at left boundary
        if(position <= 0){
            position = 0;
            clearInterval(movementTimer);
            movementTimer = null;
            movementMode = "Ready";
            stopBtn.disabled = true;
            addHistory("Left limit reached");
        }
        // Stop at right boundary
        else if(position >= maxPosition){
            position = maxPosition;
            clearInterval(movementTimer);
            movementTimer = null;
            movementMode = "Ready";
            stopBtn.disabled = true;
            addHistory("Right limit reached");
        }
        updateDashboard();
    }, 30);
}

// 9. BUTTON EVENT LISTENERS

// Automatic controls
startBtn.addEventListener("click", startCleaning);
pauseBtn.addEventListener("click", pauseCleaning);
stopBtn.addEventListener("click", stopCleaning);
resetBtn.addEventListener("click", resetRobot);
// Manual controls
leftBtn.addEventListener("click", function (){
    manualMovement(-1);
});
rightBtn.addEventListener("click", function (){
    manualMovement(1);
});

// 10. INITIAL DASHBOARD STATE

pauseBtn.disabled = true;
stopBtn.disabled = true;
updateDashboard();
addHistory("System initialized - Ready");