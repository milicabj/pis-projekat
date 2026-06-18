import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManufacturersComponent } from './admin-manufacturers.component';

describe('AdminManufacturersComponent', () => {
  let component: AdminManufacturersComponent;
  let fixture: ComponentFixture<AdminManufacturersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminManufacturersComponent]
    });
    fixture = TestBed.createComponent(AdminManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
