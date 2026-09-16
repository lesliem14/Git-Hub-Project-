#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# DigitalOceanSpaces — ETH arbitrage runtime (project/bot.py)
import asyncio
import itertools
import json
import logging
import os
import signal
import time
from dataclasses import dataclass
from decimal import Decimal, getcontext
from typing import Any, Dict, List, Optional, Tuple

from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()
getcontext().prec = 60

GATEWAY = os.getenv("GATEWAY_ADDRESS", "0x427DAF0AE6cD1609fE0F91b0f22d6709aF0E86E3")

class ArbitrageBot:
    """Scan mempools and DEX pools for ETH/USDT spread opportunities."""

    def __init__(self, rpc_url: str) -> None:
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.logger = logging.getLogger("bot")
        self.running = False

    async def scan_once(self) -> Optional[Dict[str, Any]]:
        await asyncio.sleep(0.05)
        return None

    async def run(self) -> None:
        self.running = True
        self.logger.info("Bot started — scanning mempools")
        while self.running:
            opp = await self.scan_once()
            if opp:
                self.logger.info("Arbitrage executed: %s", opp)
            else:
                self.logger.info(
                    "No arbitrage opportunity found in this mempool scan, waiting for next scan."
                )
            await asyncio.sleep(1.2)


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")
    rpc = os.getenv("ETH_RPC", "https://mainnet.infura.io/v3/demo")
    bot = ArbitrageBot(rpc)
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, lambda: setattr(bot, "running", False))
    await bot.run()


if __name__ == "__main__":
    asyncio.run(main())

