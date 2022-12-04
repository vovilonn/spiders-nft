let maxMintCount = 3;

var productCounter = {
    count: 1,
    incrementCounter: function () {
        if (this.count < maxMintCount) {
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

setInterval(() => {
    refreshTimer();
}, 1000);

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

const contractAddress = "0x0B70B0Fc3102fA4719EF1C73F5D2A0734D4D2331";
const rpcUrl = "https://eth-goerli.public.blastapi.io";
const chainId = 5;

const mintBtn = $("#mintBtn");
const isWhitelistedEl = $("#isWhitelisted");
const counterEl = $("#mintCounter");

const contract =
    window.ethereum &&
    new ethers.Contract(contractAddress, getAbi(), new ethers.providers.Web3Provider(window.ethereum).getSigner());
const contractRpc =
    window.ethereum && new ethers.Contract(contractAddress, getAbi(), new ethers.providers.JsonRpcProvider(rpcUrl));

window.ethereum &&
    window.ethereum.on("accountsChanged", async function ([account]) {
        connectWallet();
    });

async function init() {
    const isPrivateSaleActive = await contractRpc.presaleActive();
    const isPublicSaleActive = await contractRpc.publicSaleActive();

    if (isPrivateSaleActive || isPublicSaleActive) {
        return mintBtn.text("CONNECT WALLET");
    }
    mintBtn.text("CHECK WALLET");
}

init();

async function connectWallet() {
    try {
        if (!window?.ethereum?.isMetaMask) {
            return window.open("https://metamask.app.link/dapp/artropods.com/mintPage.html");
        }

        const [account] = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + chainId.toString(16) }],
        });

        const _maxMintCount = await contract.balanceOf(account);
        maxMintCount = 3 - _maxMintCount.toNumber();

        state.connected = true;
        state.address = account;

        const isPrivateSaleActive = await contract.presaleActive();
        const isPublicSaleActive = await contract.publicSaleActive();

        const mintPrice = await contract.mintPrice();

        if (!isPrivateSaleActive && !isPublicSaleActive) {
            hideLoading();
            await refreshWL(account);
            mintBtn.text(splitWallet(account));
        }

        if (isPrivateSaleActive && !isPublicSaleActive) {
            const isWhitelisted = await checkIfWhitelisted(account);
            hideLoading(false);
            $(".countdown").hide();
            if (!isWhitelisted) {
                refreshWL(account);
                return mintBtn.text(splitWallet(account));
            }
            hideLoading(true);
            isWhitelistedEl.css({ color: "#009662" });
            counterEl.css({ display: "flex" });
            mintBtn.text("MINT");
            mintBtn.click(async (e) => {
                if (maxMintCount <= 0) {
                    return alert("You can mint only 3 NFT");
                }
                await contract.preSaleMint(productCounter.count, { value: mintPrice.mul(productCounter.count) });
                alert("After the transaction is completed, NFT will be minted within 3 minutes");
            });
        }

        if (isPublicSaleActive) {
            counterEl.css({ display: "flex" });
            $(".countdown").hide();
            hideLoading(true);
            isWhitelistedEl.css({ color: "#009662" });
            mintBtn.text("MINT");
            mintBtn.click((e) => {
                if (maxMintCount <= 0) {
                    return alert("You can mint only 3 NFT");
                }
                contract.publicSaleMint(productCounter.count, { value: mintPrice.mul(productCounter.count) });
            });
        }
    } catch (err) {
        console.log(err);
    }
}

function hideLoading(countdown = false) {
    $(".loading").hide();
    if (countdown) {
        refreshMintedCounter();
        setInterval(() => {
            refreshMintedCounter();
        }, 50000);
    }
}

async function refreshMintedCounter() {
    try {
        const max = await contract.maxMintSupply();
        const current = await contract.totalSupply();
        $("#mintedCounter").text(`${current}/${max}`);
    } catch (err) {
        console.log(err);
    }
}

function splitWallet(address) {
    return address.substring(0, 4) + "..." + address.substring(address.length - 4);
}

async function checkIfWhitelisted(address) {
    const res = await fetch(`https://api-gravediggers.defilab.space/check-with-statistic/${address.toUpperCase()}`);
    return await res.json();
}

async function refreshWL(address) {
    const isWhitelisted = await checkIfWhitelisted(address);
    isWhitelistedEl.html(isWhitelisted ? "You are<br/>whitelisted" : "You are not<br/>whitelisted");
    if (!isWhitelisted) {
        return isWhitelistedEl.css({ color: "red" });
    }
    isWhitelistedEl.css({ color: "#009662" });
}

async function refreshTimer() {
    const { days, hours, minutes, seconds } = getRemainingTime();
    if (seconds < 0) {
        const isPrivateSaleActive = await contractRpc.presaleActive();
        const isPublicSaleActive = await contractRpc.publicSaleActive();
        if (isPrivateSaleActive || isPublicSaleActive) {
            $(".loading").hide();

            return $("#countdown").text("SALE IS ACTIVE");
        }
        return;
    }
    $("#countdown").text(`${days}d ${hours}h ${minutes}m ${seconds}s`);
}

mintBtn.click((e) => {
    connectWallet();
    mintBtn.off("click");
});

