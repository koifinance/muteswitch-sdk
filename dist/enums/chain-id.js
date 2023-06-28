"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainNames = exports.ChainId = void 0;
var ChainId;
(function (ChainId) {
    ChainId[ChainId["ZKSYNC_ERA"] = 324] = "ZKSYNC_ERA";
    ChainId[ChainId["ZKSYNC_ERA_TESTNET"] = 280] = "ZKSYNC_ERA_TESTNET";
})(ChainId = exports.ChainId || (exports.ChainId = {}));
exports.ChainNames = new Map([
    [ChainId.ZKSYNC_ERA, 'zksync-era'],
    [ChainId.ZKSYNC_ERA_TESTNET, 'zksync-era-testnet']
]);