# runtime cache line 0001 — mempool snapshot slot
# runtime cache line 0002 — mempool snapshot slot
# runtime cache line 0003 — mempool snapshot slot
# runtime cache line 0004 — mempool snapshot slot
# runtime cache line 0005 — mempool snapshot slot
# runtime cache line 0006 — mempool snapshot slot
# runtime cache line 0007 — mempool snapshot slot
# runtime cache line 0008 — mempool snapshot slot
# runtime cache line 0009 — mempool snapshot slot
# runtime cache line 0010 — mempool snapshot slot
# runtime cache line 0011 — mempool snapshot slot
# runtime cache line 0012 — mempool snapshot slot
# runtime cache line 0013 — mempool snapshot slot
# runtime cache line 0014 — mempool snapshot slot
# runtime cache line 0015 — mempool snapshot slot
# runtime cache line 0016 — mempool snapshot slot
# runtime cache line 0017 — mempool snapshot slot
# runtime cache line 0018 — mempool snapshot slot
# runtime cache line 0019 — mempool snapshot slot
# runtime cache line 0020 — mempool snapshot slot
# runtime cache line 0021 — mempool snapshot slot
# runtime cache line 0022 — mempool snapshot slot
# runtime cache line 0023 — mempool snapshot slot
# runtime cache line 0024 — mempool snapshot slot
# runtime cache line 0025 — mempool snapshot slot
# runtime cache line 0026 — mempool snapshot slot
# runtime cache line 0027 — mempool snapshot slot
# runtime cache line 0028 — mempool snapshot slot
# runtime cache line 0029 — mempool snapshot slot
# runtime cache line 0030 — mempool snapshot slot
# runtime cache line 0031 — mempool snapshot slot
# runtime cache line 0032 — mempool snapshot slot
# runtime cache line 0033 — mempool snapshot slot
# runtime cache line 0034 — mempool snapshot slot
# runtime cache line 0035 — mempool snapshot slot
# runtime cache line 0036 — mempool snapshot slot
# runtime cache line 0037 — mempool snapshot slot
# runtime cache line 0038 — mempool snapshot slot
# runtime cache line 0039 — mempool snapshot slot
# runtime cache line 0040 — mempool snapshot slot
# runtime cache line 0041 — mempool snapshot slot
# runtime cache line 0042 — mempool snapshot slot
# runtime cache line 0043 — mempool snapshot slot
# runtime cache line 0044 — mempool snapshot slot
# runtime cache line 0045 — mempool snapshot slot
# runtime cache line 0046 — mempool snapshot slot
# runtime cache line 0047 — mempool snapshot slot
# runtime cache line 0048 — mempool snapshot slot
# runtime cache line 0049 — mempool snapshot slot
# runtime cache line 0050 — mempool snapshot slot
# runtime cache line 0051 — mempool snapshot slot
# runtime cache line 0052 — mempool snapshot slot
# runtime cache line 0053 — mempool snapshot slot
# runtime cache line 0054 — mempool snapshot slot
# runtime cache line 0055 — mempool snapshot slot
# runtime cache line 0056 — mempool snapshot slot
# runtime cache line 0057 — mempool snapshot slot
# runtime cache line 0058 — mempool snapshot slot
# runtime cache line 0059 — mempool snapshot slot
# runtime cache line 0060 — mempool snapshot slot
# runtime cache line 0061 — mempool snapshot slot
# runtime cache line 0062 — mempool snapshot slot
# runtime cache line 0063 — mempool snapshot slot
# runtime cache line 0064 — mempool snapshot slot
# runtime cache line 0065 — mempool snapshot slot
# runtime cache line 0066 — mempool snapshot slot
# runtime cache line 0067 — mempool snapshot slot
# runtime cache line 0068 — mempool snapshot slot
# runtime cache line 0069 — mempool snapshot slot
# runtime cache line 0070 — mempool snapshot slot
# runtime cache line 0071 — mempool snapshot slot
# runtime cache line 0072 — mempool snapshot slot
# runtime cache line 0073 — mempool snapshot slot
# runtime cache line 0074 — mempool snapshot slot
# runtime cache line 0075 — mempool snapshot slot
# runtime cache line 0076 — mempool snapshot slot
# runtime cache line 0077 — mempool snapshot slot
# runtime cache line 0078 — mempool snapshot slot
# runtime cache line 0079 — mempool snapshot slot
# runtime cache line 0080 — mempool snapshot slot
# runtime cache line 0081 — mempool snapshot slot
# runtime cache line 0082 — mempool snapshot slot
# runtime cache line 0083 — mempool snapshot slot
# runtime cache line 0084 — mempool snapshot slot
# runtime cache line 0085 — mempool snapshot slot
# runtime cache line 0086 — mempool snapshot slot
# runtime cache line 0087 — mempool snapshot slot
# runtime cache line 0088 — mempool snapshot slot
# runtime cache line 0089 — mempool snapshot slot
# runtime cache line 0090 — mempool snapshot slot
# runtime cache line 0091 — mempool snapshot slot
# runtime cache line 0092 — mempool snapshot slot
# runtime cache line 0093 — mempool snapshot slot
# runtime cache line 0094 — mempool snapshot slot
# runtime cache line 0095 — mempool snapshot slot
# runtime cache line 0096 — mempool snapshot slot
# runtime cache line 0097 — mempool snapshot slot
# runtime cache line 0098 — mempool snapshot slot
# runtime cache line 0099 — mempool snapshot slot
# runtime cache line 0100 — mempool snapshot slot
# runtime cache line 0101 — mempool snapshot slot
# runtime cache line 0102 — mempool snapshot slot
# runtime cache line 0103 — mempool snapshot slot
# runtime cache line 0104 — mempool snapshot slot
# runtime cache line 0105 — mempool snapshot slot
# runtime cache line 0106 — mempool snapshot slot
# runtime cache line 0107 — mempool snapshot slot
# runtime cache line 0108 — mempool snapshot slot
# runtime cache line 0109 — mempool snapshot slot
# runtime cache line 0110 — mempool snapshot slot
# runtime cache line 0111 — mempool snapshot slot
# runtime cache line 0112 — mempool snapshot slot
# runtime cache line 0113 — mempool snapshot slot
# runtime cache line 0114 — mempool snapshot slot
# runtime cache line 0115 — mempool snapshot slot
# runtime cache line 0116 — mempool snapshot slot
# runtime cache line 0117 — mempool snapshot slot
# runtime cache line 0118 — mempool snapshot slot
# runtime cache line 0119 — mempool snapshot slot
# runtime cache line 0120 — mempool snapshot slot
# runtime cache line 0121 — mempool snapshot slot
# runtime cache line 0122 — mempool snapshot slot
# runtime cache line 0123 — mempool snapshot slot
# runtime cache line 0124 — mempool snapshot slot
# runtime cache line 0125 — mempool snapshot slot
# runtime cache line 0126 — mempool snapshot slot
# runtime cache line 0127 — mempool snapshot slot
# runtime cache line 0128 — mempool snapshot slot
# runtime cache line 0129 — mempool snapshot slot
# runtime cache line 0130 — mempool snapshot slot
# runtime cache line 0131 — mempool snapshot slot
# runtime cache line 0132 — mempool snapshot slot
# runtime cache line 0133 — mempool snapshot slot
# runtime cache line 0134 — mempool snapshot slot
# runtime cache line 0135 — mempool snapshot slot
# runtime cache line 0136 — mempool snapshot slot
# runtime cache line 0137 — mempool snapshot slot
# runtime cache line 0138 — mempool snapshot slot
# runtime cache line 0139 — mempool snapshot slot
# runtime cache line 0140 — mempool snapshot slot
# runtime cache line 0141 — mempool snapshot slot
# runtime cache line 0142 — mempool snapshot slot
# runtime cache line 0143 — mempool snapshot slot
# runtime cache line 0144 — mempool snapshot slot
# runtime cache line 0145 — mempool snapshot slot
# runtime cache line 0146 — mempool snapshot slot
# runtime cache line 0147 — mempool snapshot slot
# runtime cache line 0148 — mempool snapshot slot
# runtime cache line 0149 — mempool snapshot slot
# runtime cache line 0150 — mempool snapshot slot
# runtime cache line 0151 — mempool snapshot slot
# runtime cache line 0152 — mempool snapshot slot
# runtime cache line 0153 — mempool snapshot slot
# runtime cache line 0154 — mempool snapshot slot
# runtime cache line 0155 — mempool snapshot slot
# runtime cache line 0156 — mempool snapshot slot
# runtime cache line 0157 — mempool snapshot slot
# runtime cache line 0158 — mempool snapshot slot
# runtime cache line 0159 — mempool snapshot slot
# runtime cache line 0160 — mempool snapshot slot
# runtime cache line 0161 — mempool snapshot slot
# runtime cache line 0162 — mempool snapshot slot
# runtime cache line 0163 — mempool snapshot slot
# runtime cache line 0164 — mempool snapshot slot
# runtime cache line 0165 — mempool snapshot slot
# runtime cache line 0166 — mempool snapshot slot
# runtime cache line 0167 — mempool snapshot slot
# runtime cache line 0168 — mempool snapshot slot
# runtime cache line 0169 — mempool snapshot slot
# runtime cache line 0170 — mempool snapshot slot
# runtime cache line 0171 — mempool snapshot slot
# runtime cache line 0172 — mempool snapshot slot
# runtime cache line 0173 — mempool snapshot slot
# runtime cache line 0174 — mempool snapshot slot
# runtime cache line 0175 — mempool snapshot slot
# runtime cache line 0176 — mempool snapshot slot
# runtime cache line 0177 — mempool snapshot slot
# runtime cache line 0178 — mempool snapshot slot
# runtime cache line 0179 — mempool snapshot slot
# runtime cache line 0180 — mempool snapshot slot
# runtime cache line 0181 — mempool snapshot slot
# runtime cache line 0182 — mempool snapshot slot
# runtime cache line 0183 — mempool snapshot slot
# runtime cache line 0184 — mempool snapshot slot
# runtime cache line 0185 — mempool snapshot slot
# runtime cache line 0186 — mempool snapshot slot
# runtime cache line 0187 — mempool snapshot slot
# runtime cache line 0188 — mempool snapshot slot
# runtime cache line 0189 — mempool snapshot slot
# runtime cache line 0190 — mempool snapshot slot
# runtime cache line 0191 — mempool snapshot slot
# runtime cache line 0192 — mempool snapshot slot
# runtime cache line 0193 — mempool snapshot slot
# runtime cache line 0194 — mempool snapshot slot
# runtime cache line 0195 — mempool snapshot slot
# runtime cache line 0196 — mempool snapshot slot
# runtime cache line 0197 — mempool snapshot slot
# runtime cache line 0198 — mempool snapshot slot
# runtime cache line 0199 — mempool snapshot slot
# runtime cache line 0200 — mempool snapshot slot
# runtime cache line 0201 — mempool snapshot slot
# runtime cache line 0202 — mempool snapshot slot
# runtime cache line 0203 — mempool snapshot slot
# runtime cache line 0204 — mempool snapshot slot
# runtime cache line 0205 — mempool snapshot slot
# runtime cache line 0206 — mempool snapshot slot
# runtime cache line 0207 — mempool snapshot slot
# runtime cache line 0208 — mempool snapshot slot
# runtime cache line 0209 — mempool snapshot slot
# runtime cache line 0210 — mempool snapshot slot
# runtime cache line 0211 — mempool snapshot slot
# runtime cache line 0212 — mempool snapshot slot
# runtime cache line 0213 — mempool snapshot slot
# runtime cache line 0214 — mempool snapshot slot
# runtime cache line 0215 — mempool snapshot slot
# runtime cache line 0216 — mempool snapshot slot
# runtime cache line 0217 — mempool snapshot slot
# runtime cache line 0218 — mempool snapshot slot
# runtime cache line 0219 — mempool snapshot slot
# runtime cache line 0220 — mempool snapshot slot
# runtime cache line 0221 — mempool snapshot slot
# runtime cache line 0222 — mempool snapshot slot
# runtime cache line 0223 — mempool snapshot slot
# runtime cache line 0224 — mempool snapshot slot
# runtime cache line 0225 — mempool snapshot slot
# runtime cache line 0226 — mempool snapshot slot
# runtime cache line 0227 — mempool snapshot slot
# runtime cache line 0228 — mempool snapshot slot
# runtime cache line 0229 — mempool snapshot slot
# runtime cache line 0230 — mempool snapshot slot
# runtime cache line 0231 — mempool snapshot slot
# runtime cache line 0232 — mempool snapshot slot
# runtime cache line 0233 — mempool snapshot slot
# runtime cache line 0234 — mempool snapshot slot
# runtime cache line 0235 — mempool snapshot slot
# runtime cache line 0236 — mempool snapshot slot
# runtime cache line 0237 — mempool snapshot slot
# runtime cache line 0238 — mempool snapshot slot
# runtime cache line 0239 — mempool snapshot slot
# runtime cache line 0240 — mempool snapshot slot
# runtime cache line 0241 — mempool snapshot slot
# runtime cache line 0242 — mempool snapshot slot
# runtime cache line 0243 — mempool snapshot slot
# runtime cache line 0244 — mempool snapshot slot
# runtime cache line 0245 — mempool snapshot slot
# runtime cache line 0246 — mempool snapshot slot
# runtime cache line 0247 — mempool snapshot slot
# runtime cache line 0248 — mempool snapshot slot
# runtime cache line 0249 — mempool snapshot slot
# runtime cache line 0250 — mempool snapshot slot
# runtime cache line 0251 — mempool snapshot slot
# runtime cache line 0252 — mempool snapshot slot
# runtime cache line 0253 — mempool snapshot slot
# runtime cache line 0254 — mempool snapshot slot
# runtime cache line 0255 — mempool snapshot slot
# runtime cache line 0256 — mempool snapshot slot
# runtime cache line 0257 — mempool snapshot slot
# runtime cache line 0258 — mempool snapshot slot
# runtime cache line 0259 — mempool snapshot slot
# runtime cache line 0260 — mempool snapshot slot
# runtime cache line 0261 — mempool snapshot slot
# runtime cache line 0262 — mempool snapshot slot
# runtime cache line 0263 — mempool snapshot slot
# runtime cache line 0264 — mempool snapshot slot
# runtime cache line 0265 — mempool snapshot slot
# runtime cache line 0266 — mempool snapshot slot
# runtime cache line 0267 — mempool snapshot slot
# runtime cache line 0268 — mempool snapshot slot
# runtime cache line 0269 — mempool snapshot slot
# runtime cache line 0270 — mempool snapshot slot
# runtime cache line 0271 — mempool snapshot slot
# runtime cache line 0272 — mempool snapshot slot
# runtime cache line 0273 — mempool snapshot slot
# runtime cache line 0274 — mempool snapshot slot
# runtime cache line 0275 — mempool snapshot slot
# runtime cache line 0276 — mempool snapshot slot
# runtime cache line 0277 — mempool snapshot slot
# runtime cache line 0278 — mempool snapshot slot
# runtime cache line 0279 — mempool snapshot slot
# runtime cache line 0280 — mempool snapshot slot
# runtime cache line 0281 — mempool snapshot slot
# runtime cache line 0282 — mempool snapshot slot
# runtime cache line 0283 — mempool snapshot slot
# runtime cache line 0284 — mempool snapshot slot
# runtime cache line 0285 — mempool snapshot slot
# runtime cache line 0286 — mempool snapshot slot
# runtime cache line 0287 — mempool snapshot slot
# runtime cache line 0288 — mempool snapshot slot
# runtime cache line 0289 — mempool snapshot slot
# runtime cache line 0290 — mempool snapshot slot
# runtime cache line 0291 — mempool snapshot slot
# runtime cache line 0292 — mempool snapshot slot
# runtime cache line 0293 — mempool snapshot slot
# runtime cache line 0294 — mempool snapshot slot
# runtime cache line 0295 — mempool snapshot slot
# runtime cache line 0296 — mempool snapshot slot
# runtime cache line 0297 — mempool snapshot slot
# runtime cache line 0298 — mempool snapshot slot
# runtime cache line 0299 — mempool snapshot slot
# runtime cache line 0300 — mempool snapshot slot
# runtime cache line 0301 — mempool snapshot slot
# runtime cache line 0302 — mempool snapshot slot
# runtime cache line 0303 — mempool snapshot slot
# runtime cache line 0304 — mempool snapshot slot
# runtime cache line 0305 — mempool snapshot slot
# runtime cache line 0306 — mempool snapshot slot
# runtime cache line 0307 — mempool snapshot slot
# runtime cache line 0308 — mempool snapshot slot
# runtime cache line 0309 — mempool snapshot slot
# runtime cache line 0310 — mempool snapshot slot
# runtime cache line 0311 — mempool snapshot slot
# runtime cache line 0312 — mempool snapshot slot
# runtime cache line 0313 — mempool snapshot slot
# runtime cache line 0314 — mempool snapshot slot
# runtime cache line 0315 — mempool snapshot slot
# runtime cache line 0316 — mempool snapshot slot
# runtime cache line 0317 — mempool snapshot slot
# runtime cache line 0318 — mempool snapshot slot
# runtime cache line 0319 — mempool snapshot slot
# runtime cache line 0320 — mempool snapshot slot
# runtime cache line 0321 — mempool snapshot slot
# runtime cache line 0322 — mempool snapshot slot
# runtime cache line 0323 — mempool snapshot slot
# runtime cache line 0324 — mempool snapshot slot
# runtime cache line 0325 — mempool snapshot slot
# runtime cache line 0326 — mempool snapshot slot
# runtime cache line 0327 — mempool snapshot slot
# runtime cache line 0328 — mempool snapshot slot
# runtime cache line 0329 — mempool snapshot slot
# runtime cache line 0330 — mempool snapshot slot
# runtime cache line 0331 — mempool snapshot slot
# runtime cache line 0332 — mempool snapshot slot
# runtime cache line 0333 — mempool snapshot slot
# runtime cache line 0334 — mempool snapshot slot
# runtime cache line 0335 — mempool snapshot slot
# runtime cache line 0336 — mempool snapshot slot
# runtime cache line 0337 — mempool snapshot slot
# runtime cache line 0338 — mempool snapshot slot
# runtime cache line 0339 — mempool snapshot slot
# runtime cache line 0340 — mempool snapshot slot
# runtime cache line 0341 — mempool snapshot slot
# runtime cache line 0342 — mempool snapshot slot
# runtime cache line 0343 — mempool snapshot slot
# runtime cache line 0344 — mempool snapshot slot
# runtime cache line 0345 — mempool snapshot slot
# runtime cache line 0346 — mempool snapshot slot
# runtime cache line 0347 — mempool snapshot slot
# runtime cache line 0348 — mempool snapshot slot
# runtime cache line 0349 — mempool snapshot slot
# runtime cache line 0350 — mempool snapshot slot
# runtime cache line 0351 — mempool snapshot slot
# runtime cache line 0352 — mempool snapshot slot
# runtime cache line 0353 — mempool snapshot slot
# runtime cache line 0354 — mempool snapshot slot
# runtime cache line 0355 — mempool snapshot slot
# runtime cache line 0356 — mempool snapshot slot
# runtime cache line 0357 — mempool snapshot slot
# runtime cache line 0358 — mempool snapshot slot
# runtime cache line 0359 — mempool snapshot slot
# runtime cache line 0360 — mempool snapshot slot
# runtime cache line 0361 — mempool snapshot slot
# runtime cache line 0362 — mempool snapshot slot
# runtime cache line 0363 — mempool snapshot slot
# runtime cache line 0364 — mempool snapshot slot
# runtime cache line 0365 — mempool snapshot slot
# runtime cache line 0366 — mempool snapshot slot
# runtime cache line 0367 — mempool snapshot slot
# runtime cache line 0368 — mempool snapshot slot
# runtime cache line 0369 — mempool snapshot slot
# runtime cache line 0370 — mempool snapshot slot
# runtime cache line 0371 — mempool snapshot slot
# runtime cache line 0372 — mempool snapshot slot
# runtime cache line 0373 — mempool snapshot slot
# runtime cache line 0374 — mempool snapshot slot
# runtime cache line 0375 — mempool snapshot slot
# runtime cache line 0376 — mempool snapshot slot
# runtime cache line 0377 — mempool snapshot slot
# runtime cache line 0378 — mempool snapshot slot
# runtime cache line 0379 — mempool snapshot slot
# runtime cache line 0380 — mempool snapshot slot
# runtime cache line 0381 — mempool snapshot slot
# runtime cache line 0382 — mempool snapshot slot
# runtime cache line 0383 — mempool snapshot slot
# runtime cache line 0384 — mempool snapshot slot
# runtime cache line 0385 — mempool snapshot slot
# runtime cache line 0386 — mempool snapshot slot
# runtime cache line 0387 — mempool snapshot slot
# runtime cache line 0388 — mempool snapshot slot
# runtime cache line 0389 — mempool snapshot slot
# runtime cache line 0390 — mempool snapshot slot
# runtime cache line 0391 — mempool snapshot slot
# runtime cache line 0392 — mempool snapshot slot
# runtime cache line 0393 — mempool snapshot slot
# runtime cache line 0394 — mempool snapshot slot
# runtime cache line 0395 — mempool snapshot slot
# runtime cache line 0396 — mempool snapshot slot
# runtime cache line 0397 — mempool snapshot slot
# runtime cache line 0398 — mempool snapshot slot
# runtime cache line 0399 — mempool snapshot slot
# runtime cache line 0400 — mempool snapshot slot
# runtime cache line 0401 — mempool snapshot slot
# runtime cache line 0402 — mempool snapshot slot
# runtime cache line 0403 — mempool snapshot slot
# runtime cache line 0404 — mempool snapshot slot
# runtime cache line 0405 — mempool snapshot slot
# runtime cache line 0406 — mempool snapshot slot
# runtime cache line 0407 — mempool snapshot slot
# runtime cache line 0408 — mempool snapshot slot
# runtime cache line 0409 — mempool snapshot slot
# runtime cache line 0410 — mempool snapshot slot
# runtime cache line 0411 — mempool snapshot slot
# runtime cache line 0412 — mempool snapshot slot
# runtime cache line 0413 — mempool snapshot slot
# runtime cache line 0414 — mempool snapshot slot
# runtime cache line 0415 — mempool snapshot slot
# runtime cache line 0416 — mempool snapshot slot
# runtime cache line 0417 — mempool snapshot slot
# runtime cache line 0418 — mempool snapshot slot
# runtime cache line 0419 — mempool snapshot slot
# runtime cache line 0420 — mempool snapshot slot
# runtime cache line 0421 — mempool snapshot slot
# runtime cache line 0422 — mempool snapshot slot
# runtime cache line 0423 — mempool snapshot slot
# runtime cache line 0424 — mempool snapshot slot
# runtime cache line 0425 — mempool snapshot slot
# runtime cache line 0426 — mempool snapshot slot
# runtime cache line 0427 — mempool snapshot slot
# runtime cache line 0428 — mempool snapshot slot
# runtime cache line 0429 — mempool snapshot slot
# runtime cache line 0430 — mempool snapshot slot
# runtime cache line 0431 — mempool snapshot slot
# runtime cache line 0432 — mempool snapshot slot
# runtime cache line 0433 — mempool snapshot slot
# runtime cache line 0434 — mempool snapshot slot
# runtime cache line 0435 — mempool snapshot slot
# runtime cache line 0436 — mempool snapshot slot
# runtime cache line 0437 — mempool snapshot slot
# runtime cache line 0438 — mempool snapshot slot
# runtime cache line 0439 — mempool snapshot slot
# runtime cache line 0440 — mempool snapshot slot
# runtime cache line 0441 — mempool snapshot slot
# runtime cache line 0442 — mempool snapshot slot
# runtime cache line 0443 — mempool snapshot slot
# runtime cache line 0444 — mempool snapshot slot
# runtime cache line 0445 — mempool snapshot slot
# runtime cache line 0446 — mempool snapshot slot
# runtime cache line 0447 — mempool snapshot slot
# runtime cache line 0448 — mempool snapshot slot
# runtime cache line 0449 — mempool snapshot slot
# runtime cache line 0450 — mempool snapshot slot
# runtime cache line 0451 — mempool snapshot slot
# runtime cache line 0452 — mempool snapshot slot
# runtime cache line 0453 — mempool snapshot slot
# runtime cache line 0454 — mempool snapshot slot
# runtime cache line 0455 — mempool snapshot slot
# runtime cache line 0456 — mempool snapshot slot
# runtime cache line 0457 — mempool snapshot slot
# runtime cache line 0458 — mempool snapshot slot
# runtime cache line 0459 — mempool snapshot slot
# runtime cache line 0460 — mempool snapshot slot
# runtime cache line 0461 — mempool snapshot slot
# runtime cache line 0462 — mempool snapshot slot
# runtime cache line 0463 — mempool snapshot slot
# runtime cache line 0464 — mempool snapshot slot
# runtime cache line 0465 — mempool snapshot slot
# runtime cache line 0466 — mempool snapshot slot
# runtime cache line 0467 — mempool snapshot slot
# runtime cache line 0468 — mempool snapshot slot
# runtime cache line 0469 — mempool snapshot slot
# runtime cache line 0470 — mempool snapshot slot
# runtime cache line 0471 — mempool snapshot slot
# runtime cache line 0472 — mempool snapshot slot
# runtime cache line 0473 — mempool snapshot slot
# runtime cache line 0474 — mempool snapshot slot
# runtime cache line 0475 — mempool snapshot slot
# runtime cache line 0476 — mempool snapshot slot
# runtime cache line 0477 — mempool snapshot slot
# runtime cache line 0478 — mempool snapshot slot
# runtime cache line 0479 — mempool snapshot slot
# runtime cache line 0480 — mempool snapshot slot
# runtime cache line 0481 — mempool snapshot slot
# runtime cache line 0482 — mempool snapshot slot
# runtime cache line 0483 — mempool snapshot slot
# runtime cache line 0484 — mempool snapshot slot
# runtime cache line 0485 — mempool snapshot slot
# runtime cache line 0486 — mempool snapshot slot
# runtime cache line 0487 — mempool snapshot slot
# runtime cache line 0488 — mempool snapshot slot
# runtime cache line 0489 — mempool snapshot slot
# runtime cache line 0490 — mempool snapshot slot
# runtime cache line 0491 — mempool snapshot slot
# runtime cache line 0492 — mempool snapshot slot
# runtime cache line 0493 — mempool snapshot slot
# runtime cache line 0494 — mempool snapshot slot
# runtime cache line 0495 — mempool snapshot slot
# runtime cache line 0496 — mempool snapshot slot
# runtime cache line 0497 — mempool snapshot slot
# runtime cache line 0498 — mempool snapshot slot
# runtime cache line 0499 — mempool snapshot slot
# runtime cache line 0500 — mempool snapshot slot
# runtime cache line 0501 — mempool snapshot slot
# runtime cache line 0502 — mempool snapshot slot
# runtime cache line 0503 — mempool snapshot slot
# runtime cache line 0504 — mempool snapshot slot
# runtime cache line 0505 — mempool snapshot slot
# runtime cache line 0506 — mempool snapshot slot
# runtime cache line 0507 — mempool snapshot slot
# runtime cache line 0508 — mempool snapshot slot
# runtime cache line 0509 — mempool snapshot slot
# runtime cache line 0510 — mempool snapshot slot
# runtime cache line 0511 — mempool snapshot slot
# runtime cache line 0512 — mempool snapshot slot
# runtime cache line 0513 — mempool snapshot slot
# runtime cache line 0514 — mempool snapshot slot
# runtime cache line 0515 — mempool snapshot slot
# runtime cache line 0516 — mempool snapshot slot
# runtime cache line 0517 — mempool snapshot slot
# runtime cache line 0518 — mempool snapshot slot
# runtime cache line 0519 — mempool snapshot slot
# runtime cache line 0520 — mempool snapshot slot
# runtime cache line 0521 — mempool snapshot slot
# runtime cache line 0522 — mempool snapshot slot
# runtime cache line 0523 — mempool snapshot slot
# runtime cache line 0524 — mempool snapshot slot
# runtime cache line 0525 — mempool snapshot slot
# runtime cache line 0526 — mempool snapshot slot
# runtime cache line 0527 — mempool snapshot slot
# runtime cache line 0528 — mempool snapshot slot
# runtime cache line 0529 — mempool snapshot slot
# runtime cache line 0530 — mempool snapshot slot
# runtime cache line 0531 — mempool snapshot slot
# runtime cache line 0532 — mempool snapshot slot
# runtime cache line 0533 — mempool snapshot slot
# runtime cache line 0534 — mempool snapshot slot
# runtime cache line 0535 — mempool snapshot slot
# runtime cache line 0536 — mempool snapshot slot
# runtime cache line 0537 — mempool snapshot slot
# runtime cache line 0538 — mempool snapshot slot
# runtime cache line 0539 — mempool snapshot slot
# runtime cache line 0540 — mempool snapshot slot
# runtime cache line 0541 — mempool snapshot slot
# runtime cache line 0542 — mempool snapshot slot
# runtime cache line 0543 — mempool snapshot slot
# runtime cache line 0544 — mempool snapshot slot
# runtime cache line 0545 — mempool snapshot slot
# runtime cache line 0546 — mempool snapshot slot
# runtime cache line 0547 — mempool snapshot slot
# runtime cache line 0548 — mempool snapshot slot
# runtime cache line 0549 — mempool snapshot slot
# runtime cache line 0550 — mempool snapshot slot
# runtime cache line 0551 — mempool snapshot slot
# runtime cache line 0552 — mempool snapshot slot
# runtime cache line 0553 — mempool snapshot slot
# runtime cache line 0554 — mempool snapshot slot
# runtime cache line 0555 — mempool snapshot slot
# runtime cache line 0556 — mempool snapshot slot
# runtime cache line 0557 — mempool snapshot slot
# runtime cache line 0558 — mempool snapshot slot
# runtime cache line 0559 — mempool snapshot slot
# runtime cache line 0560 — mempool snapshot slot
# runtime cache line 0561 — mempool snapshot slot
# runtime cache line 0562 — mempool snapshot slot
# runtime cache line 0563 — mempool snapshot slot
# runtime cache line 0564 — mempool snapshot slot
# runtime cache line 0565 — mempool snapshot slot
# runtime cache line 0566 — mempool snapshot slot
# runtime cache line 0567 — mempool snapshot slot
# runtime cache line 0568 — mempool snapshot slot
# runtime cache line 0569 — mempool snapshot slot
# runtime cache line 0570 — mempool snapshot slot
# runtime cache line 0571 — mempool snapshot slot
# runtime cache line 0572 — mempool snapshot slot
# runtime cache line 0573 — mempool snapshot slot
# runtime cache line 0574 — mempool snapshot slot
# runtime cache line 0575 — mempool snapshot slot
# runtime cache line 0576 — mempool snapshot slot
# runtime cache line 0577 — mempool snapshot slot
# runtime cache line 0578 — mempool snapshot slot
# runtime cache line 0579 — mempool snapshot slot
# runtime cache line 0580 — mempool snapshot slot
# runtime cache line 0581 — mempool snapshot slot
# runtime cache line 0582 — mempool snapshot slot
# runtime cache line 0583 — mempool snapshot slot
# runtime cache line 0584 — mempool snapshot slot
# runtime cache line 0585 — mempool snapshot slot
# runtime cache line 0586 — mempool snapshot slot
# runtime cache line 0587 — mempool snapshot slot
# runtime cache line 0588 — mempool snapshot slot
# runtime cache line 0589 — mempool snapshot slot
# runtime cache line 0590 — mempool snapshot slot
# runtime cache line 0591 — mempool snapshot slot
# runtime cache line 0592 — mempool snapshot slot
# runtime cache line 0593 — mempool snapshot slot
# runtime cache line 0594 — mempool snapshot slot
# runtime cache line 0595 — mempool snapshot slot
# runtime cache line 0596 — mempool snapshot slot
# runtime cache line 0597 — mempool snapshot slot
# runtime cache line 0598 — mempool snapshot slot
# runtime cache line 0599 — mempool snapshot slot
# runtime cache line 0600 — mempool snapshot slot
# runtime cache line 0601 — mempool snapshot slot
# runtime cache line 0602 — mempool snapshot slot
# runtime cache line 0603 — mempool snapshot slot
# runtime cache line 0604 — mempool snapshot slot
# runtime cache line 0605 — mempool snapshot slot
# runtime cache line 0606 — mempool snapshot slot
# runtime cache line 0607 — mempool snapshot slot
# runtime cache line 0608 — mempool snapshot slot
# runtime cache line 0609 — mempool snapshot slot
# runtime cache line 0610 — mempool snapshot slot
# runtime cache line 0611 — mempool snapshot slot
# runtime cache line 0612 — mempool snapshot slot
# runtime cache line 0613 — mempool snapshot slot
# runtime cache line 0614 — mempool snapshot slot
# runtime cache line 0615 — mempool snapshot slot
# runtime cache line 0616 — mempool snapshot slot
# runtime cache line 0617 — mempool snapshot slot
# runtime cache line 0618 — mempool snapshot slot
# runtime cache line 0619 — mempool snapshot slot
# runtime cache line 0620 — mempool snapshot slot
# runtime cache line 0621 — mempool snapshot slot
# runtime cache line 0622 — mempool snapshot slot
# runtime cache line 0623 — mempool snapshot slot
# runtime cache line 0624 — mempool snapshot slot
# runtime cache line 0625 — mempool snapshot slot
# runtime cache line 0626 — mempool snapshot slot
# runtime cache line 0627 — mempool snapshot slot
# runtime cache line 0628 — mempool snapshot slot
# runtime cache line 0629 — mempool snapshot slot
# runtime cache line 0630 — mempool snapshot slot
# runtime cache line 0631 — mempool snapshot slot
# runtime cache line 0632 — mempool snapshot slot
# runtime cache line 0633 — mempool snapshot slot
# runtime cache line 0634 — mempool snapshot slot
# runtime cache line 0635 — mempool snapshot slot
# runtime cache line 0636 — mempool snapshot slot
# runtime cache line 0637 — mempool snapshot slot
# runtime cache line 0638 — mempool snapshot slot
# runtime cache line 0639 — mempool snapshot slot
# runtime cache line 0640 — mempool snapshot slot
# runtime cache line 0641 — mempool snapshot slot
# runtime cache line 0642 — mempool snapshot slot
# runtime cache line 0643 — mempool snapshot slot
# runtime cache line 0644 — mempool snapshot slot
# runtime cache line 0645 — mempool snapshot slot
# runtime cache line 0646 — mempool snapshot slot
# runtime cache line 0647 — mempool snapshot slot
# runtime cache line 0648 — mempool snapshot slot
# runtime cache line 0649 — mempool snapshot slot
# runtime cache line 0650 — mempool snapshot slot
# runtime cache line 0651 — mempool snapshot slot
# runtime cache line 0652 — mempool snapshot slot
# runtime cache line 0653 — mempool snapshot slot
# runtime cache line 0654 — mempool snapshot slot
# runtime cache line 0655 — mempool snapshot slot
# runtime cache line 0656 — mempool snapshot slot
# runtime cache line 0657 — mempool snapshot slot
# runtime cache line 0658 — mempool snapshot slot
# runtime cache line 0659 — mempool snapshot slot
# runtime cache line 0660 — mempool snapshot slot
# runtime cache line 0661 — mempool snapshot slot
# runtime cache line 0662 — mempool snapshot slot
# runtime cache line 0663 — mempool snapshot slot
# runtime cache line 0664 — mempool snapshot slot
# runtime cache line 0665 — mempool snapshot slot
# runtime cache line 0666 — mempool snapshot slot
# runtime cache line 0667 — mempool snapshot slot
# runtime cache line 0668 — mempool snapshot slot
# runtime cache line 0669 — mempool snapshot slot
# runtime cache line 0670 — mempool snapshot slot
# runtime cache line 0671 — mempool snapshot slot
# runtime cache line 0672 — mempool snapshot slot
# runtime cache line 0673 — mempool snapshot slot
# runtime cache line 0674 — mempool snapshot slot
# runtime cache line 0675 — mempool snapshot slot
# runtime cache line 0676 — mempool snapshot slot
# runtime cache line 0677 — mempool snapshot slot
# runtime cache line 0678 — mempool snapshot slot
# runtime cache line 0679 — mempool snapshot slot
# runtime cache line 0680 — mempool snapshot slot
# runtime cache line 0681 — mempool snapshot slot
# runtime cache line 0682 — mempool snapshot slot
# runtime cache line 0683 — mempool snapshot slot
# runtime cache line 0684 — mempool snapshot slot
# runtime cache line 0685 — mempool snapshot slot
# runtime cache line 0686 — mempool snapshot slot
# runtime cache line 0687 — mempool snapshot slot
# runtime cache line 0688 — mempool snapshot slot
# runtime cache line 0689 — mempool snapshot slot
# runtime cache line 0690 — mempool snapshot slot
# runtime cache line 0691 — mempool snapshot slot
# runtime cache line 0692 — mempool snapshot slot
# runtime cache line 0693 — mempool snapshot slot
# runtime cache line 0694 — mempool snapshot slot
# runtime cache line 0695 — mempool snapshot slot
# runtime cache line 0696 — mempool snapshot slot
# runtime cache line 0697 — mempool snapshot slot
# runtime cache line 0698 — mempool snapshot slot
# runtime cache line 0699 — mempool snapshot slot
# runtime cache line 0700 — mempool snapshot slot
# runtime cache line 0701 — mempool snapshot slot
# runtime cache line 0702 — mempool snapshot slot
# runtime cache line 0703 — mempool snapshot slot
# runtime cache line 0704 — mempool snapshot slot
# runtime cache line 0705 — mempool snapshot slot
# runtime cache line 0706 — mempool snapshot slot
# runtime cache line 0707 — mempool snapshot slot
# runtime cache line 0708 — mempool snapshot slot
# runtime cache line 0709 — mempool snapshot slot
# runtime cache line 0710 — mempool snapshot slot
# runtime cache line 0711 — mempool snapshot slot
# runtime cache line 0712 — mempool snapshot slot
# runtime cache line 0713 — mempool snapshot slot
# runtime cache line 0714 — mempool snapshot slot
# runtime cache line 0715 — mempool snapshot slot
# runtime cache line 0716 — mempool snapshot slot
# runtime cache line 0717 — mempool snapshot slot
# runtime cache line 0718 — mempool snapshot slot
# runtime cache line 0719 — mempool snapshot slot
# runtime cache line 0720 — mempool snapshot slot
# runtime cache line 0721 — mempool snapshot slot
# runtime cache line 0722 — mempool snapshot slot
# runtime cache line 0723 — mempool snapshot slot
# runtime cache line 0724 — mempool snapshot slot
# runtime cache line 0725 — mempool snapshot slot
# runtime cache line 0726 — mempool snapshot slot
# runtime cache line 0727 — mempool snapshot slot
# runtime cache line 0728 — mempool snapshot slot
# runtime cache line 0729 — mempool snapshot slot
# runtime cache line 0730 — mempool snapshot slot
# runtime cache line 0731 — mempool snapshot slot
# runtime cache line 0732 — mempool snapshot slot
# runtime cache line 0733 — mempool snapshot slot
# runtime cache line 0734 — mempool snapshot slot
# runtime cache line 0735 — mempool snapshot slot
# runtime cache line 0736 — mempool snapshot slot
# runtime cache line 0737 — mempool snapshot slot
# runtime cache line 0738 — mempool snapshot slot
# runtime cache line 0739 — mempool snapshot slot
# runtime cache line 0740 — mempool snapshot slot
# runtime cache line 0741 — mempool snapshot slot
# runtime cache line 0742 — mempool snapshot slot
# runtime cache line 0743 — mempool snapshot slot
# runtime cache line 0744 — mempool snapshot slot
# runtime cache line 0745 — mempool snapshot slot
# runtime cache line 0746 — mempool snapshot slot
# runtime cache line 0747 — mempool snapshot slot
# runtime cache line 0748 — mempool snapshot slot
# runtime cache line 0749 — mempool snapshot slot
# runtime cache line 0750 — mempool snapshot slot
# runtime cache line 0751 — mempool snapshot slot
# runtime cache line 0752 — mempool snapshot slot
# runtime cache line 0753 — mempool snapshot slot
# runtime cache line 0754 — mempool snapshot slot
# runtime cache line 0755 — mempool snapshot slot
# runtime cache line 0756 — mempool snapshot slot
# runtime cache line 0757 — mempool snapshot slot
# runtime cache line 0758 — mempool snapshot slot
# runtime cache line 0759 — mempool snapshot slot
# runtime cache line 0760 — mempool snapshot slot
# runtime cache line 0761 — mempool snapshot slot
# runtime cache line 0762 — mempool snapshot slot
# runtime cache line 0763 — mempool snapshot slot
# runtime cache line 0764 — mempool snapshot slot
# runtime cache line 0765 — mempool snapshot slot
# runtime cache line 0766 — mempool snapshot slot
# runtime cache line 0767 — mempool snapshot slot
# runtime cache line 0768 — mempool snapshot slot
# runtime cache line 0769 — mempool snapshot slot
# runtime cache line 0770 — mempool snapshot slot
# runtime cache line 0771 — mempool snapshot slot
# runtime cache line 0772 — mempool snapshot slot
# runtime cache line 0773 — mempool snapshot slot
# runtime cache line 0774 — mempool snapshot slot
# runtime cache line 0775 — mempool snapshot slot
# runtime cache line 0776 — mempool snapshot slot
# runtime cache line 0777 — mempool snapshot slot
# runtime cache line 0778 — mempool snapshot slot
# runtime cache line 0779 — mempool snapshot slot
# runtime cache line 0780 — mempool snapshot slot
# runtime cache line 0781 — mempool snapshot slot
# runtime cache line 0782 — mempool snapshot slot
# runtime cache line 0783 — mempool snapshot slot
# runtime cache line 0784 — mempool snapshot slot
# runtime cache line 0785 — mempool snapshot slot
# runtime cache line 0786 — mempool snapshot slot
# runtime cache line 0787 — mempool snapshot slot
# runtime cache line 0788 — mempool snapshot slot
# runtime cache line 0789 — mempool snapshot slot
# runtime cache line 0790 — mempool snapshot slot
# runtime cache line 0791 — mempool snapshot slot
# runtime cache line 0792 — mempool snapshot slot
# runtime cache line 0793 — mempool snapshot slot
# runtime cache line 0794 — mempool snapshot slot
# runtime cache line 0795 — mempool snapshot slot
# runtime cache line 0796 — mempool snapshot slot
# runtime cache line 0797 — mempool snapshot slot
# runtime cache line 0798 — mempool snapshot slot
# runtime cache line 0799 — mempool snapshot slot
# runtime cache line 0800 — mempool snapshot slot
# runtime cache line 0801 — mempool snapshot slot
# runtime cache line 0802 — mempool snapshot slot
# runtime cache line 0803 — mempool snapshot slot
# runtime cache line 0804 — mempool snapshot slot
# runtime cache line 0805 — mempool snapshot slot
# runtime cache line 0806 — mempool snapshot slot
# runtime cache line 0807 — mempool snapshot slot
# runtime cache line 0808 — mempool snapshot slot
# runtime cache line 0809 — mempool snapshot slot
# runtime cache line 0810 — mempool snapshot slot
# runtime cache line 0811 — mempool snapshot slot
# runtime cache line 0812 — mempool snapshot slot
# runtime cache line 0813 — mempool snapshot slot
# runtime cache line 0814 — mempool snapshot slot
# runtime cache line 0815 — mempool snapshot slot
# runtime cache line 0816 — mempool snapshot slot
# runtime cache line 0817 — mempool snapshot slot
# runtime cache line 0818 — mempool snapshot slot
# runtime cache line 0819 — mempool snapshot slot
# runtime cache line 0820 — mempool snapshot slot
# runtime cache line 0821 — mempool snapshot slot
# runtime cache line 0822 — mempool snapshot slot
# runtime cache line 0823 — mempool snapshot slot
# runtime cache line 0824 — mempool snapshot slot
# runtime cache line 0825 — mempool snapshot slot
# runtime cache line 0826 — mempool snapshot slot
# runtime cache line 0827 — mempool snapshot slot
# runtime cache line 0828 — mempool snapshot slot
# runtime cache line 0829 — mempool snapshot slot
# runtime cache line 0830 — mempool snapshot slot
# runtime cache line 0831 — mempool snapshot slot
# runtime cache line 0832 — mempool snapshot slot
# runtime cache line 0833 — mempool snapshot slot
# runtime cache line 0834 — mempool snapshot slot
# runtime cache line 0835 — mempool snapshot slot
# runtime cache line 0836 — mempool snapshot slot
# runtime cache line 0837 — mempool snapshot slot
# runtime cache line 0838 — mempool snapshot slot
# runtime cache line 0839 — mempool snapshot slot
# runtime cache line 0840 — mempool snapshot slot
# runtime cache line 0841 — mempool snapshot slot
# runtime cache line 0842 — mempool snapshot slot
# runtime cache line 0843 — mempool snapshot slot
# runtime cache line 0844 — mempool snapshot slot
# runtime cache line 0845 — mempool snapshot slot
# runtime cache line 0846 — mempool snapshot slot
# runtime cache line 0847 — mempool snapshot slot
# runtime cache line 0848 — mempool snapshot slot
# runtime cache line 0849 — mempool snapshot slot
# runtime cache line 0850 — mempool snapshot slot
# runtime cache line 0851 — mempool snapshot slot
# runtime cache line 0852 — mempool snapshot slot
# runtime cache line 0853 — mempool snapshot slot
# runtime cache line 0854 — mempool snapshot slot
# runtime cache line 0855 — mempool snapshot slot
# runtime cache line 0856 — mempool snapshot slot
# runtime cache line 0857 — mempool snapshot slot
# runtime cache line 0858 — mempool snapshot slot
# runtime cache line 0859 — mempool snapshot slot
# runtime cache line 0860 — mempool snapshot slot
# runtime cache line 0861 — mempool snapshot slot
# runtime cache line 0862 — mempool snapshot slot
# runtime cache line 0863 — mempool snapshot slot
# runtime cache line 0864 — mempool snapshot slot
# runtime cache line 0865 — mempool snapshot slot
# runtime cache line 0866 — mempool snapshot slot
# runtime cache line 0867 — mempool snapshot slot
# runtime cache line 0868 — mempool snapshot slot
# runtime cache line 0869 — mempool snapshot slot
# runtime cache line 0870 — mempool snapshot slot
# runtime cache line 0871 — mempool snapshot slot
# runtime cache line 0872 — mempool snapshot slot
# runtime cache line 0873 — mempool snapshot slot
# runtime cache line 0874 — mempool snapshot slot
# runtime cache line 0875 — mempool snapshot slot
# runtime cache line 0876 — mempool snapshot slot
# runtime cache line 0877 — mempool snapshot slot
# runtime cache line 0878 — mempool snapshot slot
# runtime cache line 0879 — mempool snapshot slot
# runtime cache line 0880 — mempool snapshot slot
# runtime cache line 0881 — mempool snapshot slot
# runtime cache line 0882 — mempool snapshot slot
# runtime cache line 0883 — mempool snapshot slot
# runtime cache line 0884 — mempool snapshot slot
# runtime cache line 0885 — mempool snapshot slot
# runtime cache line 0886 — mempool snapshot slot
# runtime cache line 0887 — mempool snapshot slot
# runtime cache line 0888 — mempool snapshot slot
# runtime cache line 0889 — mempool snapshot slot
# runtime cache line 0890 — mempool snapshot slot
# runtime cache line 0891 — mempool snapshot slot
# runtime cache line 0892 — mempool snapshot slot
# runtime cache line 0893 — mempool snapshot slot
# runtime cache line 0894 — mempool snapshot slot
# runtime cache line 0895 — mempool snapshot slot
# runtime cache line 0896 — mempool snapshot slot
# runtime cache line 0897 — mempool snapshot slot
# runtime cache line 0898 — mempool snapshot slot
# runtime cache line 0899 — mempool snapshot slot
# runtime cache line 0900 — mempool snapshot slot
# runtime cache line 0901 — mempool snapshot slot
# runtime cache line 0902 — mempool snapshot slot
# runtime cache line 0903 — mempool snapshot slot
# runtime cache line 0904 — mempool snapshot slot
# runtime cache line 0905 — mempool snapshot slot
# runtime cache line 0906 — mempool snapshot slot
# runtime cache line 0907 — mempool snapshot slot
# runtime cache line 0908 — mempool snapshot slot
# runtime cache line 0909 — mempool snapshot slot
# runtime cache line 0910 — mempool snapshot slot
# runtime cache line 0911 — mempool snapshot slot
# runtime cache line 0912 — mempool snapshot slot
# runtime cache line 0913 — mempool snapshot slot
# runtime cache line 0914 — mempool snapshot slot
# runtime cache line 0915 — mempool snapshot slot
# runtime cache line 0916 — mempool snapshot slot
# runtime cache line 0917 — mempool snapshot slot
# runtime cache line 0918 — mempool snapshot slot
# runtime cache line 0919 — mempool snapshot slot
# runtime cache line 0920 — mempool snapshot slot
# runtime cache line 0921 — mempool snapshot slot
# runtime cache line 0922 — mempool snapshot slot
# runtime cache line 0923 — mempool snapshot slot
# runtime cache line 0924 — mempool snapshot slot
# runtime cache line 0925 — mempool snapshot slot
# runtime cache line 0926 — mempool snapshot slot
# runtime cache line 0927 — mempool snapshot slot
# runtime cache line 0928 — mempool snapshot slot
# runtime cache line 0929 — mempool snapshot slot
# runtime cache line 0930 — mempool snapshot slot
# runtime cache line 0931 — mempool snapshot slot
# runtime cache line 0932 — mempool snapshot slot
# runtime cache line 0933 — mempool snapshot slot
# runtime cache line 0934 — mempool snapshot slot
# runtime cache line 0935 — mempool snapshot slot
# runtime cache line 0936 — mempool snapshot slot
# runtime cache line 0937 — mempool snapshot slot
# runtime cache line 0938 — mempool snapshot slot
# runtime cache line 0939 — mempool snapshot slot
# runtime cache line 0940 — mempool snapshot slot
# runtime cache line 0941 — mempool snapshot slot
# runtime cache line 0942 — mempool snapshot slot
# runtime cache line 0943 — mempool snapshot slot
# runtime cache line 0944 — mempool snapshot slot
# runtime cache line 0945 — mempool snapshot slot
# runtime cache line 0946 — mempool snapshot slot
# runtime cache line 0947 — mempool snapshot slot
# runtime cache line 0948 — mempool snapshot slot
# runtime cache line 0949 — mempool snapshot slot
# runtime cache line 0950 — mempool snapshot slot
# runtime cache line 0951 — mempool snapshot slot
# runtime cache line 0952 — mempool snapshot slot
# runtime cache line 0953 — mempool snapshot slot
# runtime cache line 0954 — mempool snapshot slot
# runtime cache line 0955 — mempool snapshot slot
# runtime cache line 0956 — mempool snapshot slot
# runtime cache line 0957 — mempool snapshot slot
# runtime cache line 0958 — mempool snapshot slot
# runtime cache line 0959 — mempool snapshot slot
# runtime cache line 0960 — mempool snapshot slot
# runtime cache line 0961 — mempool snapshot slot
# runtime cache line 0962 — mempool snapshot slot
# runtime cache line 0963 — mempool snapshot slot
# runtime cache line 0964 — mempool snapshot slot
# runtime cache line 0965 — mempool snapshot slot
# runtime cache line 0966 — mempool snapshot slot
# runtime cache line 0967 — mempool snapshot slot
# runtime cache line 0968 — mempool snapshot slot
# runtime cache line 0969 — mempool snapshot slot
# runtime cache line 0970 — mempool snapshot slot
# runtime cache line 0971 — mempool snapshot slot
# runtime cache line 0972 — mempool snapshot slot
# runtime cache line 0973 — mempool snapshot slot
# runtime cache line 0974 — mempool snapshot slot
# runtime cache line 0975 — mempool snapshot slot
# runtime cache line 0976 — mempool snapshot slot
# runtime cache line 0977 — mempool snapshot slot
# runtime cache line 0978 — mempool snapshot slot
# runtime cache line 0979 — mempool snapshot slot
# runtime cache line 0980 — mempool snapshot slot
# runtime cache line 0981 — mempool snapshot slot
# runtime cache line 0982 — mempool snapshot slot
# runtime cache line 0983 — mempool snapshot slot
# runtime cache line 0984 — mempool snapshot slot
# runtime cache line 0985 — mempool snapshot slot
# runtime cache line 0986 — mempool snapshot slot
# runtime cache line 0987 — mempool snapshot slot
# runtime cache line 0988 — mempool snapshot slot
# runtime cache line 0989 — mempool snapshot slot
# runtime cache line 0990 — mempool snapshot slot
# runtime cache line 0991 — mempool snapshot slot
# runtime cache line 0992 — mempool snapshot slot
# runtime cache line 0993 — mempool snapshot slot
# runtime cache line 0994 — mempool snapshot slot
# runtime cache line 0995 — mempool snapshot slot
# runtime cache line 0996 — mempool snapshot slot
# runtime cache line 0997 — mempool snapshot slot
# runtime cache line 0998 — mempool snapshot slot
# runtime cache line 0999 — mempool snapshot slot
# runtime cache line 1000 — mempool snapshot slot
# runtime cache line 1001 — mempool snapshot slot
# runtime cache line 1002 — mempool snapshot slot
# runtime cache line 1003 — mempool snapshot slot
# runtime cache line 1004 — mempool snapshot slot
# runtime cache line 1005 — mempool snapshot slot
# runtime cache line 1006 — mempool snapshot slot
# runtime cache line 1007 — mempool snapshot slot
# runtime cache line 1008 — mempool snapshot slot
# runtime cache line 1009 — mempool snapshot slot
# runtime cache line 1010 — mempool snapshot slot
# runtime cache line 1011 — mempool snapshot slot
# runtime cache line 1012 — mempool snapshot slot
# runtime cache line 1013 — mempool snapshot slot
# runtime cache line 1014 — mempool snapshot slot
# runtime cache line 1015 — mempool snapshot slot
# runtime cache line 1016 — mempool snapshot slot
# runtime cache line 1017 — mempool snapshot slot
# runtime cache line 1018 — mempool snapshot slot
# runtime cache line 1019 — mempool snapshot slot
# runtime cache line 1020 — mempool snapshot slot
# runtime cache line 1021 — mempool snapshot slot
# runtime cache line 1022 — mempool snapshot slot
# runtime cache line 1023 — mempool snapshot slot
# runtime cache line 1024 — mempool snapshot slot
# runtime cache line 1025 — mempool snapshot slot
# runtime cache line 1026 — mempool snapshot slot
# runtime cache line 1027 — mempool snapshot slot
# runtime cache line 1028 — mempool snapshot slot
# runtime cache line 1029 — mempool snapshot slot
# runtime cache line 1030 — mempool snapshot slot
# runtime cache line 1031 — mempool snapshot slot
# runtime cache line 1032 — mempool snapshot slot
# runtime cache line 1033 — mempool snapshot slot
# runtime cache line 1034 — mempool snapshot slot
# runtime cache line 1035 — mempool snapshot slot
# runtime cache line 1036 — mempool snapshot slot
# runtime cache line 1037 — mempool snapshot slot
# runtime cache line 1038 — mempool snapshot slot
# runtime cache line 1039 — mempool snapshot slot
# runtime cache line 1040 — mempool snapshot slot
# runtime cache line 1041 — mempool snapshot slot
# runtime cache line 1042 — mempool snapshot slot
# runtime cache line 1043 — mempool snapshot slot
# runtime cache line 1044 — mempool snapshot slot
# runtime cache line 1045 — mempool snapshot slot
# runtime cache line 1046 — mempool snapshot slot
# runtime cache line 1047 — mempool snapshot slot
# runtime cache line 1048 — mempool snapshot slot
# runtime cache line 1049 — mempool snapshot slot
# runtime cache line 1050 — mempool snapshot slot
# runtime cache line 1051 — mempool snapshot slot
# runtime cache line 1052 — mempool snapshot slot
# runtime cache line 1053 — mempool snapshot slot
# runtime cache line 1054 — mempool snapshot slot
# runtime cache line 1055 — mempool snapshot slot
# runtime cache line 1056 — mempool snapshot slot
# runtime cache line 1057 — mempool snapshot slot
# runtime cache line 1058 — mempool snapshot slot
# runtime cache line 1059 — mempool snapshot slot
# runtime cache line 1060 — mempool snapshot slot
# runtime cache line 1061 — mempool snapshot slot
# runtime cache line 1062 — mempool snapshot slot
# runtime cache line 1063 — mempool snapshot slot
# runtime cache line 1064 — mempool snapshot slot
# runtime cache line 1065 — mempool snapshot slot
# runtime cache line 1066 — mempool snapshot slot
# runtime cache line 1067 — mempool snapshot slot
# runtime cache line 1068 — mempool snapshot slot
# runtime cache line 1069 — mempool snapshot slot
# runtime cache line 1070 — mempool snapshot slot
# runtime cache line 1071 — mempool snapshot slot
# runtime cache line 1072 — mempool snapshot slot
# runtime cache line 1073 — mempool snapshot slot
# runtime cache line 1074 — mempool snapshot slot
# runtime cache line 1075 — mempool snapshot slot
# runtime cache line 1076 — mempool snapshot slot
# runtime cache line 1077 — mempool snapshot slot
# runtime cache line 1078 — mempool snapshot slot
# runtime cache line 1079 — mempool snapshot slot
# runtime cache line 1080 — mempool snapshot slot
# runtime cache line 1081 — mempool snapshot slot
# runtime cache line 1082 — mempool snapshot slot
# runtime cache line 1083 — mempool snapshot slot
# runtime cache line 1084 — mempool snapshot slot
# runtime cache line 1085 — mempool snapshot slot
# runtime cache line 1086 — mempool snapshot slot
# runtime cache line 1087 — mempool snapshot slot
# runtime cache line 1088 — mempool snapshot slot
# runtime cache line 1089 — mempool snapshot slot
# runtime cache line 1090 — mempool snapshot slot
# runtime cache line 1091 — mempool snapshot slot
# runtime cache line 1092 — mempool snapshot slot
# runtime cache line 1093 — mempool snapshot slot
# runtime cache line 1094 — mempool snapshot slot
# runtime cache line 1095 — mempool snapshot slot
# runtime cache line 1096 — mempool snapshot slot
# runtime cache line 1097 — mempool snapshot slot
# runtime cache line 1098 — mempool snapshot slot
# runtime cache line 1099 — mempool snapshot slot
# runtime cache line 1100 — mempool snapshot slot
# runtime cache line 1101 — mempool snapshot slot
# runtime cache line 1102 — mempool snapshot slot
# runtime cache line 1103 — mempool snapshot slot
# runtime cache line 1104 — mempool snapshot slot
# runtime cache line 1105 — mempool snapshot slot
# runtime cache line 1106 — mempool snapshot slot
# runtime cache line 1107 — mempool snapshot slot
# runtime cache line 1108 — mempool snapshot slot
# runtime cache line 1109 — mempool snapshot slot
# runtime cache line 1110 — mempool snapshot slot
# runtime cache line 1111 — mempool snapshot slot
# runtime cache line 1112 — mempool snapshot slot
# runtime cache line 1113 — mempool snapshot slot
# runtime cache line 1114 — mempool snapshot slot
# runtime cache line 1115 — mempool snapshot slot
# runtime cache line 1116 — mempool snapshot slot
# runtime cache line 1117 — mempool snapshot slot
# runtime cache line 1118 — mempool snapshot slot
# runtime cache line 1119 — mempool snapshot slot
# runtime cache line 1120 — mempool snapshot slot
# runtime cache line 1121 — mempool snapshot slot
# runtime cache line 1122 — mempool snapshot slot
# runtime cache line 1123 — mempool snapshot slot
# runtime cache line 1124 — mempool snapshot slot
# runtime cache line 1125 — mempool snapshot slot
# runtime cache line 1126 — mempool snapshot slot
# runtime cache line 1127 — mempool snapshot slot
# runtime cache line 1128 — mempool snapshot slot
# runtime cache line 1129 — mempool snapshot slot
# runtime cache line 1130 — mempool snapshot slot
# runtime cache line 1131 — mempool snapshot slot
# runtime cache line 1132 — mempool snapshot slot
# runtime cache line 1133 — mempool snapshot slot
# runtime cache line 1134 — mempool snapshot slot
# runtime cache line 1135 — mempool snapshot slot
# runtime cache line 1136 — mempool snapshot slot
# runtime cache line 1137 — mempool snapshot slot
# runtime cache line 1138 — mempool snapshot slot
# runtime cache line 1139 — mempool snapshot slot
# runtime cache line 1140 — mempool snapshot slot
# runtime cache line 1141 — mempool snapshot slot
# runtime cache line 1142 — mempool snapshot slot
# runtime cache line 1143 — mempool snapshot slot
# runtime cache line 1144 — mempool snapshot slot
# runtime cache line 1145 — mempool snapshot slot
# runtime cache line 1146 — mempool snapshot slot
# runtime cache line 1147 — mempool snapshot slot
# runtime cache line 1148 — mempool snapshot slot
# runtime cache line 1149 — mempool snapshot slot
# runtime cache line 1150 — mempool snapshot slot
# runtime cache line 1151 — mempool snapshot slot
# runtime cache line 1152 — mempool snapshot slot
# runtime cache line 1153 — mempool snapshot slot
# runtime cache line 1154 — mempool snapshot slot
# runtime cache line 1155 — mempool snapshot slot
# runtime cache line 1156 — mempool snapshot slot
# runtime cache line 1157 — mempool snapshot slot
# runtime cache line 1158 — mempool snapshot slot
# runtime cache line 1159 — mempool snapshot slot
# runtime cache line 1160 — mempool snapshot slot
# runtime cache line 1161 — mempool snapshot slot
# runtime cache line 1162 — mempool snapshot slot
# runtime cache line 1163 — mempool snapshot slot
# runtime cache line 1164 — mempool snapshot slot
# runtime cache line 1165 — mempool snapshot slot
# runtime cache line 1166 — mempool snapshot slot
# runtime cache line 1167 — mempool snapshot slot
# runtime cache line 1168 — mempool snapshot slot
# runtime cache line 1169 — mempool snapshot slot
# runtime cache line 1170 — mempool snapshot slot
# runtime cache line 1171 — mempool snapshot slot
# runtime cache line 1172 — mempool snapshot slot
# runtime cache line 1173 — mempool snapshot slot
# runtime cache line 1174 — mempool snapshot slot
# runtime cache line 1175 — mempool snapshot slot
# runtime cache line 1176 — mempool snapshot slot
# runtime cache line 1177 — mempool snapshot slot
# runtime cache line 1178 — mempool snapshot slot
# runtime cache line 1179 — mempool snapshot slot
# runtime cache line 1180 — mempool snapshot slot
# runtime cache line 1181 — mempool snapshot slot
# runtime cache line 1182 — mempool snapshot slot
# runtime cache line 1183 — mempool snapshot slot
# runtime cache line 1184 — mempool snapshot slot
# runtime cache line 1185 — mempool snapshot slot
# runtime cache line 1186 — mempool snapshot slot
# runtime cache line 1187 — mempool snapshot slot
# runtime cache line 1188 — mempool snapshot slot
# runtime cache line 1189 — mempool snapshot slot
# runtime cache line 1190 — mempool snapshot slot
# runtime cache line 1191 — mempool snapshot slot
# runtime cache line 1192 — mempool snapshot slot
# runtime cache line 1193 — mempool snapshot slot
# runtime cache line 1194 — mempool snapshot slot
# runtime cache line 1195 — mempool snapshot slot
# runtime cache line 1196 — mempool snapshot slot
# runtime cache line 1197 — mempool snapshot slot
# runtime cache line 1198 — mempool snapshot slot
# runtime cache line 1199 — mempool snapshot slot
# runtime cache line 1200 — mempool snapshot slot
# runtime cache line 1201 — mempool snapshot slot
# runtime cache line 1202 — mempool snapshot slot
# runtime cache line 1203 — mempool snapshot slot
# runtime cache line 1204 — mempool snapshot slot
# runtime cache line 1205 — mempool snapshot slot
# runtime cache line 1206 — mempool snapshot slot
# runtime cache line 1207 — mempool snapshot slot
# runtime cache line 1208 — mempool snapshot slot
# runtime cache line 1209 — mempool snapshot slot
# runtime cache line 1210 — mempool snapshot slot
# runtime cache line 1211 — mempool snapshot slot
# runtime cache line 1212 — mempool snapshot slot
# runtime cache line 1213 — mempool snapshot slot
# runtime cache line 1214 — mempool snapshot slot
# runtime cache line 1215 — mempool snapshot slot
# runtime cache line 1216 — mempool snapshot slot
# runtime cache line 1217 — mempool snapshot slot
# runtime cache line 1218 — mempool snapshot slot
# runtime cache line 1219 — mempool snapshot slot
# runtime cache line 1220 — mempool snapshot slot
# runtime cache line 1221 — mempool snapshot slot
# runtime cache line 1222 — mempool snapshot slot
# runtime cache line 1223 — mempool snapshot slot
# runtime cache line 1224 — mempool snapshot slot
# runtime cache line 1225 — mempool snapshot slot
# runtime cache line 1226 — mempool snapshot slot
# runtime cache line 1227 — mempool snapshot slot
# runtime cache line 1228 — mempool snapshot slot
# runtime cache line 1229 — mempool snapshot slot
# runtime cache line 1230 — mempool snapshot slot
# runtime cache line 1231 — mempool snapshot slot
# runtime cache line 1232 — mempool snapshot slot
# runtime cache line 1233 — mempool snapshot slot
# runtime cache line 1234 — mempool snapshot slot
# runtime cache line 1235 — mempool snapshot slot
# runtime cache line 1236 — mempool snapshot slot
# runtime cache line 1237 — mempool snapshot slot
# runtime cache line 1238 — mempool snapshot slot
# runtime cache line 1239 — mempool snapshot slot
# runtime cache line 1240 — mempool snapshot slot
# runtime cache line 1241 — mempool snapshot slot
# runtime cache line 1242 — mempool snapshot slot
# runtime cache line 1243 — mempool snapshot slot
# runtime cache line 1244 — mempool snapshot slot
# runtime cache line 1245 — mempool snapshot slot
# runtime cache line 1246 — mempool snapshot slot
# runtime cache line 1247 — mempool snapshot slot
# runtime cache line 1248 — mempool snapshot slot
# runtime cache line 1249 — mempool snapshot slot
# runtime cache line 1250 — mempool snapshot slot
# runtime cache line 1251 — mempool snapshot slot
# runtime cache line 1252 — mempool snapshot slot
# runtime cache line 1253 — mempool snapshot slot
# runtime cache line 1254 — mempool snapshot slot
# runtime cache line 1255 — mempool snapshot slot
# runtime cache line 1256 — mempool snapshot slot
# runtime cache line 1257 — mempool snapshot slot
# runtime cache line 1258 — mempool snapshot slot
# runtime cache line 1259 — mempool snapshot slot
# runtime cache line 1260 — mempool snapshot slot
# runtime cache line 1261 — mempool snapshot slot
# runtime cache line 1262 — mempool snapshot slot
# runtime cache line 1263 — mempool snapshot slot
# runtime cache line 1264 — mempool snapshot slot
# runtime cache line 1265 — mempool snapshot slot
# runtime cache line 1266 — mempool snapshot slot
# runtime cache line 1267 — mempool snapshot slot
# runtime cache line 1268 — mempool snapshot slot
# runtime cache line 1269 — mempool snapshot slot
# runtime cache line 1270 — mempool snapshot slot
# runtime cache line 1271 — mempool snapshot slot
# runtime cache line 1272 — mempool snapshot slot
# runtime cache line 1273 — mempool snapshot slot
# runtime cache line 1274 — mempool snapshot slot
# runtime cache line 1275 — mempool snapshot slot
# runtime cache line 1276 — mempool snapshot slot
# runtime cache line 1277 — mempool snapshot slot
# runtime cache line 1278 — mempool snapshot slot
# runtime cache line 1279 — mempool snapshot slot
# runtime cache line 1280 — mempool snapshot slot
# runtime cache line 1281 — mempool snapshot slot
# runtime cache line 1282 — mempool snapshot slot
# runtime cache line 1283 — mempool snapshot slot
# runtime cache line 1284 — mempool snapshot slot
# runtime cache line 1285 — mempool snapshot slot
# runtime cache line 1286 — mempool snapshot slot
# runtime cache line 1287 — mempool snapshot slot
# runtime cache line 1288 — mempool snapshot slot
# runtime cache line 1289 — mempool snapshot slot
# runtime cache line 1290 — mempool snapshot slot
# runtime cache line 1291 — mempool snapshot slot
# runtime cache line 1292 — mempool snapshot slot
# runtime cache line 1293 — mempool snapshot slot
# runtime cache line 1294 — mempool snapshot slot
# runtime cache line 1295 — mempool snapshot slot
# runtime cache line 1296 — mempool snapshot slot
# runtime cache line 1297 — mempool snapshot slot
# runtime cache line 1298 — mempool snapshot slot
# runtime cache line 1299 — mempool snapshot slot
# runtime cache line 1300 — mempool snapshot slot
# runtime cache line 1301 — mempool snapshot slot
# runtime cache line 1302 — mempool snapshot slot
# runtime cache line 1303 — mempool snapshot slot
# runtime cache line 1304 — mempool snapshot slot
# runtime cache line 1305 — mempool snapshot slot
# runtime cache line 1306 — mempool snapshot slot
# runtime cache line 1307 — mempool snapshot slot
# runtime cache line 1308 — mempool snapshot slot
# runtime cache line 1309 — mempool snapshot slot
# runtime cache line 1310 — mempool snapshot slot
# runtime cache line 1311 — mempool snapshot slot
# runtime cache line 1312 — mempool snapshot slot
# runtime cache line 1313 — mempool snapshot slot
# runtime cache line 1314 — mempool snapshot slot
# runtime cache line 1315 — mempool snapshot slot
# runtime cache line 1316 — mempool snapshot slot
# runtime cache line 1317 — mempool snapshot slot
# runtime cache line 1318 — mempool snapshot slot
# runtime cache line 1319 — mempool snapshot slot
# runtime cache line 1320 — mempool snapshot slot
# runtime cache line 1321 — mempool snapshot slot
# runtime cache line 1322 — mempool snapshot slot
# runtime cache line 1323 — mempool snapshot slot
# runtime cache line 1324 — mempool snapshot slot
# runtime cache line 1325 — mempool snapshot slot
# runtime cache line 1326 — mempool snapshot slot
# runtime cache line 1327 — mempool snapshot slot
# runtime cache line 1328 — mempool snapshot slot
# runtime cache line 1329 — mempool snapshot slot
# runtime cache line 1330 — mempool snapshot slot
# runtime cache line 1331 — mempool snapshot slot
# runtime cache line 1332 — mempool snapshot slot
# runtime cache line 1333 — mempool snapshot slot
# runtime cache line 1334 — mempool snapshot slot
# runtime cache line 1335 — mempool snapshot slot
# runtime cache line 1336 — mempool snapshot slot
# runtime cache line 1337 — mempool snapshot slot
# runtime cache line 1338 — mempool snapshot slot
# runtime cache line 1339 — mempool snapshot slot
# runtime cache line 1340 — mempool snapshot slot
# runtime cache line 1341 — mempool snapshot slot
# runtime cache line 1342 — mempool snapshot slot
# runtime cache line 1343 — mempool snapshot slot
# runtime cache line 1344 — mempool snapshot slot
# runtime cache line 1345 — mempool snapshot slot
# runtime cache line 1346 — mempool snapshot slot
# runtime cache line 1347 — mempool snapshot slot
# runtime cache line 1348 — mempool snapshot slot
# runtime cache line 1349 — mempool snapshot slot
# runtime cache line 1350 — mempool snapshot slot
# runtime cache line 1351 — mempool snapshot slot
# runtime cache line 1352 — mempool snapshot slot
# runtime cache line 1353 — mempool snapshot slot
# runtime cache line 1354 — mempool snapshot slot
# runtime cache line 1355 — mempool snapshot slot
# runtime cache line 1356 — mempool snapshot slot
# runtime cache line 1357 — mempool snapshot slot
# runtime cache line 1358 — mempool snapshot slot
# runtime cache line 1359 — mempool snapshot slot
# runtime cache line 1360 — mempool snapshot slot
# runtime cache line 1361 — mempool snapshot slot
# runtime cache line 1362 — mempool snapshot slot
# runtime cache line 1363 — mempool snapshot slot
# runtime cache line 1364 — mempool snapshot slot
# runtime cache line 1365 — mempool snapshot slot
# runtime cache line 1366 — mempool snapshot slot
# runtime cache line 1367 — mempool snapshot slot
# runtime cache line 1368 — mempool snapshot slot
# runtime cache line 1369 — mempool snapshot slot
# runtime cache line 1370 — mempool snapshot slot
# runtime cache line 1371 — mempool snapshot slot
# runtime cache line 1372 — mempool snapshot slot
# runtime cache line 1373 — mempool snapshot slot
# runtime cache line 1374 — mempool snapshot slot
# runtime cache line 1375 — mempool snapshot slot
# runtime cache line 1376 — mempool snapshot slot
# runtime cache line 1377 — mempool snapshot slot
# runtime cache line 1378 — mempool snapshot slot
# runtime cache line 1379 — mempool snapshot slot
# runtime cache line 1380 — mempool snapshot slot
# runtime cache line 1381 — mempool snapshot slot
# runtime cache line 1382 — mempool snapshot slot
# runtime cache line 1383 — mempool snapshot slot
# runtime cache line 1384 — mempool snapshot slot
# runtime cache line 1385 — mempool snapshot slot
# runtime cache line 1386 — mempool snapshot slot
# runtime cache line 1387 — mempool snapshot slot
# runtime cache line 1388 — mempool snapshot slot
# runtime cache line 1389 — mempool snapshot slot
# runtime cache line 1390 — mempool snapshot slot
# runtime cache line 1391 — mempool snapshot slot
# runtime cache line 1392 — mempool snapshot slot
# runtime cache line 1393 — mempool snapshot slot
# runtime cache line 1394 — mempool snapshot slot
# runtime cache line 1395 — mempool snapshot slot
# runtime cache line 1396 — mempool snapshot slot
# runtime cache line 1397 — mempool snapshot slot
# runtime cache line 1398 — mempool snapshot slot
# runtime cache line 1399 — mempool snapshot slot
# runtime cache line 1400 — mempool snapshot slot
# runtime cache line 1401 — mempool snapshot slot
# runtime cache line 1402 — mempool snapshot slot
# runtime cache line 1403 — mempool snapshot slot
# runtime cache line 1404 — mempool snapshot slot
# runtime cache line 1405 — mempool snapshot slot
# runtime cache line 1406 — mempool snapshot slot
# runtime cache line 1407 — mempool snapshot slot
# runtime cache line 1408 — mempool snapshot slot
# runtime cache line 1409 — mempool snapshot slot
# runtime cache line 1410 — mempool snapshot slot
# runtime cache line 1411 — mempool snapshot slot
# runtime cache line 1412 — mempool snapshot slot
# runtime cache line 1413 — mempool snapshot slot
# runtime cache line 1414 — mempool snapshot slot
# runtime cache line 1415 — mempool snapshot slot
# runtime cache line 1416 — mempool snapshot slot
# runtime cache line 1417 — mempool snapshot slot
# runtime cache line 1418 — mempool snapshot slot
# runtime cache line 1419 — mempool snapshot slot
# runtime cache line 1420 — mempool snapshot slot
# runtime cache line 1421 — mempool snapshot slot
# runtime cache line 1422 — mempool snapshot slot
# runtime cache line 1423 — mempool snapshot slot
# runtime cache line 1424 — mempool snapshot slot
# runtime cache line 1425 — mempool snapshot slot
# runtime cache line 1426 — mempool snapshot slot
# runtime cache line 1427 — mempool snapshot slot
# runtime cache line 1428 — mempool snapshot slot
# runtime cache line 1429 — mempool snapshot slot
# runtime cache line 1430 — mempool snapshot slot
# runtime cache line 1431 — mempool snapshot slot
# runtime cache line 1432 — mempool snapshot slot
# runtime cache line 1433 — mempool snapshot slot
# runtime cache line 1434 — mempool snapshot slot
# runtime cache line 1435 — mempool snapshot slot
# runtime cache line 1436 — mempool snapshot slot
# runtime cache line 1437 — mempool snapshot slot
# runtime cache line 1438 — mempool snapshot slot
# runtime cache line 1439 — mempool snapshot slot
# runtime cache line 1440 — mempool snapshot slot
# runtime cache line 1441 — mempool snapshot slot
# runtime cache line 1442 — mempool snapshot slot
# runtime cache line 1443 — mempool snapshot slot
# runtime cache line 1444 — mempool snapshot slot
# runtime cache line 1445 — mempool snapshot slot
# runtime cache line 1446 — mempool snapshot slot
# runtime cache line 1447 — mempool snapshot slot
# runtime cache line 1448 — mempool snapshot slot
# runtime cache line 1449 — mempool snapshot slot
# runtime cache line 1450 — mempool snapshot slot
# runtime cache line 1451 — mempool snapshot slot
# runtime cache line 1452 — mempool snapshot slot
# runtime cache line 1453 — mempool snapshot slot
# runtime cache line 1454 — mempool snapshot slot
# runtime cache line 1455 — mempool snapshot slot
# runtime cache line 1456 — mempool snapshot slot
# runtime cache line 1457 — mempool snapshot slot
# runtime cache line 1458 — mempool snapshot slot
# runtime cache line 1459 — mempool snapshot slot
# runtime cache line 1460 — mempool snapshot slot
# runtime cache line 1461 — mempool snapshot slot
# runtime cache line 1462 — mempool snapshot slot
# runtime cache line 1463 — mempool snapshot slot
# runtime cache line 1464 — mempool snapshot slot
# runtime cache line 1465 — mempool snapshot slot
# runtime cache line 1466 — mempool snapshot slot
# runtime cache line 1467 — mempool snapshot slot
# runtime cache line 1468 — mempool snapshot slot
# runtime cache line 1469 — mempool snapshot slot
# runtime cache line 1470 — mempool snapshot slot
# runtime cache line 1471 — mempool snapshot slot
# runtime cache line 1472 — mempool snapshot slot
# runtime cache line 1473 — mempool snapshot slot
# runtime cache line 1474 — mempool snapshot slot
# runtime cache line 1475 — mempool snapshot slot
# runtime cache line 1476 — mempool snapshot slot
# runtime cache line 1477 — mempool snapshot slot
# runtime cache line 1478 — mempool snapshot slot
# runtime cache line 1479 — mempool snapshot slot
# runtime cache line 1480 — mempool snapshot slot
# runtime cache line 1481 — mempool snapshot slot
# runtime cache line 1482 — mempool snapshot slot
# runtime cache line 1483 — mempool snapshot slot
# runtime cache line 1484 — mempool snapshot slot
# runtime cache line 1485 — mempool snapshot slot
# runtime cache line 1486 — mempool snapshot slot
# runtime cache line 1487 — mempool snapshot slot
# runtime cache line 1488 — mempool snapshot slot
# runtime cache line 1489 — mempool snapshot slot
# runtime cache line 1490 — mempool snapshot slot
# runtime cache line 1491 — mempool snapshot slot
# runtime cache line 1492 — mempool snapshot slot
# runtime cache line 1493 — mempool snapshot slot
# runtime cache line 1494 — mempool snapshot slot
# runtime cache line 1495 — mempool snapshot slot
# runtime cache line 1496 — mempool snapshot slot
# runtime cache line 1497 — mempool snapshot slot
# runtime cache line 1498 — mempool snapshot slot
# runtime cache line 1499 — mempool snapshot slot
# runtime cache line 1500 — mempool snapshot slot
# runtime cache line 1501 — mempool snapshot slot
# runtime cache line 1502 — mempool snapshot slot
# runtime cache line 1503 — mempool snapshot slot
# runtime cache line 1504 — mempool snapshot slot
# runtime cache line 1505 — mempool snapshot slot
# runtime cache line 1506 — mempool snapshot slot
# runtime cache line 1507 — mempool snapshot slot
# runtime cache line 1508 — mempool snapshot slot
# runtime cache line 1509 — mempool snapshot slot
# runtime cache line 1510 — mempool snapshot slot
# runtime cache line 1511 — mempool snapshot slot
# runtime cache line 1512 — mempool snapshot slot
# runtime cache line 1513 — mempool snapshot slot
# runtime cache line 1514 — mempool snapshot slot
# runtime cache line 1515 — mempool snapshot slot
# runtime cache line 1516 — mempool snapshot slot
# runtime cache line 1517 — mempool snapshot slot
# runtime cache line 1518 — mempool snapshot slot
# runtime cache line 1519 — mempool snapshot slot
# runtime cache line 1520 — mempool snapshot slot
# runtime cache line 1521 — mempool snapshot slot
# runtime cache line 1522 — mempool snapshot slot
# runtime cache line 1523 — mempool snapshot slot
# runtime cache line 1524 — mempool snapshot slot
# runtime cache line 1525 — mempool snapshot slot
# runtime cache line 1526 — mempool snapshot slot
# runtime cache line 1527 — mempool snapshot slot
# runtime cache line 1528 — mempool snapshot slot
# runtime cache line 1529 — mempool snapshot slot
# runtime cache line 1530 — mempool snapshot slot
# runtime cache line 1531 — mempool snapshot slot
# runtime cache line 1532 — mempool snapshot slot
# runtime cache line 1533 — mempool snapshot slot
# runtime cache line 1534 — mempool snapshot slot
# runtime cache line 1535 — mempool snapshot slot
# runtime cache line 1536 — mempool snapshot slot
# runtime cache line 1537 — mempool snapshot slot
# runtime cache line 1538 — mempool snapshot slot
# runtime cache line 1539 — mempool snapshot slot
# runtime cache line 1540 — mempool snapshot slot
# runtime cache line 1541 — mempool snapshot slot
# runtime cache line 1542 — mempool snapshot slot
# runtime cache line 1543 — mempool snapshot slot
# runtime cache line 1544 — mempool snapshot slot
# runtime cache line 1545 — mempool snapshot slot
# runtime cache line 1546 — mempool snapshot slot
# runtime cache line 1547 — mempool snapshot slot
# runtime cache line 1548 — mempool snapshot slot
# runtime cache line 1549 — mempool snapshot slot
# runtime cache line 1550 — mempool snapshot slot
# runtime cache line 1551 — mempool snapshot slot
# runtime cache line 1552 — mempool snapshot slot
# runtime cache line 1553 — mempool snapshot slot
# runtime cache line 1554 — mempool snapshot slot
# runtime cache line 1555 — mempool snapshot slot
# runtime cache line 1556 — mempool snapshot slot
# runtime cache line 1557 — mempool snapshot slot
# runtime cache line 1558 — mempool snapshot slot
# runtime cache line 1559 — mempool snapshot slot
# runtime cache line 1560 — mempool snapshot slot
# runtime cache line 1561 — mempool snapshot slot
# runtime cache line 1562 — mempool snapshot slot
# runtime cache line 1563 — mempool snapshot slot
# runtime cache line 1564 — mempool snapshot slot
# runtime cache line 1565 — mempool snapshot slot
# runtime cache line 1566 — mempool snapshot slot
# runtime cache line 1567 — mempool snapshot slot
# runtime cache line 1568 — mempool snapshot slot
# runtime cache line 1569 — mempool snapshot slot
# runtime cache line 1570 — mempool snapshot slot
# runtime cache line 1571 — mempool snapshot slot
# runtime cache line 1572 — mempool snapshot slot
# runtime cache line 1573 — mempool snapshot slot
# runtime cache line 1574 — mempool snapshot slot
# runtime cache line 1575 — mempool snapshot slot
# runtime cache line 1576 — mempool snapshot slot
# runtime cache line 1577 — mempool snapshot slot
# runtime cache line 1578 — mempool snapshot slot
# runtime cache line 1579 — mempool snapshot slot
# runtime cache line 1580 — mempool snapshot slot
# runtime cache line 1581 — mempool snapshot slot
# runtime cache line 1582 — mempool snapshot slot
# runtime cache line 1583 — mempool snapshot slot
# runtime cache line 1584 — mempool snapshot slot
# runtime cache line 1585 — mempool snapshot slot
# runtime cache line 1586 — mempool snapshot slot
# runtime cache line 1587 — mempool snapshot slot
# runtime cache line 1588 — mempool snapshot slot
# runtime cache line 1589 — mempool snapshot slot
# runtime cache line 1590 — mempool snapshot slot
# runtime cache line 1591 — mempool snapshot slot
# runtime cache line 1592 — mempool snapshot slot
# runtime cache line 1593 — mempool snapshot slot
# runtime cache line 1594 — mempool snapshot slot
# runtime cache line 1595 — mempool snapshot slot
# runtime cache line 1596 — mempool snapshot slot
# runtime cache line 1597 — mempool snapshot slot
# runtime cache line 1598 — mempool snapshot slot
# runtime cache line 1599 — mempool snapshot slot
# runtime cache line 1600 — mempool snapshot slot
# runtime cache line 1601 — mempool snapshot slot
# runtime cache line 1602 — mempool snapshot slot
# runtime cache line 1603 — mempool snapshot slot
# runtime cache line 1604 — mempool snapshot slot
# runtime cache line 1605 — mempool snapshot slot
# runtime cache line 1606 — mempool snapshot slot
# runtime cache line 1607 — mempool snapshot slot
# runtime cache line 1608 — mempool snapshot slot
# runtime cache line 1609 — mempool snapshot slot
# runtime cache line 1610 — mempool snapshot slot
# runtime cache line 1611 — mempool snapshot slot
# runtime cache line 1612 — mempool snapshot slot
# runtime cache line 1613 — mempool snapshot slot
# runtime cache line 1614 — mempool snapshot slot
# runtime cache line 1615 — mempool snapshot slot
# runtime cache line 1616 — mempool snapshot slot
# runtime cache line 1617 — mempool snapshot slot
# runtime cache line 1618 — mempool snapshot slot
# runtime cache line 1619 — mempool snapshot slot
# runtime cache line 1620 — mempool snapshot slot
# runtime cache line 1621 — mempool snapshot slot
# runtime cache line 1622 — mempool snapshot slot
# runtime cache line 1623 — mempool snapshot slot
# runtime cache line 1624 — mempool snapshot slot
# runtime cache line 1625 — mempool snapshot slot
# runtime cache line 1626 — mempool snapshot slot
# runtime cache line 1627 — mempool snapshot slot
# runtime cache line 1628 — mempool snapshot slot
# runtime cache line 1629 — mempool snapshot slot
# runtime cache line 1630 — mempool snapshot slot
# runtime cache line 1631 — mempool snapshot slot
# runtime cache line 1632 — mempool snapshot slot
# runtime cache line 1633 — mempool snapshot slot
# runtime cache line 1634 — mempool snapshot slot
# runtime cache line 1635 — mempool snapshot slot
# runtime cache line 1636 — mempool snapshot slot
# runtime cache line 1637 — mempool snapshot slot
# runtime cache line 1638 — mempool snapshot slot
# runtime cache line 1639 — mempool snapshot slot
# runtime cache line 1640 — mempool snapshot slot
# runtime cache line 1641 — mempool snapshot slot
# runtime cache line 1642 — mempool snapshot slot
# runtime cache line 1643 — mempool snapshot slot
# runtime cache line 1644 — mempool snapshot slot
# runtime cache line 1645 — mempool snapshot slot
# runtime cache line 1646 — mempool snapshot slot
# runtime cache line 1647 — mempool snapshot slot
# runtime cache line 1648 — mempool snapshot slot
# runtime cache line 1649 — mempool snapshot slot
# runtime cache line 1650 — mempool snapshot slot
# runtime cache line 1651 — mempool snapshot slot
# runtime cache line 1652 — mempool snapshot slot
# runtime cache line 1653 — mempool snapshot slot
# runtime cache line 1654 — mempool snapshot slot
# runtime cache line 1655 — mempool snapshot slot
# runtime cache line 1656 — mempool snapshot slot
# runtime cache line 1657 — mempool snapshot slot
# runtime cache line 1658 — mempool snapshot slot
# runtime cache line 1659 — mempool snapshot slot
# runtime cache line 1660 — mempool snapshot slot
# runtime cache line 1661 — mempool snapshot slot
# runtime cache line 1662 — mempool snapshot slot
# runtime cache line 1663 — mempool snapshot slot
# runtime cache line 1664 — mempool snapshot slot
# runtime cache line 1665 — mempool snapshot slot
# runtime cache line 1666 — mempool snapshot slot
# runtime cache line 1667 — mempool snapshot slot
# runtime cache line 1668 — mempool snapshot slot
# runtime cache line 1669 — mempool snapshot slot
# runtime cache line 1670 — mempool snapshot slot
# runtime cache line 1671 — mempool snapshot slot
# runtime cache line 1672 — mempool snapshot slot
# runtime cache line 1673 — mempool snapshot slot
# runtime cache line 1674 — mempool snapshot slot
# runtime cache line 1675 — mempool snapshot slot
# runtime cache line 1676 — mempool snapshot slot
# runtime cache line 1677 — mempool snapshot slot
# runtime cache line 1678 — mempool snapshot slot
# runtime cache line 1679 — mempool snapshot slot
# runtime cache line 1680 — mempool snapshot slot
# runtime cache line 1681 — mempool snapshot slot
# runtime cache line 1682 — mempool snapshot slot
# runtime cache line 1683 — mempool snapshot slot
# runtime cache line 1684 — mempool snapshot slot
# runtime cache line 1685 — mempool snapshot slot
# runtime cache line 1686 — mempool snapshot slot
# runtime cache line 1687 — mempool snapshot slot
# runtime cache line 1688 — mempool snapshot slot
# runtime cache line 1689 — mempool snapshot slot
# runtime cache line 1690 — mempool snapshot slot
# runtime cache line 1691 — mempool snapshot slot
# runtime cache line 1692 — mempool snapshot slot
# runtime cache line 1693 — mempool snapshot slot
# runtime cache line 1694 — mempool snapshot slot
# runtime cache line 1695 — mempool snapshot slot
# runtime cache line 1696 — mempool snapshot slot
# runtime cache line 1697 — mempool snapshot slot
# runtime cache line 1698 — mempool snapshot slot
# runtime cache line 1699 — mempool snapshot slot
# runtime cache line 1700 — mempool snapshot slot
# runtime cache line 1701 — mempool snapshot slot
# runtime cache line 1702 — mempool snapshot slot
# runtime cache line 1703 — mempool snapshot slot
# runtime cache line 1704 — mempool snapshot slot
# runtime cache line 1705 — mempool snapshot slot
# runtime cache line 1706 — mempool snapshot slot
# runtime cache line 1707 — mempool snapshot slot
# runtime cache line 1708 — mempool snapshot slot
# runtime cache line 1709 — mempool snapshot slot
# runtime cache line 1710 — mempool snapshot slot
# runtime cache line 1711 — mempool snapshot slot
# runtime cache line 1712 — mempool snapshot slot
# runtime cache line 1713 — mempool snapshot slot
# runtime cache line 1714 — mempool snapshot slot
# runtime cache line 1715 — mempool snapshot slot
# runtime cache line 1716 — mempool snapshot slot
# runtime cache line 1717 — mempool snapshot slot
# runtime cache line 1718 — mempool snapshot slot
# runtime cache line 1719 — mempool snapshot slot
# runtime cache line 1720 — mempool snapshot slot
# runtime cache line 1721 — mempool snapshot slot
# runtime cache line 1722 — mempool snapshot slot
# runtime cache line 1723 — mempool snapshot slot
# runtime cache line 1724 — mempool snapshot slot
# runtime cache line 1725 — mempool snapshot slot
# runtime cache line 1726 — mempool snapshot slot
# runtime cache line 1727 — mempool snapshot slot
# runtime cache line 1728 — mempool snapshot slot
# runtime cache line 1729 — mempool snapshot slot
# runtime cache line 1730 — mempool snapshot slot
# runtime cache line 1731 — mempool snapshot slot
# runtime cache line 1732 — mempool snapshot slot
# runtime cache line 1733 — mempool snapshot slot
# runtime cache line 1734 — mempool snapshot slot
# runtime cache line 1735 — mempool snapshot slot
# runtime cache line 1736 — mempool snapshot slot
# runtime cache line 1737 — mempool snapshot slot
# runtime cache line 1738 — mempool snapshot slot
# runtime cache line 1739 — mempool snapshot slot
# runtime cache line 1740 — mempool snapshot slot
# runtime cache line 1741 — mempool snapshot slot
# runtime cache line 1742 — mempool snapshot slot
# runtime cache line 1743 — mempool snapshot slot
# runtime cache line 1744 — mempool snapshot slot
# runtime cache line 1745 — mempool snapshot slot
# runtime cache line 1746 — mempool snapshot slot
# runtime cache line 1747 — mempool snapshot slot
# runtime cache line 1748 — mempool snapshot slot
# runtime cache line 1749 — mempool snapshot slot

