import {
  Area2d,
  Orientation,
  OrientationError,
  clamp,
  generateTranslate3dProperty,
  getMainAxisPosition,
  getRelativePosition,
  is3DTranslatable,
  isArea2d,
  isOrientation,
  getDirectionOfTravelFromWheel,
} from './position';

/**
 * TODO: Test clamp with offsets
 */
describe('utils:position:clamp', () => {
  it('should return 0 if position is negative', () => {
    expect(clamp(-5, 10, 0, 0)).toBe(0);
  });

  it('should return the position if it is within the distance range', () => {
    expect(clamp(5, 10, 0, 0)).toBe(5);
  });

  it('should return the distance if position is greater than distance', () => {
    expect(clamp(15, 10, 0, 0)).toBe(10);
  });

  it('should handle position equal to 0', () => {
    expect(clamp(0, 10, 0, 0)).toBe(0);
  });

  it('should handle position equal to the distance', () => {
    expect(clamp(10, 10, 0, 0)).toBe(10);
  });
});

describe('utils:position:Orientation', () => {
  it('should define valid orientation values', () => {
    expect(Orientation.Vertical).toBe('vertical');
    expect(Orientation.Horizontal).toBe('horizontal');
  });

  it('isOrientation should return true for valid orientations', () => {
    expect(isOrientation(Orientation.Vertical)).toBe(true);
    expect(isOrientation(Orientation.Horizontal)).toBe(true);
  });

  it('isOrientation should return false for invalid orientations', () => {
    expect(isOrientation('invalid')).toBe(false);
    expect(isOrientation(123)).toBe(false);
    expect(isOrientation(null)).toBe(false);
  });
});

describe('utils:position:isArea2d', () => {
  it('should return true for valid 2D areas', () => {
    const validArea: Area2d = { x: 10, y: 20 };
    expect(isArea2d(validArea)).toBe(true);
  });

  it('should return false for invalid 2D areas', () => {
    const invalidArea1 = { x: 10, z: 20 };
    const invalidArea2 = { x: 'not a number', y: 20 };
    expect(isArea2d(invalidArea1)).toBe(false);
    expect(isArea2d(invalidArea2)).toBe(false);
    expect(isArea2d(null)).toBe(false);
  });
});

describe('utils:position:getMainAxisPosition', () => {
  it('should return the y coordinate for a valid vertical orientation', () => {
    const verticalPosition: Area2d = { x: 10, y: 20 };
    const result = getMainAxisPosition(Orientation.Vertical, verticalPosition);
    expect(result).toBe(verticalPosition.y);
  });

  it('should return the x coordinate for a valid horizontal orientation', () => {
    const horizontalPosition: Area2d = { x: 10, y: 20 };
    const result = getMainAxisPosition(Orientation.Horizontal, horizontalPosition);
    expect(result).toBe(horizontalPosition.x);
  });

  it('should return the value for a valid integer position', () => {
    const intValue = 42;
    const result = getMainAxisPosition(Orientation.Vertical, intValue);
    expect(result).toBe(intValue);
  });

  it('should throw an OrientationError for invalid orientation types', () => {
    const invalidOrientation = 'invalid';
    expect(() => getMainAxisPosition(invalidOrientation as never, 10)).toThrow(OrientationError);
  });

  it('should throw an OrientationError for invalid position values', () => {
    const invalidPosition = 'not a number';
    expect(() => getMainAxisPosition(Orientation.Vertical, invalidPosition as never)).toThrow(
      OrientationError
    );
  });
});

describe('utils:position:is3DTranslatable', () => {
  it('should return true for a valid 3D translation object', () => {
    const validTranslation = { x: 10, y: 20, z: 30 };
    expect(is3DTranslatable(validTranslation)).toBe(true);
  });

  it('should return true for an object with valid partial translation keys', () => {
    const partialTranslation = { x: 10, y: 20 };
    expect(is3DTranslatable(partialTranslation)).toBe(true);
  });

  it('should return false for an object with invalid keys', () => {
    const invalidTranslation = { x: 10, y: 20, w: 30 };
    expect(is3DTranslatable(invalidTranslation)).toBe(false);
  });

  it('should return false for null input', () => {
    expect(is3DTranslatable(null)).toBe(false);
  });

  it('should return false for non-object input', () => {
    expect(is3DTranslatable('not an object')).toBe(false);
  });
});

describe('utils:position:generateTranslate3dProperty', () => {
  it('should generate a valid translate3d property for a valid translation object', () => {
    const validTranslation = { x: 10, y: 20, z: 30 };
    expect(generateTranslate3dProperty(validTranslation)).toBe('translate3d(10px, 20px, 30px)');
  });

  it('should return "unset" for an invalid translation object', () => {
    const invalidTranslation = { x: 10, y: 20, w: 30 };
    expect(generateTranslate3dProperty(invalidTranslation)).toBe('unset');
  });

  it('should handle null input by returning "unset"', () => {
    expect(generateTranslate3dProperty(null)).toBe('unset');
  });

  it('should handle non-object input by returning "unset"', () => {
    expect(generateTranslate3dProperty('not an object')).toBe('unset');
  });
});

describe('utils:position:normalizeWheelDistance', () => {
  it('should normalize wheel distance for Firefox', () => {
    const firefoxEvent = { detail: 9 };
    expect(getDirectionOfTravelFromWheel(firefoxEvent as never)).toBe(-3);
  });

  it('should normalize wheel distance for other browsers', () => {
    const otherBrowserEvent = { wheelDelta: 240 };
    expect(getDirectionOfTravelFromWheel(otherBrowserEvent as never)).toBe(2);
  });

  it('should return NaN for events without wheel details', () => {
    const eventWithoutDetails = {};
    expect(getDirectionOfTravelFromWheel(eventWithoutDetails as never)).toBe(NaN);
  });
});

describe('utils:position:getRelativePosition', () => {
  it('should calculate the relative position within the reference element', () => {
    const event = { pageX: 50, pageY: 60 };
    const referenceElement = {
      offsetLeft: 10,
      offsetTop: 20,
      offsetParent: {
        offsetLeft: 5,
        offsetTop: 15,
        offsetParent: null,
      },
    };
    const expectedPosition = { x: 35, y: 25 };

    expect(getRelativePosition(event as never, referenceElement as never)).toEqual(
      expectedPosition
    );
  });

  it('should handle events without pageX and pageY properties', () => {
    const event = {};
    const referenceElement = {
      offsetLeft: 10,
      offsetTop: 20,
    };
    const expectedPosition = { x: NaN, y: NaN };

    expect(getRelativePosition(event as never, referenceElement as never)).toEqual(
      expectedPosition
    );
  });
});
