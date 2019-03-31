import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroContactoComponent } from './registro-contacto.component';

describe('RegistroContactoComponent', () => {
  let component: RegistroContactoComponent;
  let fixture: ComponentFixture<RegistroContactoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroContactoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
