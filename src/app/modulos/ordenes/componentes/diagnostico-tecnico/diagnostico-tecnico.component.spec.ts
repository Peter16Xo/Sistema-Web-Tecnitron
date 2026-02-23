import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosticoTecnicoComponent } from './diagnostico-tecnico.component';

describe('DiagnosticoTecnicoComponent', () => {
  let component: DiagnosticoTecnicoComponent;
  let fixture: ComponentFixture<DiagnosticoTecnicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiagnosticoTecnicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosticoTecnicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
