import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  statuses = ['pending', 'processing', 'completed', 'cancelled'];
  token = localStorage.getItem('token'); 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<any[]>(`${environment.apiUrl}/orders`, { headers }).subscribe({
      next: res => this.orders = res,
      error: err => console.error('Greška pri učitavanju porudžbina:', err)
    });
  }

  changeStatus(order: any, newStatus: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.put(`${environment.apiUrl}/orders/${order._id}`, { status: newStatus }, { headers }).subscribe({
      next: () => {
        order.status = newStatus;
        alert('Status ažuriran!');
      },
      error: err => console.error('Greška pri ažuriranju statusa:', err)
    });
  }

  deleteOrder(id: string) {
    if (confirm('Obrisati porudžbinu?')) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      this.http.delete(`${environment.apiUrl}/orders/${id}`, { headers }).subscribe({
        next: () => {
          this.orders = this.orders.filter(o => o._id !== id);
          alert('Porudžbina obrisana!');
        },
        error: err => console.error('Greška pri brisanju porudžbine:', err)
      });
    }
  }
}
