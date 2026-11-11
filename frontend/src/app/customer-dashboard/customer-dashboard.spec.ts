import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerDashboard } from './customer-dashboard';

describe('CustomerDashboard', () => {
  let component: CustomerDashboard;
  let fixture: ComponentFixture<CustomerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDashboard],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate cart total accurately with signals', () => {
    component.cart.set([
      {
        p: {
          id: 1,
          name: 'Badam',
          icon: '🌰',
          tint: '#fff',
          category: 'Grocery',
          price: 200,
          old: 250,
          rating: 5,
          stock: 10,
        },
        qty: 2,
      },
      {
        p: {
          id: 2,
          name: 'Cricket Bat',
          icon: '🏏',
          tint: '#fff',
          category: 'Sports',
          price: 1500,
          old: 1800,
          rating: 5,
          stock: 5,
        },
        qty: 1,
      },
    ]);
    expect(component.cartTotal()).toBe(1900);
    expect(component.cartCount()).toBe(3);
  });
});
