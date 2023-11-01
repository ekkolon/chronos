import {
  InteractionManager,
  InteractionManagerConfig,
  InteractionManagerUpdateConfig,
} from './interaction-manager';

describe('InteractionManager', () => {
  let interactionManager: InteractionManager;
  const containerElement = document.createElement('div');
  const viewportElement = document.createElement('div');
  const config: InteractionManagerConfig = {
    container: containerElement,
    viewport: viewportElement,
    distance: 100,
    offsetStart: 10,
    offsetEnd: 20,
  };

  beforeEach(() => {
    interactionManager = new InteractionManager(config);
  });

  afterEach(() => {
    interactionManager.detach();
  });

  describe('Properties', () => {
    it('should have the correct initial values for properties', () => {
      // Verify that properties are initialized correctly.
      expect(interactionManager.position()).toBe(config.offsetStart);
      expect(interactionManager.cursorPos()).toBe(config.offsetStart);
      expect(interactionManager.lineSegment).toBe(config.distance);
      expect(interactionManager.upperBound).toBe(config.distance - config.offsetEnd);
      expect(interactionManager.lowerBound).toBe(config.offsetStart);
    });
  });

  describe('Methods', () => {
    it('should start detecting movements', () => {
      // Use spies to verify that subscriptions are called.
      const spySubscribe = jest.spyOn(interactionManager['click$'], 'subscribe');
      interactionManager.detectInteractions();
      expect(spySubscribe).toHaveBeenCalled();
    });

    it('should move to a specific fraction of the distance', () => {
      interactionManager.moveByFraction(0.5);
      // 0.5 * 100 (distance) - rounded to 2 decimal places.
      expect(interactionManager.position()).toBe(50);
    });

    it('should update the configuration', () => {
      const updatedConfig: InteractionManagerUpdateConfig = {
        distance: 150,
        offsetStart: 15,
      };
      interactionManager.updateConfig(updatedConfig);

      // Verify that properties are updated correctly.
      expect(interactionManager.lineSegment).toBe(updatedConfig.distance);
      expect(interactionManager.lowerBound).toBe(updatedConfig.offsetStart);
    });
  });

  describe('Event Handling', () => {
    it('should handle wheel events within the container', () => {
      // Simulate a wheel event.
      const firefoxEvent = { detail: 9 };
      const event = new WheelEvent('wheel', firefoxEvent);
      interactionManager['onWheel'](event);

      // Verify that the position is updated.
      expect(interactionManager.position()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases and Boundary Tests', () => {
    it('should clamp a position when it is less than offsetStart', () => {
      const position = 5;
      const clampedPosition = interactionManager['clamp'](position);
      expect(clampedPosition).toBe(config.offsetStart);
    });

    it('should clamp a position when it is greater than maxDistance - offsetEnd', () => {
      const position = 95;
      const clampedPosition = interactionManager['clamp'](position);
      expect(clampedPosition).toBe(config.distance - config.offsetEnd);
    });

    it('should handle horizontal orientation when clamping', () => {
      // Configure the class for horizontal orientation.
      const horizontalConfig: InteractionManagerConfig = {
        ...config,
        orientation: 'horizontal' as never,
      };
      interactionManager.updateConfig(horizontalConfig);

      const position = 5;
      const clampedPosition = interactionManager['clamp'](position);
      expect(clampedPosition).toBe(horizontalConfig.offsetStart);
    });
  });
});
