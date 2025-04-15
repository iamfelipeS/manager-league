import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldLineupComponent } from './field-lineup.component';

describe('FieldLineupComponent', () => {
  let component: FieldLineupComponent;
  let fixture: ComponentFixture<FieldLineupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldLineupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldLineupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
