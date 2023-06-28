# muteswitch-sdk

Mute Switch SDK which handles the routes automatically for you, changes in trade quotes reactive subscriptions, exposure to formatted easy to understand information, bringing back the best trade quotes automatically, generating transactions for you and much more. All the MuteSwitch logic for you in a simple to easy understand interface to hook straight into your dApp without having to understand how it all works.

# Installing

## npm

```bash
$ npm install muteswitch-sdk
```

# SDK guide

```ts
import { MuteSwitchPair, ChainId, ETH, USDC, WBTC } from 'muteswitch-sdk';
import { Contract, utils, Provider } from "zksync-web3";

const path = [USDC.ZKSYNC_ERA().contractAddress, WBTC.ZKSYNC_ERA().contractAddress]
const to = '0xB1E6079212888f0bE0cf55874B2EB9d7a5e02cD9'
const slippage = 0.005 // 0.5%

const factory = "0x40be1cBa6C5B47cDF9da7f963B6F761F4C60627D"
const router = "0x8B791913eB07C32779a16750e3868aA8495F5964"
const multicall = "0xb1F9b5FCD56122CdfD7086e017ec63E50dC075e7"

var amountIn = '10' // 10 USDC

const muteswitchPair = new MuteSwitchPair({
              // the contract address of the token you want to convert FROM
              fromTokenContractAddress: path[0],
              // the contract address of the token you want to convert TO
              toTokenContractAddress: path[1],
              // the ethereum address of the user using this part of the dApp
              ethereumAddress: to,
              // you can pass in the provider url as well if you want
              ethereumProvider: provider,
              // using custom provider url instead
              //providerUrl: YOUR_PROVIDER_URL,
              settings: new MuteSwitchPairSettings({
                slippage: slippage,
                customNetwork: {
                  multicallContractAddress: multicall,
                }
              }),
            });

// now to create the factory you just do
const muteswitchPairFactory = await muteswitchPair.createFactory();

var trade = await muteswitchPairFactory.trade(amountIn);

```

### Trade

This will generate you the trade with all the information you need to show to the user on the dApp. It will find the best route price for you automatically. we generate the transaction for you but you will still need to sign and send the transaction on your dApp once they confirm the swap.

```ts
 /**
   * Generate trade - this will return amount but you still need to send the transaction
   * if you want it to be executed on the blockchain
   * @param amount The amount you want to swap formatted. Aka if you want to swap 1 AAVE you pass in 1
   */

async trade(amount: string): Promise<TradeContext>


var trade = await muteswitchPairFactory.trade(amountIn);

// subscribe to quote changes
trade.quoteChanged$.subscribe((value: TradeContext) => {
  // value will hold the same info as below but obviously with
  // the new trade info.
});

console.log(trade);
{
  baseConvertRequest: '10',
  minAmountConvertQuote: '446878.20758208',
  maximumSent: null,
  expectedConvertQuote: '449123.82671566',
  liquidityProviderFee: 0,
  liquidityProviderFeePercent: 0,
  liquidityProviderFeesV3: ['0.030000000000000000'],
  liquidityProviderFeePercentsV3: [0.003],
  tradeExpires: 1612189240,
  routePathTokenMap: [
    {
      chainId: 1,
      contractAddress: 'NO_CONTRACT_ADDRESS',
      symbol: 'ETH',
      decimals: 18,
      name: 'Ethers'
    },
    {
      chainId: 1,
      contractAddress: '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b',
      symbol: 'FUN',
      decimals: 8,
      name: 'FunFair',
    },
  ],
  routeText: 'ETH > FUN',
  routePath: [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b',
  ],
  hasEnoughAllowance: true,
  approvalTransaction: undefined,
  toToken: {
    chainId: 1,
    contractAddress: '0x419D0d8BdD9aF5e606Ae2232ed285Aff190E711b',
    symbol: 'FUN',
    decimals: 8,
    name: 'FunFair',
  },
  toBalance: '1500.2634',
  fromToken: {
    chainId: 1,
    contractAddress: 'NO_CONTRACT_ADDRESS',
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethers'
  },
  fromBalance: {
    hasEnough: false,
    balance: '0.008474677789598637',
  },
  transaction: {
    to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    from: '0xB1E6079212888f0bE0cf55874B2EB9d7a5e02cD9',
    data:
      '0x7ff36ab5000000000000000000000000000000000000000000000000000028a4b1ae9cc00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000b1e6079212888f0be0cf55874b2eb9d7a5e02cd90000000000000000000000000000000000000000000000000000000060168ee30000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000419d0d8bdd9af5e606ae2232ed285aff190e711b',
    value: '0x8ac7230489e80000',
  },
  stable: [false, false]
}

...
//example sending tx via web3 provider 
var routerContract = new Contract(router, ROUTER_ABI, provider.getSigner());

await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
                  trade.minAmountConvertQuote, trade.routePath, to, deadline, trade.stable, { value: amountIn }
                  )

// destroy object once finished
trade.destroy();
```