import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRepuestosComponent } from './lista-repuestos.component';

describe('ListaRepuestosComponent', () => {
  let component: ListaRepuestosComponent;
  let fixture: ComponentFixture<ListaRepuestosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaRepuestosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaRepuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
