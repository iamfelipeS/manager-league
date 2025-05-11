import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagAdminComponent } from './flag-admin.component';

describe('FlagAdminComponent', () => {
  let component: FlagAdminComponent;
  let fixture: ComponentFixture<FlagAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
