import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-confirm-account',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Confirmando sua conta...</h2>
        <p class="text-gray-600">Aguarde, estamos ativando sua conta.</p>
      </div>
    </div>
  `,
})
export class ConfirmAccountComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private toaster = inject(ToasterService);

  async ngOnInit() {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      const { error } = await this.auth.setSessionWithHashToken(access_token, refresh_token);

      if (!error) {
        await this.auth.loadUserSession();
        this.toaster.success('Conta ativada com sucesso!');

        const role = this.auth.role();
        this.router.navigateByUrl(role === 'super' || role === 'admin' ? '/admin' : '/meu-perfil');
      } else {
        this.router.navigateByUrl('/login');
      }
    } else {
      this.router.navigateByUrl('/login');
    }
  }
}
