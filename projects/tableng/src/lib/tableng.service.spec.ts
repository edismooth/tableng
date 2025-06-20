import { TestBed } from '@angular/core/testing';

import { TablengService } from './tableng.service';

describe('TablengService', () => {
  let service: TablengService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablengService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
