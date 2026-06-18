import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-manufacturers',
  templateUrl: './admin-manufacturers.component.html',
  styleUrls: ['./admin-manufacturers.component.css']
})
export class AdminManufacturersComponent implements OnInit {
  manufacturers: any[] = [];
  newManufacturer = {
    name: '',
    country: ''
  };
  editingId: string | null = null;
  editableManufacturer: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchManufacturers();
  }

  fetchManufacturers(): void {
    this.http.get<any[]>(`${environment.apiUrl}/manufacturers`).subscribe({
      next: (res) => this.manufacturers = res,
      error: (err) => console.error('Greška pri učitavanju:', err)
    });
  }

  addManufacturer(): void {
    this.http.post(`${environment.apiUrl}/manufacturers`, this.newManufacturer).subscribe({
      next: () => {
        this.newManufacturer = { name: '', country: '' };
        this.fetchManufacturers();
        alert('Dodato!');
      },
      error: err => console.error('Greška pri dodavanju proizvodjaca!:', err)
    });
     
  }

  startEdit(manufacturer: any): void {
    this.editingId = manufacturer._id;
    this.editableManufacturer = { ...manufacturer };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editableManufacturer = {};
  }

  saveEdit(id: string): void {
    this.http.put(`${environment.apiUrl}/manufacturers/${id}`, this.editableManufacturer).subscribe({
      next: () => {
        this.fetchManufacturers();
        this.cancelEdit();
      },
      error: (err) => console.error('Greška pri čuvanju:', err)
    });
  }

  deleteManufacturer(id: string): void {
    if (confirm('Da li ste sigurni da želite da obrišete proizvođača?')) {
      this.http.delete(`${environment.apiUrl}/manufacturers/${id}`).subscribe({
        next: () => this.fetchManufacturers(),
        error: (err) => console.error('Greška pri brisanju:', err)
      });
    }
  }
}
