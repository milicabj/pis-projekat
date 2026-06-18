import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  categories: any[] = [];
  topProducts: any[] = [];
  brands: any[] = [];
  featuredCategories: any[] = [];

  carouselImages = [
    'https://www.amicafarmacia.com/media/amasty/shopby/option_images/EUCERIN_banner_BP_STANDARD_1920x500px.jpg',
    'https://www.blinkshop.com/images/Userfiles/vichy_pt_en1.png',
    'https://www.hiper.rs/pub/media/Slike_za_opise/vitamin-d-detrical.jpg'
  ];
  currentImageIndex = 0;

  constructor(private http: HttpClient, private router: Router) {}

  readonly defaultCategoryImage = 'assets/products.png';

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/categories`).subscribe(res => {
      this.categories = res;
      this.featuredCategories = res.map(category => ({
        name: category.name,
        imageUrl: category.imageUrl || this.defaultCategoryImage,
        id: category._id
      }));
    });

    this.http.get<any[]>(`${environment.apiUrl}/products`)
      .subscribe(res => this.topProducts = res.slice(0, 8));

    this.brands = [
      { name: 'Esensa', logo: 'assets/brands/esensa.png' },
      { name: 'Curaprox', logo: 'assets/brands/curaprox.png' },
      { name: 'Bayer', logo: 'assets/brands/bayer.png' },
      { name: 'Dr.Theiss', logo: 'assets/brands/theiss.png' },
      { name: 'Pierre Fabre', logo: 'assets/brands/fabre.png' },
      { name: 'Pampers', logo: 'assets/brands/pampers.png' }
    ];

    setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
    }, 5000);
  }

  onCategoryImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('products.png')) {
      img.src = this.defaultCategoryImage;
    }
  }

  goToCategory(id: string): void {
    if (id) {
      this.router.navigate(['/products'], { queryParams: { category: id } });
    }
  }

  scrollSlider(direction: 'left' | 'right') {
    const container = document.querySelector('.slider') as HTMLElement;
    if (!container) return;
    const scrollAmount = 300;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  showImage(index: number) {
    this.currentImageIndex = index;
  }
}
