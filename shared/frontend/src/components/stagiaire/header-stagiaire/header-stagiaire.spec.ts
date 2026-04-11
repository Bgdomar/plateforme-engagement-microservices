import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderStagiaire } from './header-stagiaire';

describe('HeaderStagiaire', () => {
  let component: HeaderStagiaire;
  let fixture: ComponentFixture<HeaderStagiaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderStagiaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderStagiaire);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
