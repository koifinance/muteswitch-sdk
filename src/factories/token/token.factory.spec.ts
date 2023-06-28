import { ChainId, ETH } from '../..';
import { EthersProvider } from '../../ethers-provider';
import { MockEthereumAddress } from '../../mocks/ethereum-address.mock';
import { MOCKFUN } from '../../mocks/fun-token.mock';
import { MuteSwitchContractContext } from '../../muteswitch-contract-context/muteswitch-contract-context';
import { TokenFactory } from './token.factory';

describe('TokenFactory', () => {
  const ethersProvider = new EthersProvider({ chainId: ChainId.MAINNET });
  const token = MOCKFUN();

  const tokenFactory = new TokenFactory(token.contractAddress, ethersProvider);
  const tokenFactoryEth = new TokenFactory(
    ETH.MAINNET().contractAddress,
    ethersProvider
  );

  describe('getToken', () => {
    describe('erc20', () => {
      it('getToken', async () => {
        const result = await tokenFactory.getToken();
        expect(result).toEqual(token);
      });
    });

    describe('eth', () => {
      it('getToken', async () => {
        const result = await tokenFactoryEth.getToken();
        expect(result).toEqual(ETH.MAINNET());
      });
    });
  });

  describe('allowance', () => {
    describe('erc20', () => {
      describe('v2', () => {
        it('allowance', async () => {
          const result = await tokenFactory.allowance(
            MockEthereumAddress()
          );
          expect(result).not.toBeUndefined();
        });
      });
    });

    describe('eth', () => {
      describe('v2', () => {
        it('allowance', async () => {
          const result = await tokenFactoryEth.allowance(
            MockEthereumAddress()
          );
          expect(result).toEqual(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          );
        });
      });
    });
  });

  describe('generateApproveAllowanceData', () => {
    describe('erc20', () => {
      describe('v2', () => {
        it('generateApproveAllowanceData', () => {
          const result = tokenFactory.generateApproveAllowanceData(
            MuteSwitchContractContext.routerAddress,
            '0x05'
          );
          expect(result).toEqual(
            '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d0000000000000000000000000000000000000000000000000000000000000005'
          );
        });
      });
    });

    describe('eth', () => {
      describe('v2', () => {
        it('generateApproveAllowanceData', () => {
          expect(() => {
            tokenFactoryEth.generateApproveAllowanceData(
              MuteSwitchContractContext.routerAddress,
              '0x05'
            );
          }).toThrowError('ETH does not need any allowance data');
        });
      });
    });
  });

  describe('balanceOf', () => {
    describe('erc20', () => {
      it('balanceOf', async () => {
        // const spy = spyOn(
        //   // @ts-ignore
        //   tokenFactory._erc20TokenContract,
        //   'balanceOf'
        // ).and.callThrough();
        const spy = spyOn(ethersProvider, 'balanceOf').and.callThrough();
        const result = await tokenFactory.balanceOf(MockEthereumAddress());
        expect(result).not.toBeUndefined();
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('eth', () => {
      it('balanceOf', async () => {
        const spy = spyOn(ethersProvider, 'balanceOf').and.callThrough();
        const result = await tokenFactoryEth.balanceOf(MockEthereumAddress());
        expect(result).not.toBeUndefined();
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('totalSupply', () => {
    describe('erc20', () => {
      it('totalSupply', async () => {
        const result = await tokenFactory.totalSupply();
        expect(result).toEqual('0x0f4229ebe353e7b6');
      });
    });

    describe('eth', () => {
      it('totalSupply', async () => {
        const result = await tokenFactoryEth.totalSupply();
        expect(result).not.toBeUndefined();
      });
    });
  });

  describe('getAllowanceAndBalanceOf', () => {
    describe('erc20', () => {
      it('getAllowanceAndBalanceOf', async () => {
        const result = await tokenFactory.getAllowanceAndBalanceOf(
          MockEthereumAddress()
        );
        expect(result).toEqual({
          allowance: '0x2386c18764e720',
          balanceOf: '0x00',
        });
      });
    });

    describe('eth', () => {
      it('getAllowanceAndBalanceOf', async () => {
        const result = await tokenFactoryEth.getAllowanceAndBalanceOf(
          MockEthereumAddress()
        );
        expect(result).toEqual({
          allowance:
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          balanceOf: '0x00',
        });
      });
    });
  });
});
