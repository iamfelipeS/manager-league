import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  activeMenuItem: string | null = null;
  private router = inject(Router);
  
  ngOnInit(): void {
    // Atualizar activeMenuItem quando a rota mudar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setActiveMenuItemFromUrl(this.router.url);
    });
    
    // Definir activeMenuItem inicial com base na URL atual
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
    
    // Verificar se o usuário está logado (opcional)
    const role = localStorage.getItem('role');
    if(!role && menuItem !== 'home') {
      this.router.navigate(['/login']);
      return;
    }
    
    // Navegar para a rota correspondente
    switch (menuItem) {
      case 'home':
        this.router.navigate(['/home']);
        break;
      case 'classificacao':
        this.router.navigate(['/classificacao']);
        break;
      case 'jogadores':
        this.router.navigate(['/jogadores']);
        break;
      case 'vencedores':
        this.router.navigate(['/vencedores']);
        break;
      case 'noticias':
        this.router.navigate(['/noticias']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
}