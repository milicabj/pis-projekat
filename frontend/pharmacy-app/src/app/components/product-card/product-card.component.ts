import { Component, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;
  readonly defaultImage = 'assets/products/product-1.jpg';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  notificationVisible = false;

  getImageUrl(product: Product): string {
    return product?.imageUrl?.trim() || this.defaultImage;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('product-1.jpg')) {
      img.src = this.defaultImage;
    }
  }

  addToCart() {
    if (!this.authService.isLoggedIn()) {
      alert('Morate biti prijavljeni da biste dodali proizvod u korpu.');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addToCart(this.product);

    
    this.notificationVisible = true;
    setTimeout(() => {
      this.notificationVisible = false;
    }, 2500); 
  }

}
