import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardStagiaire } from './dashboard-stagiaire';

describe('DashboardStagiaire', () => {
  let component: DashboardStagiaire;
  let fixture: ComponentFixture<DashboardStagiaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardStagiaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardStagiaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