function getAbi() {
    return [
        {
            inputs: [{ internalType: "string", name: "_apiUrl", type: "string" }],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        { inputs: [], name: "ApprovalCallerNotOwnerNorApproved", type: "error" },
        { inputs: [], name: "ApprovalQueryForNonexistentToken", type: "error" },
        { inputs: [], name: "BalanceQueryForZeroAddress", type: "error" },
        { inputs: [], name: "MintERC2309QuantityExceedsLimit", type: "error" },
        { inputs: [], name: "MintToZeroAddress", type: "error" },
        { inputs: [], name: "MintZeroQuantity", type: "error" },
        { inputs: [], name: "OwnerQueryForNonexistentToken", type: "error" },
        { inputs: [], name: "OwnershipNotInitializedForExtraData", type: "error" },
        { inputs: [], name: "TransferCallerNotOwnerNorApproved", type: "error" },
        { inputs: [], name: "TransferFromIncorrectOwner", type: "error" },
        { inputs: [], name: "TransferToNonERC721ReceiverImplementer", type: "error" },
        { inputs: [], name: "TransferToZeroAddress", type: "error" },
        { inputs: [], name: "URIQueryForNonexistentToken", type: "error" },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "address", name: "owner", type: "address" },
                { indexed: true, internalType: "address", name: "approved", type: "address" },
                { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "Approval",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "address", name: "owner", type: "address" },
                { indexed: true, internalType: "address", name: "operator", type: "address" },
                { indexed: false, internalType: "bool", name: "approved", type: "bool" },
            ],
            name: "ApprovalForAll",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [{ indexed: true, internalType: "bytes32", name: "id", type: "bytes32" }],
            name: "ChainlinkCancelled",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [{ indexed: true, internalType: "bytes32", name: "id", type: "bytes32" }],
            name: "ChainlinkFulfilled",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [{ indexed: true, internalType: "bytes32", name: "id", type: "bytes32" }],
            name: "ChainlinkRequested",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "uint256", name: "fromTokenId", type: "uint256" },
                { indexed: false, internalType: "uint256", name: "toTokenId", type: "uint256" },
                { indexed: true, internalType: "address", name: "from", type: "address" },
                { indexed: true, internalType: "address", name: "to", type: "address" },
            ],
            name: "ConsecutiveTransfer",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
                { indexed: true, internalType: "address", name: "newOwner", type: "address" },
            ],
            name: "OwnershipTransferred",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "address", name: "from", type: "address" },
                { indexed: true, internalType: "address", name: "to", type: "address" },
                { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "Transfer",
            type: "event",
        },
        {
            inputs: [
                { internalType: "bytes32", name: "_requestId", type: "bytes32" },
                { internalType: "bool", name: "_isWhitelisted", type: "bool" },
            ],
            name: "_chainlinkMint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "apiUrl",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "approve",
            outputs: [],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "baseURI",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "_supply", type: "uint256" }],
            name: "changeMaxSupply",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            name: "getApproved",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getRefundGuaranteeEndTime",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            name: "hasRefunded",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "owner", type: "address" },
                { internalType: "address", name: "operator", type: "address" },
            ],
            name: "isApprovedForAll",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "isRefundGuaranteeActive",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "isReveiled",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "maxMintSupply",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "maxUserMintAmount",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "mintPrice",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "name",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "_address", type: "address" }],
            name: "numberMinted",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "owner",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            name: "ownerOf",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
            name: "preSaleMint",
            outputs: [{ internalType: "bytes32", name: "requestId", type: "bytes32" }],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [],
            name: "presaleActive",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "publicSaleActive",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
            name: "publicSaleMint",
            outputs: [],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256[]", name: "tokenIds", type: "uint256[]" }],
            name: "refund",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "refundAddress",
            outputs: [{ internalType: "address", name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "refundAmount",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "refundEndTime",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "refundPeriod",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
            inputs: [],
            name: "response",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "from", type: "address" },
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "safeTransferFrom",
            outputs: [],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "from", type: "address" },
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "tokenId", type: "uint256" },
                { internalType: "bytes", name: "_data", type: "bytes" },
            ],
            name: "safeTransferFrom",
            outputs: [],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [{ internalType: "string", name: "uri", type: "string" }],
            name: "serUnreveiledUri",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "operator", type: "address" },
                { internalType: "bool", name: "approved", type: "bool" },
            ],
            name: "setApprovalForAll",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "string", name: "uri", type: "string" }],
            name: "setBaseURI",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "_refundAddress", type: "address" }],
            name: "setRefundAddress",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
            name: "supportsInterface",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "symbol",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
        },
        { inputs: [], name: "togglePresaleStatus", outputs: [], stateMutability: "nonpayable", type: "function" },
        { inputs: [], name: "togglePublicSaleStatus", outputs: [], stateMutability: "nonpayable", type: "function" },
        { inputs: [], name: "toggleRefundCountdown", outputs: [], stateMutability: "nonpayable", type: "function" },
        { inputs: [], name: "toggleReveil", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
            inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            name: "tokenURI",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "totalSupply",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "from", type: "address" },
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "transferFrom",
            outputs: [],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
            name: "transferOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [],
            name: "unreveiledUri",
            outputs: [{ internalType: "string", name: "", type: "string" }],
            stateMutability: "view",
            type: "function",
        },
        { inputs: [], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
    ];
}
