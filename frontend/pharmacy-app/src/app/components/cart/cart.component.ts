import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: any[] = [];
  total: number = 0;
  readonly defaultImage = 'assets/products/product-1.jpg';

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.items = this.cartService.getCartItems();
    this.total = this.cartService.getTotalPrice();
  }

  getImageUrl(product: any): string {
    return product?.imageUrl?.trim() || this.defaultImage;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('product-1.jpg')) {
      img.src = this.defaultImage;
    }
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
    this.loadCart();
  }

  placeOrder() {
    const token = this.authService.getToken();
    if (!token) {
      alert("Morate biti prijavljeni.");
      return;
    }

    const payload = {
      items: this.items.map(i => ({
        product: i.product._id,
        quantity: i.quantity
      }))
    };

    this.http.post(`${environment.apiUrl}/orders`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        alert("Porudžbina uspješno kreirana!");
        this.cartService.clearCart();
        this.loadCart();
      },
      error: err => {
        console.error(err);
        alert("Greška pri kreiranju porudžbine.");
      }
    });
  }
  increaseQuantity(item: any) {
  item.quantity++;
  this.saveCartAndRefresh();
}

decreaseQuantity(item: any) {
  if (item.quantity > 1) {
    item.quantity--;
    this.saveCartAndRefresh();
  }
}

saveCartAndRefresh() {
  localStorage.setItem('cartItems', JSON.stringify(this.items));
  this.total = this.cartService.getTotalPrice();
}

}
