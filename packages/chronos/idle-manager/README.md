# chronos/idle-manager

Secondary entry point that provides functionality for tracking and managing user idle time by observing user interactions with the DOM.

## IdleManager

Core, injectable Angular service for idle detection.

### Methods

#### `observe(): void`

Starts monitoring user interactions with the DOM and toggles the _idle_ state on or off based on those interactions. This method should be called to initiate the tracking process.

### Properties

#### `isIdle: Signal<boolean>`

Computed property that holds the current idle state:

- `true` for idle (when the user is inactive).
- `false` for active (when the user is interacting with the DOM).

#### `onIdle: EventEmitter<void>`

Observable subject that emits when the user becomes inactive after time specified in the
`inactiveAfterMs` configuration option.

## Configuration

### `IdleManagerConfig`

Configuration object for customizing idle detection.

- `inactiveAfterMs: number`

  The time in milliseconds of inactivity that triggers the _idle_ state. You can customize this value according to your application's requirements.

### `provideIdleManager`

Factory function that returns providers required to work with this entry point.

- `options?: Partial<IdleManagerConfig>`

  An optional parameter to specify custom options for the `IdleManager` service.

## Usage Example

```typescript
import { Component, Injectable, InjectionToken, NgModule } from '@angular/core';
import { IdleManager, IdleManagerConfig, provideIdleManager } from 'chronos/idle-manager';

@Component({
  ...
  providers: [
    provideIdleManager({
      inactiveAfterMs: 10_000,
    }),
  ],
})
export class MyComponent {
  private idleManager = inject(IdleManager, { optional: true });

  ngOnInit() {
    // To start observing user interactions and define the inactivity time
    this.idleManager.observe();

    // Subscribe to when the user becomes inactive
    this.idleManager.onIdle.subscribe(() => {
      // Perform actions when the user becomes inactive
    });
  }
}
```
