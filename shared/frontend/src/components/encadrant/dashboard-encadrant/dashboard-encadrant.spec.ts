import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEncadrant } from './dashboard-encadrant';

describe('DashboardEncadrant', () => {
  let component: DashboardEncadrant;
  let fixture: ComponentFixture<DashboardEncadrant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEncadrant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEncadrant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
