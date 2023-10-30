/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { coerceCssPixelValue } from './coercion';

/**
 * Ensures a given position value falls within the range [offsetStart, maxDistance - offsetEnd].
 *
 * If the position is outside this range, it is clamped to the nearest valid boundary.
 *
 * @param position - The position value to normalize.
 * @param totalDistance - The total line length.
 * @param offsetStart - The offset value at the start of the range.
 * @param offsetEnd - The offset value at the end of the range.
 * @returns The clamped position value within the specified range.
 */
export function clamp(
  position: number,
  totalDistance: number,
  offsetStart: number,
  offsetEnd: number
): number {
  return Math.min(Math.max(position, offsetStart), totalDistance - offsetEnd);
}

/**
 * Defines how a *Chronos* timeline is laid out on a screen.
 */
export enum Orientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

/**
 * Check whether a value is a valid orientation type.
 * @param value The value to check.
 * @returns Whether provided value is a valid orientation type.
 */
export const isOrientation = (value: unknown): value is Orientation => {
  return value === Orientation.Horizontal || value === Orientation.Vertical;
};

export interface Area2d {
  x: number;
  y: number;
}

/**
 * Checks if the given value represents a 2D area with valid 'x' and 'y' properties.
 * @param value - The value to check for a valid 2D area.
 * @returns `true` if the value is a valid 2D area, `false` otherwise.
 */
export const isArea2d = (value: unknown): value is Area2d => {
  return (
    value != null &&
    typeof (value as never)['x'] === 'number' &&
    typeof (value as never)['y'] === 'number'
  );
};

/**
 * Error class for issues related to orientation.
 */
export class OrientationError extends Error {}

/**
 * Retrieves the main axis position from a 2D point based on the given orientation.
 * @param point - The 2D point containing 'x' and 'y' coordinates.
 * @param orientation - The orientation to determine the main axis.
 * @returns The position along the main axis.
 * @throws {OrientationError} When an invalid orientation value is provided.
 * @throws {OrientationError} When an invalid position value is provided.
 */
export function getMainAxisPosition(orientation: Orientation, position: number | Area2d): number {
  if (!isOrientation(orientation)) {
    throw new OrientationError(
      `Invalid orientation type '${orientation}'.
      Must be one of "${Orientation.Horizontal}" | "${Orientation.Vertical}"`
    );
  }

  if (isArea2d(position)) {
    return orientation === Orientation.Horizontal ? position.x : position.y;
  } else if (typeof position === 'number') {
    return position;
  } else {
    throw new OrientationError(
      `Invalid position value type.
      Value must be an integer or an object containing x and y coordinates`
    );
  }
}

/**
 * Represents a 3D translation with optional values for the X, Y, and Z axes.
 */
export interface Translate3d extends Partial<Area2d> {
  z?: number;
}

/**
 * Checks if the given object can be considered a 3D translation with valid keys.
 * @param obj - The object to check for a valid 3D translation.
 * @returns `true` if the object is a valid 3D translation, `false` otherwise.
 */
export function is3DTranslatable(obj: unknown): obj is Translate3d {
  const validTranslateKeys: (keyof Translate3d)[] = ['x', 'y', 'z'];

  if (obj == null || typeof obj !== 'object') {
    return false;
  }

  const translateKeys: string[] = Object.keys(obj);

  if (translateKeys.length === 0) {
    return false;
  }

  return translateKeys.every((key) => validTranslateKeys.includes(key as never));
}

/**
 * Generates a CSS `translate3d` property value based on a 3D translation object.
 * @param obj - The 3D translation object to generate the `translate3d` value from.
 * @returns A valid `translate3d` property value or 'unset' if the translation is invalid.
 */
export function generateTranslate3dProperty(obj: unknown): string {
  if (!is3DTranslatable(obj)) {
    return 'unset';
  }

  const x = coerceCssPixelValue(obj.x ?? 0);
  const y = coerceCssPixelValue(obj.y ?? 0);
  const z = coerceCssPixelValue(obj.z ?? 0);

  return `translate3d(${x}, ${y}, ${z})`;
}

/**
 * Generates a `translate3d` property value for a specified orientation and position.
 *
 * This function calculates the `translate3d` property value based on the orientation (horizontal or vertical)
 * and the provided position value. It returns a CSS `translate3d` property that translates along the main axis.
 *
 * @param orientation - The orientation, either `Orientation.Horizontal` or `Orientation.Vertical`.
 * @param value - The position or Area2d object to determine the translation value.
 * @returns A CSS `translate3d` property value suitable for applying transformations.
 */
export function getTranslate3d(orientation: Orientation, value: Area2d | number) {
  const mainAxisPosition = getMainAxisPosition(orientation, value);

  return orientation === Orientation.Horizontal
    ? generateTranslate3dProperty({ x: mainAxisPosition })
    : generateTranslate3dProperty({ y: mainAxisPosition });
}

/**
 * Normalizes the wheel distance based on the browser-specific event properties.
 *
 * For Firefox, it uses the event detail property. For other browsers (IE, Safari, Chrome, etc.),
 * it uses the event wheelDelta property.

 * @param evt - The browser-specific wheel event object.
 * @returns The normalized wheel distance.
 */
export function normalizeWheelDistance(evt: any): number {
  if (evt.detail) {
    // Firefox;
    return -evt.detail / 3;
  }

  const delta = (evt as never)['wheelDelta'];
  return delta / 120;
}

/**
 * Calculates the relative position within a reference element based on a browser event.
 * @param evt - The browser event object containing pageX and pageY properties.
 * @param target - The reference element to calculate the position relative to.
 * @returns The relative position as a 2D area (x, y).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRelativePosition(evt: PointerEvent | MouseEvent, target: HTMLElement): Area2d {
  const position = {
    x: evt.pageX,
    y: evt.pageY,
  };

  const offset = {
    left: target.offsetLeft,
    top: target.offsetTop,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reference = target.offsetParent as HTMLElement;
  while (reference) {
    offset.left += reference.offsetLeft;
    offset.top += reference.offsetTop;
    reference = reference.offsetParent as HTMLElement;
  }

  const x = position.x - offset.left;
  const y = position.y - offset.top;

  return { x, y };
}
