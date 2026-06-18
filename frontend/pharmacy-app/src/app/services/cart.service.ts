import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartKey = 'cartItems';

  constructor() {}

  getCartItems(): any[] {
    const stored = localStorage.getItem(this.cartKey);
    return stored ? JSON.parse(stored) : [];
  }

  addToCart(product: any): void {
    const items = this.getCartItems();
    const existing = items.find((item: any) => item.product._id === product._id);

    if (existing) {
      existing.quantity++;
    } else {
      items.push({ product, quantity: 1 });
    }

    localStorage.setItem(this.cartKey, JSON.stringify(items));
  }

  removeFromCart(productId: string): void {
    const updated = this.getCartItems().filter(item => item.product._id !== productId);
    localStorage.setItem(this.cartKey, JSON.stringify(updated));
  }

  clearCart(): void {
    localStorage.removeItem(this.cartKey);
  }

  getTotalPrice(): number {
    return this.getCartItems()
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}
