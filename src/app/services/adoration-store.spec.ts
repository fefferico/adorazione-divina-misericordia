import { TestBed } from '@angular/core/testing';

import { AdorationStore } from './adoration-store';

describe('AdorationStore', () => {
  let service: AdorationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdorationStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
