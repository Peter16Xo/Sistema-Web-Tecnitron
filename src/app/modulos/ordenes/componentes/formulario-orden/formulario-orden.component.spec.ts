import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioOrdenComponent } from './formulario-orden.component';

describe('FormularioOrdenComponent', () => {
  let component: FormularioOrdenComponent;
  let fixture: ComponentFixture<FormularioOrdenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioOrdenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioOrdenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
