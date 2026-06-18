import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  readonly defaultImage = 'assets/products/product-1.jpg';

  constructor(private http: HttpClient) {}

  getImageUrl(product: any): string {
    return product?.imageUrl?.trim() || this.defaultImage;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('product-1.jpg')) {
      img.src = this.defaultImage;
    }
  }

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/orders/mine`).subscribe({
      next: (res) => this.orders = res,
      error: (err) => console.error('Greška pri učitavanju porudžbina:', err)
    });
  }
}
