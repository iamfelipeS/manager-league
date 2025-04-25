import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToasterService } from '../../services/toaster.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isLoginView = true;
  isRecoverView = false;
  isLoading = false;

  nome = signal('');
  email = signal('');
  password = signal('');
  loading = signal(false);
  showPassword = signal(false);
  confirmarSenha = signal('');
  currentView = signal<'login' | 'recover' | 'register'>('login');

  private auth = inject(AuthService);
  private router = inject(Router);
  private toaster = inject(ToasterService);

  async onLogin() {
    this.loading.set(true);
    const error = await this.auth.login(this.email(), this.password());
    this.loading.set(false);

    if (!error) {
      const role = this.auth.role();
      this.toaster.success('Login realizado com sucesso!');

      // Redireciona por tipo de usuário
      if (role === 'admin' || role === 'super') {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/meu-perfil');
      }
    } else {
      this.toaster.error('Erro ao logar: ' + error.message);
    }
  }

  async submitLogin() {
    if (!this.email() || !this.password()) return;

    this.loading.set(true);
    try {
      const error = await this.auth.login(this.email(), this.password());
      if (!error) {
        this.toaster.success('Login realizado com sucesso!');
        const role = this.auth.role();
        this.router.navigateByUrl(role === 'admin' || role === 'super' ? '/admin' : '/meu-perfil');
      } else {
        this.toaster.error('Erro ao logar: ' + error.message);
      }
    } finally {
      this.loading.set(false);
    }
  }

  async submitSendEmailToResetPassword() {
    if (!this.email()) return;

    const { error } = await this.auth.sendPasswordReset(this.email());

    if (!error) {
      this.toaster.success('Email enviado com sucesso');
    } else {
      this.toaster.error('Erro: ' + error.message);
    }
  }

  toggleView(target: 'login' | 'recover' | 'register') {
    const flip = document.querySelector('.flip');
    flip?.classList.add('rotate');

    setTimeout(() => {
      this.currentView.set(target);
      flip?.classList.remove('rotate');
    }, 400);
  }

  toggleShowPassword() {
    this.showPassword.update(v => !v);
  }

  onRecover() {
    this.isRecoverView = true;
    this.isLoginView = false;
  }

  onRegister() {

  }

  backToLogin() {
    this.isRecoverView = false;
    this.isLoginView = true;
  }

  onFlip(): void {
    const flip = document.querySelector('.flip');
    flip?.classList.add('rotate');
    setTimeout(() => {
      flip?.classList.remove('rotate');
    }, 500);
  }
}
