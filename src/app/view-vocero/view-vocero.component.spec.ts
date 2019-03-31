import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVoceroComponent } from './view-vocero.component';

describe('ViewVoceroComponent', () => {
  let component: ViewVoceroComponent;
  let fixture: ComponentFixture<ViewVoceroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewVoceroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewVoceroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
