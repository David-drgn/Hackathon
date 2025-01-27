import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetComponentComponent } from './forget-component.component';

describe('ForgetComponentComponent', () => {
  let component: ForgetComponentComponent;
  let fixture: ComponentFixture<ForgetComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForgetComponentComponent]
    });
    fixture = TestBed.createComponent(ForgetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
