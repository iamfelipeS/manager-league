import { Component, inject, OnInit, signal } from '@angular/core';
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
export class LoginComponent implements OnInit {
  isLoginView = true;
  isRecoverView = false;

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

  ngOnInit(){
  }

  async onLogin() {
    this.loading.set(true);
    const error = await this.auth.login(this.email(), this.password());
  
    if (error) {
      const mensagemTraduzida = this.getMensagemErroTraduzida(error.code as string);
      this.toaster.error(mensagemTraduzida);
      return;
    }
  
    const role = this.auth.role();
    this.loading.set(false);
  
    this.router.navigateByUrl('/');
   
  }
  
  private getMensagemErroTraduzida(code: string): string {
    switch (code) {
      case 'invalid_login_credentials':
      case 'invalid_credentials':
        return 'E-mail ou senha incorretos.';
      case 'user_not_confirmed':
        return 'Verifique seu e-mail para confirmar sua conta.';
      case 'user_not_found':
        return 'Usuário não encontrado.';
      case 'email_not_confirmed':
        return 'Você precisa confirmar o e-mail antes de continuar.';
      default:
        return 'Erro inesperado. Tente novamente.';
    }
  }
  
  async submitSendEmailToResetPassword() {
    if (!this.email()) {
      this.toaster.warning('Informe seu e-mail.');
      return;
    }
  
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

  async onRegister() {
    if (!this.email() || !this.password() || !this.confirmarSenha()) {
      this.toaster.error('Preencha todos os campos.');
      return;
    }
  
    if (this.password() !== this.confirmarSenha()) {
      this.toaster.error('As senhas não coincidem.');
      return;
    }
  
    const error = await this.auth.register(this.email(), this.password());
  
    if (!error) {
      this.toaster.success('Cadastro realizado! Verifique seu e-mail para ativar a conta.');
      this.toggleView('login');
    } else {
      this.toaster.error('Erro ao cadastrar: ' + error.message);
    }
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
