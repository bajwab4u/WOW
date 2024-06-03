import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateLimitModalComponent } from './update-limit-modal.component';

describe('UpdateLimitModalComponent', () => {
  let component: UpdateLimitModalComponent;
  let fixture: ComponentFixture<UpdateLimitModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateLimitModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateLimitModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
