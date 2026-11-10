const countEl = document.querySelector("#count");
const targetInput = document.querySelector("#target");
const speedSelect = document.querySelector("#speed");
const startBtn = document.querySelector("#start");
const pauseBtn = document.querySelector("#pause");
const resumeBtn = document.querySelector("#resume");
const resetBtn = document.querySelector("#reset");
const msgEl = document.querySelector("#msg");
const progressBar = document.querySelector("#progress-bar");

const SPEEDS = {
    slow: 1000,
    normal: 400,
    fast: 120
};

let count = 0;
let target = 10;
let timerId = null;
let status = "idle"; // idle, running, paused, completed

function getSpeedMs() {
    return SPEEDS[speedSelect.value] || SPEEDS.normal;
}

function showMessage(text, type) {
    msgEl.textContent = text;
    msgEl.className = "message show";
    if (type) {
        msgEl.classList.add(type);
    }
}

function clearMessage() {
    msgEl.textContent = "";
    msgEl.className = "message";
}

function updateProgress() {
    const safeTarget = target > 0 ? target : 1;
    const percent = Math.min(100, Math.max(0, (count / safeTarget) * 100));
    progressBar.style.width = percent + "%";
}

function tickAnimation() {
    countEl.classList.remove("tick");
    // Force reflow so the animation can replay on rapid updates.
    void countEl.offsetWidth;
    countEl.classList.add("tick");
}

function updateUI() {
    countEl.textContent = String(count);
    updateProgress();

    const isRunning = status === "running";
    const isPaused = status === "paused";
    const isCompleted = status === "completed";
    const canStart = !isRunning && !isPaused && !isCompleted;

    startBtn.disabled = !canStart;
    pauseBtn.disabled = !isRunning;
    resumeBtn.disabled = !isPaused;
    resetBtn.disabled = false;

    targetInput.disabled = isRunning;
    speedSelect.disabled = false;
}

function stopTimer() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
}

function parseTarget() {
    const value = Number(targetInput.value);
    if (!Number.isInteger(value) || value < 1) {
        return null;
    }
    return value;
}

function validateTarget(showError) {
    const parsed = parseTarget();
    if (parsed === null) {
        if (showError) {
            showMessage("Enter a positive whole number for the target.", "error");
        }
        return false;
    }
    target = parsed;
    return true;
}

function completeCounting() {
    stopTimer();
    count = target;
    status = "completed";
    tickAnimation();
    updateUI();
    showMessage("Target reached! Counting complete.", "success");
}

function tick() {
    if (count >= target) {
        completeCounting();
        return;
    }

    count += 1;
    tickAnimation();
    updateUI();

    if (count >= target) {
        completeCounting();
    }
}

function startTimer() {
    stopTimer();
    timerId = setInterval(tick, getSpeedMs());
}

function startCounting() {
    if (status === "running" || status === "paused") {
        return;
    }

    if (!validateTarget(true)) {
        return;
    }

    if (count >= target) {
        completeCounting();
        return;
    }

    clearMessage();
    status = "running";
    updateUI();
    startTimer();
}

function pauseCounting() {
    if (status !== "running") {
        return;
    }
    stopTimer();
    status = "paused";
    updateUI();
    showMessage("Counting paused.", "");
}

function resumeCounting() {
    if (status !== "paused") {
        return;
    }
    if (!validateTarget(true)) {
        return;
    }
    if (count >= target) {
        completeCounting();
        return;
    }
    clearMessage();
    status = "running";
    updateUI();
    startTimer();
}

function resetCounting() {
    stopTimer();
    count = 0;
    status = "idle";
    if (validateTarget(false)) {
        // keep validated target
    }
    clearMessage();
    updateUI();
}

function handleTargetChange() {
    if (status === "running") {
        stopTimer();
        status = "paused";
        showMessage("Target changed. Counting paused for safety.", "");
    }

    if (validateTarget(false)) {
        if (count > target) {
            count = target;
        }
        if (status === "completed" && count < target) {
            status = "idle";
            clearMessage();
        } else if (status !== "running" && status !== "paused" && count >= target && target > 0) {
            status = "completed";
            showMessage("Target reached! Counting complete.", "success");
        }
    } else if (status !== "running") {
        // Invalid target while idle/paused/completed: keep state but show error on blur-like commit handled below.
    }

    updateUI();
}

function handleSpeedChange() {
    if (status === "running") {
        startTimer();
    }
}

startBtn.addEventListener("click", startCounting);
pauseBtn.addEventListener("click", pauseCounting);
resumeBtn.addEventListener("click", resumeCounting);
resetBtn.addEventListener("click", resetCounting);

targetInput.addEventListener("input", handleTargetChange);
targetInput.addEventListener("change", function () {
    if (!validateTarget(true)) {
        updateUI();
    }
});

speedSelect.addEventListener("change", handleSpeedChange);

window.addEventListener("beforeunload", stopTimer);

// Initial state
validateTarget(false);
updateUI();
updateProgress();
