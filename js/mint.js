var productCounter = {
    count: 0,
    incrementCounter: function () {
        if (this.count < 3) {
            return (this.count = this.count + 1);
        }
        return this.count;
    },
    decrementCounter: function () {
        if (this.count > 1) {
            return (this.count = this.count - 1);
        }
        return (this.count = 1);
    },
    resetCounter: function () {
        return (this.count = 1);
    },
};

var displayCout = document.getElementById("displayCounter");
displayCout.innerHTML = 1;
document.getElementById("increment").onclick = function () {
    displayCout.innerHTML = productCounter.incrementCounter();
};
document.getElementById("decrement").onclick = function () {
    displayCout.innerHTML = productCounter.decrementCounter();
};

const state = {
    connected: false,
    address: null,
};

const mintBtn = $("#mintBtn");
const isWhitelistedEl = $("#isWhitelisted");

window.ethereum.on("accountsChanged", function ([account]) {
    refreshWL(account);
});

async function connectWallet() {
    try {
        const [account] = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        refreshWL();
        state.connected = true;
        state.address = account;
        mintBtn.text("MINT");
    } catch (err) {
        console.log(err);
    }
}

async function refreshWL(address) {
    const res = await fetch(`https://api-gravediggers.defilab.space/check-with-statistic/${address}`);
    const isWhitelisted = await res.json();
    isWhitelistedEl.text(isWhitelisted ? "You are whitelisted" : "You are not whitelisted");
}

mintBtn.click((e) => {
    connectWallet();
});
