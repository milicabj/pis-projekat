import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  categories: any[] = [];
  searchTerm = '';

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categories`).subscribe({
      next: (res) => {
        this.categories = res;
      },
      error: (err) => console.error('Greška pri učitavanju kategorija', err)
    });
  }

  goToCategory(category: any) {
    this.router.navigate(['/products'], { queryParams: { category: category._id } });
  }

  goToAllProducts() {
    this.router.navigate(['/products']);
  }

  onSearch() {
    const trimmed = this.searchTerm.trim();
    if (trimmed.length > 0) {
      this.router.navigate(['/products'], { queryParams: { search: trimmed } });
      this.searchTerm = ''; 
  }
}

  logout() {
    this.authService.logout();
  }

  handleUserClick() {
  if (this.authService.isLoggedIn()) {
    this.router.navigate(['/orders']);
  } else {
    this.router.navigate(['/login']);
  }
}

goToCart() {
  this.router.navigate(['/cart']);
}

}
