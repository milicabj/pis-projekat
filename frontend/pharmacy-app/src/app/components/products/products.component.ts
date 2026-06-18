import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  allProducts: any[] = [];

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const search = params['search'];
    const category = params['category'];

    if (search) {
      this.http.get<any[]>(`${environment.apiUrl}/products`).subscribe(data => {
        this.products = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      });
    } else if (category) {
      this.http.get<any[]>(`${environment.apiUrl}/products`).subscribe(data => {
        this.products = data.filter(p => p.category && p.category._id === category);
      });
    } else {
      this.http.get<any[]>(`${environment.apiUrl}/products`).subscribe(data => {
        this.products = data;
      });
    }
  });
}
  addToCart(product: any) {
    if (!this.authService.isLoggedIn()) {
      alert('Morate biti prijavljeni da biste dodali proizvod u korpu.');
      return;
    }

    this.cartService.addToCart(product);
    alert(`Dodato u korpu: ${product.name}`);
  }
}
