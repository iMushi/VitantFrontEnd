import { TestBed, inject } from '@angular/core/testing';

import { BackOfficeService } from './back-office.service';

describe('BackOfficeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackOfficeService]
    });
  });

  it('should be created', inject([BackOfficeService], (service: BackOfficeService) => {
    expect(service).toBeTruthy();
  }));
});
