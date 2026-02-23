import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRepuestoComponent } from './formulario-repuesto.component';

describe('FormularioRepuestoComponent', () => {
  let component: FormularioRepuestoComponent;
  let fixture: ComponentFixture<FormularioRepuestoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRepuestoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioRepuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