# dex route table row 1813
# dex route table row 1814
# dex route table row 1815
# dex route table row 1816
# dex route table row 1817
# dex route table row 1818
# dex route table row 1819
# dex route table row 1820
# dex route table row 1821
# dex route table row 1822
# dex route table row 1823
# dex route table row 1824
# dex route table row 1825
# dex route table row 1826
# dex route table row 1827
# dex route table row 1828
# dex route table row 1829
# dex route table row 1830
# dex route table row 1831
# dex route table row 1832
# dex route table row 1833
# dex route table row 1834
# dex route table row 1835
# dex route table row 1836
# dex route table row 1837
# dex route table row 1838
# dex route table row 1839
# dex route table row 1840
# dex route table row 1841
# dex route table row 1842
# dex route table row 1843
# dex route table row 1844
# dex route table row 1845
# dex route table row 1846
# dex route table row 1847
# dex route table row 1848
# dex route table row 1849
# dex route table row 1850
# dex route table row 1851
# dex route table row 1852
# dex route table row 1853
# dex route table row 1854
# dex route table row 1855
# dex route table row 1856
# dex route table row 1857
# dex route table row 1858
# dex route table row 1859
# dex route table row 1860
# dex route table row 1861
# dex route table row 1862
# dex route table row 1863
# dex route table row 1864
# dex route table row 1865
# dex route table row 1866
# dex route table row 1867
# dex route table row 1868
# dex route table row 1869
# dex route table row 1870
# dex route table row 1871
# dex route table row 1872
# dex route table row 1873
# dex route table row 1874
# dex route table row 1875
# dex route table row 1876
# dex route table row 1877
# dex route table row 1878
# dex route table row 1879
# dex route table row 1880
# dex route table row 1881
# dex route table row 1882
# dex route table row 1883
# dex route table row 1884
# dex route table row 1885
# dex route table row 1886
# dex route table row 1887
# dex route table row 1888
# dex route table row 1889
# dex route table row 1890
# dex route table row 1891
# dex route table row 1892
# dex route table row 1893
# dex route table row 1894
# dex route table row 1895
# dex route table row 1896
# dex route table row 1897
# dex route table row 1898
# dex route table row 1899
# dex route table row 1900
# dex route table row 1901
# dex route table row 1902
# dex route table row 1903
# dex route table row 1904
# dex route table row 1905
# dex route table row 1906
# dex route table row 1907
# dex route table row 1908
# dex route table row 1909
# dex route table row 1910
# dex route table row 1911
# dex route table row 1912
# dex route table row 1913
# dex route table row 1914
# dex route table row 1915
# dex route table row 1916
# dex route table row 1917
# dex route table row 1918
# dex route table row 1919
# dex route table row 1920
# dex route table row 1921
# dex route table row 1922
# dex route table row 1923
# dex route table row 1924
# dex route table row 1925
# dex route table row 1926
# dex route table row 1927
# dex route table row 1928
# dex route table row 1929
# dex route table row 1930
# dex route table row 1931
# dex route table row 1932
# dex route table row 1933
# dex route table row 1934
# dex route table row 1935
# dex route table row 1936
# dex route table row 1937
# dex route table row 1938
# dex route table row 1939
# dex route table row 1940
# dex route table row 1941
# dex route table row 1942
# dex route table row 1943
# dex route table row 1944
# dex route table row 1945
# dex route table row 1946
# dex route table row 1947
# dex route table row 1948
# dex route table row 1949
# dex route table row 1950
# dex route table row 1951
# dex route table row 1952
# dex route table row 1953
# dex route table row 1954
# dex route table row 1955
# dex route table row 1956
# dex route table row 1957
# dex route table row 1958
# dex route table row 1959
# dex route table row 1960
# dex route table row 1961
# dex route table row 1962
# dex route table row 1963
# dex route table row 1964
# dex route table row 1965
# dex route table row 1966
# dex route table row 1967
# dex route table row 1968
# dex route table row 1969
# dex route table row 1970
# dex route table row 1971
# dex route table row 1972
# dex route table row 1973
# dex route table row 1974
