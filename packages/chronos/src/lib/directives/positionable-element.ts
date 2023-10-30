/**
 * @license
 * Copyright Nelson Dominguez All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root of this project.
 */

import { Directive, HostBinding, Input } from '@angular/core';

import { Orientation, getTranslate3d } from '../utils/position';

/**
 * Represents an object that can be positioned in a specific orientation.
 */
export interface Positionable {
  /**
   * The position of the object.
   */
  position: number;

  /**
   * The orientation in which the object is positioned.
   */
  orientation: Orientation;

  /**
   * A property that returns a CSS `translate3d` string based on the object's position and orientation.
   */
  get translate3d(): string;
}

/**
 * A directive that implements the {@link Positionable} interface to enable
 * the positioning of elements.
 * It allows you to set the position of elements based on an `Orientation` value,
 * which determines the main axis, and a pixel position value along that axis.
 */
@Directive()
export class PositionableElement implements Positionable {
  /**
   * The orientation of the positioned element.
   */
  @Input({ required: true }) orientation!: Orientation;

  /**
   * The position of the positioned element.
   */
  @Input({ required: true }) position!: number;

  /**
   * A computed property that returns a CSS `transform` string in the `translate3d` format.
   * The value is based on the specified orientation and position of the element.
   */
  @HostBinding('style.transform')
  get translate3d() {
    return getTranslate3d(this.orientation, this.position);
  }
}
