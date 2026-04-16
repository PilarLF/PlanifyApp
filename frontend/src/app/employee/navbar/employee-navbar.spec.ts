import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeNavbar } from './employee-navbar';

describe('EmployeeNavbar', () => {
  let component: EmployeeNavbar;
  let fixture: ComponentFixture<EmployeeNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
