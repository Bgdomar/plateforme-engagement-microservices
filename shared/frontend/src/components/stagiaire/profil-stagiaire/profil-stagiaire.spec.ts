import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilStagiaire } from './profil-stagiaire';

describe('ProfilStagiaire', () => {
  let component: ProfilStagiaire;
  let fixture: ComponentFixture<ProfilStagiaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilStagiaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilStagiaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
