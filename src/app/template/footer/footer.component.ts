import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  activeMenuItem: string | null = null;

  private router = inject(Router);
  private toasterService = inject(ToasterService);

  // ✅ Objeto de rotas declarado como propriedade da classe
  private readonly routesMap: { [key: string]: string } = {
    home: '/home',
    classificacao: '/classificacao',
    jogadores: '/jogadores',
    vencedores: '/vencedores',
    noticias: '/noticias',
  };

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setActiveMenuItemFromUrl(this.router.url);
    });

    this.setActiveMenuItemFromUrl(this.router.url);
  }

  setActiveMenuItemFromUrl(url: string): void {
    if (url.includes('/home')) {
      this.activeMenuItem = 'home';
    } else if (url.includes('/classificacao')) {
      this.activeMenuItem = 'classificacao';
    } else if (url.includes('/jogadores')) {
      this.activeMenuItem = 'jogadores';
    } else if (url.includes('/vencedores')) {
      this.activeMenuItem = 'vencedores';
    } else if (url.includes('/noticias')) {
      this.activeMenuItem = 'noticias';
    }
  }

  navigateTo(menuItem: string): void {
    this.activeMenuItem = menuItem;

    // Simula usuário logado
    const role = localStorage.getItem('role') || 'guest';
    localStorage.setItem('role', role);
console.log(role)
    // Verifica se está logado para navegar
    if (!role && menuItem !== 'home') {
      this.toasterService.warning('Você precisa estar logado para acessar esta página.');
      this.router.navigate(['/home']);
      return;
    }

    // Navega para a rota correspondente
    const route = this.routesMap[menuItem] || '/home';
    this.router.navigate([route]);
  }
}
