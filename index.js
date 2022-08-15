//IN NODEjs                                       ==> REQUIRE()
//in frond-end javascript you can't use require   ==> IMPORT
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");

connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

//FUNCTION CONNECT
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        console.log("connected!");
        connectButton.innerHTML = "Connected!";
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
    } else {
        console.log("No metamask!");
        connectButton.innerHTML = "Please install MetaMask!";
    }
}

//FUNCTION WITHDRAW
async function withdraw() {
    console.log("Withdrawing...");
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    } else {
        withdrawButton.innerHTML = "Please install MetaMask!";
    }
}

//FUND FUNCTION
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        //provider / connection to the blockchain
        //signer / wallet / someone with some gas
        //contract that we are interacting with
        //^ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        //console.log(signer);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            //listen for the tx to be mined / listen for an event <= we haven't learned about yet!
            //hey, wait for this tx to finish
            await listenForTransactionMine(transactionResponse, provider);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    } else {
        fundButton.innerHTML = "Plese install MetaMask";
    }
}

//GETBALANCE FUNCTION
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
            const balance = await provider.getBalance(contractAddress);
            console.log(ethers.utils.formatEther(balance));
        } catch (error) {
            console.log(error);
        }
    } else {
        balanceButton.innerHTML = "Please install MetaMask!";
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations. `
            );
            resolve();
        });
    });
}

// 1. ..../hardhat-fund-me-fcc => yarn hardhat node
