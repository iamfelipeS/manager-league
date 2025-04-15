import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToasterService } from '../../services/toaster.service';
import { Router } from 'express';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toaster = inject(ToasterService);
  private router = inject(Router);

  user = {
    email: '',
    password: '',
  };

  isLoading = signal(false);
  showPassword = false;
  showForgotPassword = false;

  toggleForgotPasswordCard() {
    this.showForgotPassword = !this.showForgotPassword;
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  async submitLogin() {
    if (!this.user.email || !this.user.password) {
      this.toaster.error('Preencha e-mail e senha');
      return;
    }

    this.isLoading.set(true);
    const error = await this.auth.login(this.user.email, this.user.password);
    this.isLoading.set(false);

    if (error) {
      this.toaster.error('Erro no login: ' + error.message);
    } else {
      this.toaster.success('Login realizado!');
      this.router.navigateByUrl('/'); // ou redirecione para dashboard
    }
  }

  // async submitSendEmailToResetPassword() {
  //   const { error } = await this.auth.supabase.auth.resetPasswordForEmail(this.user.email, {
  //     redirectTo: 'https://verssat.netlify.app/update-password',
  //   });

  //   if (error) {
  //     this.toaster.error('Erro ao enviar e-mail: ' + error.message);
  //   } else {
  //     this.toaster.success('Link de redefinição enviado!');
  //   }
  // }
}
