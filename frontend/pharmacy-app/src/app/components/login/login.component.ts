import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
  this.authService.login({ email: this.email, password: this.password }).subscribe({
    next: (res) => {
      this.authService.saveToken(res.token);
      this.authService.saveUser(res.user);

      // Redirektuj po roli
      if (res.user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/products']);
      }
    },
    error: (err) => {
      this.error = err.error.message || 'Greška pri prijavi';
    }
  });
}

}
