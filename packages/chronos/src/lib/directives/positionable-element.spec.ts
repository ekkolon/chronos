import { PositionableElement } from './positionable-element'; // Adjust the import path as needed

describe('PositionableElement', () => {
  let positionableElement: PositionableElement;

  beforeEach(() => {
    positionableElement = new PositionableElement();
  });

  it('should create an instance', () => {
    expect(positionableElement).toBeTruthy();
  });

  it('should have orientation defined', () => {
    positionableElement.orientation = 'horizontal' as never;
    expect(positionableElement.orientation).toEqual('horizontal');
  });

  it('should have position defined', () => {
    positionableElement.position = 100;
    expect(positionableElement.position).toEqual(100);
  });

  it('should return translate3d property', () => {
    positionableElement.orientation = 'vertical' as never;
    positionableElement.position = 50;
    expect(positionableElement.translate3d).toEqual('translate3d(0px, 50px, 0px)');
  });
});
