import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toaster = inject(ToasterService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);

  async onLogin() {
    this.loading.set(true);
    const error = await this.auth.login(this.email(), this.password());
    this.loading.set(false);

    if (!error) {
      const role = this.auth.role();
      this.toaster.success('Login realizado com sucesso!');

      // redireciona baseado na role
      if (role === 'super' || role === 'admin') {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/meu-perfil');
      }
    } else {
      this.toaster.error('Erro ao logar: ' + error.message);
    }
  }
}
