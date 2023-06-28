import { MuteSwitchPairSettings } from './muteswitch-pair-settings';

describe('MuteSwitchPairSettings', () => {
  describe('slippage', () => {
    it('should set the correct default if not passed in', () => {
      const muteswitchPairSettings = new MuteSwitchPairSettings();

      expect(muteswitchPairSettings.slippage).toEqual(0.005);
    });

    it('should set the slippage', () => {
      const muteswitchPairSettings = new MuteSwitchPairSettings({ slippage: 0.1 });

      expect(muteswitchPairSettings.slippage).toEqual(0.1);
    });
  });

  describe('deadlineMinutes', () => {
    it('should set the correct default if not passed in', () => {
      const muteswitchPairSettings = new MuteSwitchPairSettings();

      expect(muteswitchPairSettings.deadlineMinutes).toEqual(20);
    });

    it('should set the value', () => {
      const muteswitchPairSettings = new MuteSwitchPairSettings({
        deadlineMinutes: 60,
      });

      expect(muteswitchPairSettings.deadlineMinutes).toEqual(60);
    });
  });

  describe('disableMultihops', () => {
    it('should set the correct default if not passed in', () => {
      const muteswitchPairSettings = new MuteSwitchPairSettings();

      expect(muteswitchPairSettings.disableMultihops).toEqual(false);
    });

    it('should set the value', () => {
      const muteswitchPairSettings = new MuteSwitchPairSettings({
        disableMultihops: true,
      });

      expect(muteswitchPairSettings.disableMultihops).toEqual(true);
    });
  });
});
