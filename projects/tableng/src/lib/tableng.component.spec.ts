import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablengComponent } from './tableng.component';

describe('TablengComponent', () => {
  let component: TablengComponent;
  let fixture: ComponentFixture<TablengComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablengComponent]
    });
    fixture = TestBed.createComponent(TablengComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
