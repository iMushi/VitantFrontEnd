import { TestBed, async, inject } from '@angular/core/testing';

import { BackOfficeAuthGuard } from './back-office-auth.guard';

describe('BackOfficeAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackOfficeAuthGuard]
    });
  });

  it('should ...', inject([BackOfficeAuthGuard], (guard: BackOfficeAuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
