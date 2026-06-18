import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  manufacturers: any[] = [];

  newProduct = {
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: '',
    manufacturer: ''
  };

  editingProduct: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
    this.fetchManufacturers();
  }

  fetchProducts(): void {
    this.http.get<any[]>(`${environment.apiUrl}/products`).subscribe({
      next: (res) => this.products = res,
      error: (err) => console.error('Greška pri učitavanju proizvoda:', err)
    });
  }

  fetchCategories(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categories`).subscribe({
      next: (res) => this.categories = res,
      error: (err) => console.error('Greška pri učitavanju kategorija:', err)
    });
  }

  fetchManufacturers(): void {
    this.http.get<any[]>(`${environment.apiUrl}/manufacturers`).subscribe({
      next: (res) => this.manufacturers = res,
      error: (err) => console.error('Greška pri učitavanju proizvođača:', err)
    });
  }

  addProduct(): void {
    this.http.post(`${environment.apiUrl}/products`, this.newProduct).subscribe({
      next: () => {
        alert('Proizvod dodat!');
        this.fetchProducts();
        this.newProduct = {
          name: '',
          description: '',
          price: 0,
          imageUrl: '',
          category: '',
          manufacturer: ''
        };
      },
      error: (err) => console.error('Greška pri dodavanju proizvoda:', err)
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Da li ste sigurni da želite da obrišete proizvod?')) {
      this.http.delete(`${environment.apiUrl}/products/${id}`).subscribe({
        next: () => {
          this.products = this.products.filter(p => p._id !== id);
          alert('Proizvod obrisan.');
        },
        error: (err) => console.error('Greška pri brisanju proizvoda:', err)
      });
    }
  }

  startEdit(product: any): void {
    this.editingProduct = { ...product }; // Klon da ne mijenja odmah u listi
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  saveEdit(): void {
    this.http.put(`${environment.apiUrl}/products/${this.editingProduct._id}`, this.editingProduct).subscribe({
      next: () => {
        alert('Proizvod ažuriran!');
        this.fetchProducts();
        this.editingProduct = null;
      },
      error: (err) => console.error('Greška pri ažuriranju proizvoda:', err)
    });
  }
}
