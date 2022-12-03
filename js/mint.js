// var productCounter = {
//     count: 0,
//     incrementCounter: function () {
//         if (this.count < 3) {
//             return (this.count = this.count + 1);
//         }
//         return this.count;
//     },
//     decrementCounter: function () {
//         if (this.count > 1) {
//             return (this.count = this.count - 1);
//         }
//         return (this.count = 1);
//     },
//     resetCounter: function () {
//         return (this.count = 1);
//     },
// };

// var displayCout = document.getElementById("displayCounter");
// displayCout.innerHTML = 1;
// document.getElementById("increment").onclick = function () {
//     displayCout.innerHTML = productCounter.incrementCounter();
// };
// document.getElementById("decrement").onclick = function () {
//     displayCout.innerHTML = productCounter.decrementCounter();
// };

const state = {
    connected: false,
    address: null,
};

const contractAddress = "0x8b6d4a90D6bb1359ebB6bDbd5df0fc32D83696E0";
const chainId = 5;

const mintBtn = $("#mintBtn");
const isWhitelistedEl = $("#isWhitelisted");

const contract =
    window.ethereum &&
    new ethers.Contract(contractAddress, getAbi(), new ethers.providers.Web3Provider(window.ethereum));

window.ethereum &&
    window.ethereum.on("accountsChanged", function ([account]) {
        refreshWL(account);
    });

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
        refreshWL(account);
        state.connected = true;
        state.address = account;
        mintBtn.text(splitWallet(account));
        const isPrivateSaleActive = await contract.isPrivateSaleActive();

        const isPublicSaleActive = await contract.isPublicSaleActive();

        console.log(isPrivateSaleActive, isPublicSaleActive);
        // mintBtn.text("MINT");
    } catch (err) {
        console.log(err);
    }
}

function splitWallet(address) {
    return address.substring(0, 4) + "..." + address.substring(address.length - 4);
}

async function refreshWL(address) {
    const res = await fetch(`https://api-gravediggers.defilab.space/check-with-statistic/${address.toUpperCase()}`);
    const isWhitelisted = await res.json();
    isWhitelistedEl.text(isWhitelisted ? "You are whitelisted" : "You are not whitelisted");
    if (!isWhitelisted) {
        isWhitelistedEl.css({ color: "red" });
    }
}

mintBtn.click((e) => {
    connectWallet();
});

function getAbi() {
    return [
        {
            inputs: [
                { internalType: "string", name: "name_", type: "string" },
                { internalType: "string", name: "symbol_", type: "string" },
                { internalType: "string", name: "apiURL_", type: "string" },
            ],
            stateMutability: "nonpayable",
            type: "constructor",
        },
        { inputs: [], name: "ApprovalCallerNotOwnerNorApproved", type: "error" },
        { inputs: [], name: "ApprovalQueryForNonexistentToken", type: "error" },
        { inputs: [], name: "ApprovalToCurrentOwner", type: "error" },
        { inputs: [], name: "ApproveToCaller", type: "error" },
        { inputs: [], name: "BalanceQueryForZeroAddress", type: "error" },
        { inputs: [], name: "MintToZeroAddress", type: "error" },
        { inputs: [], name: "MintZeroQuantity", type: "error" },
        { inputs: [], name: "OwnerQueryForNonexistentToken", type: "error" },
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
                { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
                { indexed: true, internalType: "address", name: "newOwner", type: "address" },
            ],
            name: "OwnershipTransferred",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "bytes32", name: "requestId", type: "bytes32" },
                { indexed: true, internalType: "bool", name: "boolean", type: "bool" },
            ],
            name: "RequestBoolFulfilled",
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
                { internalType: "bool", name: "_boolean", type: "bool" },
            ],
            name: "_mint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "approve",
            outputs: [],
            stateMutability: "nonpayable",
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
            inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
            name: "getApproved",
            outputs: [{ internalType: "address", name: "", type: "address" }],
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
            name: "isPrivateSaleActive",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "isPublicSaleActive",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
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
            inputs: [{ internalType: "uint8", name: "_quantity", type: "uint8" }],
            name: "privateMint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [
                { internalType: "address", name: "user", type: "address" },
                { internalType: "uint8", name: "amount", type: "uint8" },
            ],
            name: "publicMint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
            inputs: [
                { internalType: "address", name: "from", type: "address" },
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "tokenId", type: "uint256" },
            ],
            name: "safeTransferFrom",
            outputs: [],
            stateMutability: "nonpayable",
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
        { inputs: [], name: "togglePrivateMint", outputs: [], stateMutability: "nonpayable", type: "function" },
        { inputs: [], name: "togglePublicMint", outputs: [], stateMutability: "nonpayable", type: "function" },
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
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
            name: "transferOwnership",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
    ];
}
