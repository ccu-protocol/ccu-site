// ===============================
// CCU Site - Global App Script
// ===============================

const CCU_CONFIG = {
  brand: "CCU Protocol",
  network: "Polygon Mainnet",
  chainId: 137,
  tokenAddress: "0xea1f8D12A14e1F143d66fcdcfEf24E137B658f17",
  issuerAddress: "0x0bF1DB36012F267CE1e0F681980998546bCa0146",
  treasuryAddress: "0xbE7DCf2F019d262B647f87d16DBBecE88Ee2ED9D",
  operationsAddress: "0xB23D127Ad4Cb8F1D991F37527A7896027effdBa6",
  decimals: 6,
  symbol: "CCU",
  polygonscanBase: "https://polygonscan.com/address/",
  emergencyPolicy: {
    floor: "500,000",
    ceiling: "1,200,000",
    hardCap: "5,000,000"
  }
};

// ===============================
// Helpers
// ===============================
function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function shortAddress(address, start = 6, end = 4) {
  if (!address || address.length < start + end) return address || "";
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function copyText(text) {
  if (!text) return Promise.reject(new Error("No text to copy"));
  return navigator.clipboard.writeText(text);
}

function setText(selector, value) {
  const el = $(selector);
  if (el) el.textContent = value;
}

function setHTML(selector, value) {
  const el = $(selector);
  if (el) el.innerHTML = value;
}

function setHref(selector, value) {
  const el = $(selector);
  if (el) el.href = value;
}

function polygonscanAddressLink(address) {
  return `${CCU_CONFIG.polygonscanBase}${address}`;
}

// ===============================
// Active menu highlight
// ===============================
function markActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";

  $all("nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const cleanHref = href.split("/").pop();

    if (
      cleanHref === path ||
      (path === "" && cleanHref === "index.html") ||
      (path === "index.html" && cleanHref === "index.html")
    ) {
      link.classList.add("active");
    }
  });
}

// ===============================
// Fill common config values
// ===============================
function populateConfigFields() {
  // Token / contract fields
  $all("[data-token-address]").forEach((el) => {
    el.textContent = CCU_CONFIG.tokenAddress;
  });

  $all("[data-issuer-address]").forEach((el) => {
    el.textContent = CCU_CONFIG.issuerAddress;
  });

  $all("[data-treasury-address]").forEach((el) => {
    el.textContent = CCU_CONFIG.treasuryAddress;
  });

  $all("[data-operations-address]").forEach((el) => {
    el.textContent = CCU_CONFIG.operationsAddress;
  });

  $all("[data-token-symbol]").forEach((el) => {
    el.textContent = CCU_CONFIG.symbol;
  });

  $all("[data-token-decimals]").forEach((el) => {
    el.textContent = String(CCU_CONFIG.decimals);
  });

  $all("[data-network-name]").forEach((el) => {
    el.textContent = CCU_CONFIG.network;
  });

  $all("[data-emergency-floor]").forEach((el) => {
    el.textContent = CCU_CONFIG.emergencyPolicy.floor;
  });

  $all("[data-emergency-ceiling]").forEach((el) => {
    el.textContent = CCU_CONFIG.emergencyPolicy.ceiling;
  });

  $all("[data-emergency-hardcap]").forEach((el) => {
    el.textContent = CCU_CONFIG.emergencyPolicy.hardCap;
  });

  // Short address rendering
  $all("[data-token-address-short]").forEach((el) => {
    el.textContent = shortAddress(CCU_CONFIG.tokenAddress);
  });

  $all("[data-issuer-address-short]").forEach((el) => {
    el.textContent = shortAddress(CCU_CONFIG.issuerAddress);
  });

  $all("[data-treasury-address-short]").forEach((el) => {
    el.textContent = shortAddress(CCU_CONFIG.treasuryAddress);
  });

  $all("[data-operations-address-short]").forEach((el) => {
    el.textContent = shortAddress(CCU_CONFIG.operationsAddress);
  });

  // PolygonScan links
  $all("[data-token-polygonscan]").forEach((el) => {
    el.href = polygonscanAddressLink(CCU_CONFIG.tokenAddress);
  });

  $all("[data-issuer-polygonscan]").forEach((el) => {
    el.href = polygonscanAddressLink(CCU_CONFIG.issuerAddress);
  });

  $all("[data-treasury-polygonscan]").forEach((el) => {
    el.href = polygonscanAddressLink(CCU_CONFIG.treasuryAddress);
  });

  $all("[data-operations-polygonscan]").forEach((el) => {
    el.href = polygonscanAddressLink(CCU_CONFIG.operationsAddress);
  });
}

// ===============================
// Copy buttons
// ===============================
function bindCopyActions() {
  $all("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const key = btn.getAttribute("data-copy");
      let value = "";

      if (key === "token") value = CCU_CONFIG.tokenAddress;
      if (key === "issuer") value = CCU_CONFIG.issuerAddress;
      if (key === "treasury") value = CCU_CONFIG.treasuryAddress;
      if (key === "operations") value = CCU_CONFIG.operationsAddress;

      if (!value) return;

      const oldText = btn.textContent;
      try {
        await copyText(value);
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = oldText;
        }, 1200);
      } catch (err) {
        console.error("Copy failed:", err);
        btn.textContent = "Failed";
        setTimeout(() => {
          btn.textContent = oldText;
        }, 1200);
      }
    });
  });
}

// ===============================
// Footer year
// ===============================
function renderFooterYear() {
  $all("[data-current-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

// ===============================
// Basic page boot
// ===============================
function initPage() {
  markActiveNav();
  populateConfigFields();
  bindCopyActions();
  renderFooterYear();

  document.documentElement.dataset.appReady = "true";
  console.log("CCU app initialized");
}

// ===============================
// Public access (optional)
// ===============================
window.CCU_CONFIG = CCU_CONFIG;
window.CCU_APP = {
  initPage,
  shortAddress,
  polygonscanAddressLink
};

// ===============================
// Boot
// ===============================
document.addEventListener("DOMContentLoaded", initPage);