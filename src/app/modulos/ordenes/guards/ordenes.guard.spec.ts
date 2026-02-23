import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { ordenesGuard } from './ordenes.guard';

describe('ordenesGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => ordenesGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
