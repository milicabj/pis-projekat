import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: any[] = [];
  newCategory = { name: '', description: '', imageUrl: '' };
  editingCategory: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/categories`).subscribe({
      next: res => this.categories = res,
      error: err => console.error('Greška pri učitavanju kategorija:', err)
    });
  }

  addCategory() {
    this.http.post(`${environment.apiUrl}/categories`, this.newCategory).subscribe({
      next: () => {
        this.newCategory = { name: '', description: '', imageUrl: '' };
        this.fetchCategories();
        alert('Dodato!');
      },
      error: err => console.error('Greška pri dodavanju kategorije:', err)
    });
  }

  startEdit(category: any) {
    this.editingCategory = { ...category };
  }

  cancelEdit() {
    this.editingCategory = null;
  }

  saveEdit() {
    this.http.put(`${environment.apiUrl}/categories/${this.editingCategory._id}`, this.editingCategory).subscribe({
      next: () => {
        this.editingCategory = null;
        this.fetchCategories();
        alert('Izmijenjeno!');
      },
      error: err => console.error('Greška pri izmjeni kategorije:', err)
    });
  }

  deleteCategory(id: string) {
    if (confirm('Obrisati kategoriju?')) {
      this.http.delete(`${environment.apiUrl}/categories/${id}`).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c._id !== id);
          alert('Obrisano!');
        },
        error: err => console.error('Greška pri brisanju kategorije:', err)
      });
    }
  }
}
