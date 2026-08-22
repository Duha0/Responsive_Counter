const counter = document.querySelector("#count");
const incBtn = document.querySelector("#inc");
const decBtn = document.querySelector("#dec");
const resetBtn = document.querySelector("#reset");
const msg = document.querySelector("#msg");

let count = 0;

const updateUI = () => {
    counter.innerText = count;
}

incBtn.addEventListener("click", () => {
    count++;
    updateUI();
    logic();
});

decBtn.addEventListener("click", () => {
    count--;
    updateUI();
    logic();
});

resetBtn.addEventListener("click", () => {
    count = 0;
    updateUI();
    logic();
});

const logic = () => {
    if(count === 0){
        msg.innerText = "Min Limit Reached";
        msg.classList.add("show");
        decBtn.disabled = true;
        incBtn.disabled = false;
    }else if(count === 10){
        msg.innerText = "Max Limit Reached";
        msg.classList.add("show");
        decBtn.disabled = false;
        incBtn.disabled = true;
    }else{
        msg.classList.remove("show");
        decBtn.disabled = false;
        incBtn.disabled = false;
    }
}