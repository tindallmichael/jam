import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WbbsbcComponent } from './wbbsbc.component';

describe('WbbsbcComponent', () => {
  let component: WbbsbcComponent;
  let fixture: ComponentFixture<WbbsbcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WbbsbcComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WbbsbcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
