/**
 * Computed positional and sizing properties of a box in the layout.
 */
export interface LayoutBox {
  /**
   * Aspect ratio of the box.
   */
  aspectRatio: number;
  /**
   * Distance between the top side of the box and the top boundary of the justified layout.
   */
  top: number;
  /**
   * Width of the box in a justified layout.
   */
  width: number;
  /**
   * Height of the box in a justified layout.
   */
  height: number;
  /**
   * Distance between the left side of the box and the left boundary of the justified layout.
   */
  left: number;
  /**
   * Whether or not the aspect ratio was forced.
   */
  forcedAspectRatio?: boolean;
}

/**
 * Results from calculating the justified layout.
 */
export interface JustifiedLayoutResult {
  /**
   * Height of the container containing the justified layout.
   */
  containerHeight: number;
  /**
   * Number of items that are in rows that aren't fully-packed.
   */
  widowCount: number;
  /**
   * Computed positional and sizing properties of a box in the justified layout.
   */
  boxes: LayoutBox[];
}
