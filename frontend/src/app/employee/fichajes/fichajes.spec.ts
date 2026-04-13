import { TestBed } from '@angular/core/testing';

import { FichajesService } from './fichajes';

describe('Fichajes', () => {
  let service: FichajesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FichajesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
