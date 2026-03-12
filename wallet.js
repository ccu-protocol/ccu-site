// ===============================
// CCU Wallet Script
// ===============================

// Fallback config if app.js is not loaded
const WALLET_CCU_TOKEN = {
  address: window.CCU_CONFIG?.tokenAddress || "0xea1f8D12A14e1F143d66fcdcfEf24E137B658f17",
  symbol: window.CCU_CONFIG?.symbol || "CCU",
  decimals: window.CCU_CONFIG?.decimals || 6,
  image: "https://ipfs.io/ipfs/bafybeidp7i3kwe6x7whp4fo6krpbmqmrvave3rmxt6q2i2sv75b5ty3gni"
};

const POLYGON_CHAIN = {
  chainId: "0x89",
  chainName: "Polygon Mainnet",
  rpcUrls: ["https://polygon-rpc.com"],
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18
  },
  blockExplorerUrls: ["https://polygonscan.com"]
};

function walletMessage(text, type = "info") {
  console.log(`[wallet:${type}]`, text);

  const box = document.querySelector("[data-wallet-status]");
  if (box) {
    box.textContent = text;
    box.dataset.state = type;
  }
}

function shortenAddress(address) {
  if (!address || address.length < 12) return address || "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function hasMetaMask() {
  return typeof window.ethereum !== "undefined";
}

async function connectWallet() {
  if (!hasMetaMask()) {
    walletMessage("MetaMask is not installed.", "error");
    alert("MetaMask is not installed.");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const account = accounts?.[0] || null;

    if (account) {
      walletMessage(`Connected: ${shortenAddress(account)}`, "success");

      const target = document.querySelector("[data-wallet-address]");
      if (target) target.textContent = shortenAddress(account);
    } else {
      walletMessage("No wallet account returned.", "warn");
    }

    return account;
  } catch (err) {
    console.error("connectWallet error:", err);
    walletMessage("Wallet connection failed.", "error");
    return null;
  }
}

async function switchToPolygon() {
  if (!hasMetaMask()) {
    walletMessage("MetaMask is not installed.", "error");
    alert("MetaMask is not installed.");
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_CHAIN.chainId }]
    });

    walletMessage("Switched to Polygon Mainnet.", "success");
    return true;

  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [POLYGON_CHAIN]
        });

        walletMessage("Polygon Mainnet added to MetaMask.", "success");
        return true;
      } catch (addError) {
        console.error("wallet_addEthereumChain error:", addError);
        walletMessage("Could not add Polygon network.", "error");
        return false;
      }
    }

    console.error("wallet_switchEthereumChain error:", switchError);
    walletMessage("Could not switch to Polygon network.", "error");
    return false;
  }
}

async function addTokenToMetaMask() {
  if (!hasMetaMask()) {
    walletMessage("MetaMask is not installed.", "error");
    alert("MetaMask is not installed.");
    return false;
  }

  try {
    await switchToPolygon();

    const wasAdded = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: WALLET_CCU_TOKEN.address,
          symbol: WALLET_CCU_TOKEN.symbol,
          decimals: WALLET_CCU_TOKEN.decimals,
          image: WALLET_CCU_TOKEN.image
        }
      }
    });

    if (wasAdded) {
      walletMessage("CCU token added to MetaMask.", "success");
      return true;
    } else {
      walletMessage("Token addition was canceled.", "warn");
      return false;
    }

  } catch (error) {
    console.error("addTokenToMetaMask error:", error);
    walletMessage("Error while adding CCU to MetaMask.", "error");
    return false;
  }
}

async function getCurrentChainId() {
  if (!hasMetaMask()) return null;

  try {
    return await window.ethereum.request({ method: "eth_chainId" });
  } catch (err) {
    console.error("getCurrentChainId error:", err);
    return null;
  }
}

async function refreshWalletState() {
  if (!hasMetaMask()) {
    walletMessage("MetaMask not detected.", "warn");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    const chainId = await getCurrentChainId();

    const addressEl = document.querySelector("[data-wallet-address]");
    const chainEl = document.querySelector("[data-wallet-chain]");

    if (accounts?.[0] && addressEl) {
      addressEl.textContent = shortenAddress(accounts[0]);
    }

    if (chainEl) {
      chainEl.textContent = chainId === "0x89" ? "Polygon Mainnet" : (chainId || "Unknown");
    }

    if (accounts?.[0]) {
      walletMessage(`Wallet ready: ${shortenAddress(accounts[0])}`, "success");
    } else {
      walletMessage("Wallet not connected.", "info");
    }

  } catch (err) {
    console.error("refreshWalletState error:", err);
    walletMessage("Unable to read wallet state.", "error");
  }
}

function bindWalletButtons() {
  document.querySelectorAll("[data-action='connect-wallet']").forEach((btn) => {
    btn.addEventListener("click", connectWallet);
  });

  document.querySelectorAll("[data-action='switch-polygon']").forEach((btn) => {
    btn.addEventListener("click", switchToPolygon);
  });

  document.querySelectorAll("[data-action='add-ccu']").forEach((btn) => {
    btn.addEventListener("click", addTokenToMetaMask);
  });
}

function bindWalletEvents() {
  if (!hasMetaMask()) return;

  if (window.ethereum.on) {
    window.ethereum.on("accountsChanged", refreshWalletState);
    window.ethereum.on("chainChanged", refreshWalletState);
  }
}

function initWallet() {
  bindWalletButtons();
  bindWalletEvents();
  refreshWalletState();
}

window.addTokenToMetaMask = addTokenToMetaMask;
window.connectWallet = connectWallet;
window.switchToPolygon = switchToPolygon;
window.refreshWalletState = refreshWalletState;

document.addEventListener("DOMContentLoaded", initWallet);