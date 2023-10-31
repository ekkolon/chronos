import { TestBed, inject } from '@angular/core/testing';

import { of } from 'rxjs';

import { IdleManager } from './idle-manager';
import { provideIdleManager } from './idle-manager.config';

describe('Service: IdleTime', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideIdleManager()],
    });
  });

  it('should create the service', inject([IdleManager], (service: IdleManager) => {
    expect(service).toBeTruthy();
  }));

  it('should start monitoring user activity', inject([IdleManager], (service: IdleManager) => {
    const getEventListenerSpy = jest
      .spyOn(service as never, 'getActivityEvents')
      .mockReturnValue(of() as never);

    const startInactivityTimerSpy = jest.spyOn(service as never, 'startInactivityTimer');

    service.observe();

    expect(startInactivityTimerSpy).toHaveBeenCalled();
    expect(getEventListenerSpy).toHaveBeenCalled();
  }));

  it('should reset the inactivity timer', inject([IdleManager], (service: IdleManager) => {
    // Set up initial timer value
    service['inactivityTimer'] = setTimeout(() => ({}), 1000);
    service['resetInactivityTimer']();

    // Expect that the inactivity timer has been cleared
    expect(service['inactivityTimer']).toBeUndefined();
  }));

  it('should toggle user activity state', inject([IdleManager], (service: IdleManager) => {
    service['toggleIdleState'](false);
    service['toggleIdleState'](true);

    // Expect that the user activity state signal has changed
    expect(service['idleState']()).toEqual(true);
  }));
});
