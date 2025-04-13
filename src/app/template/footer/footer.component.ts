import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
  private platformId = inject(PLATFORM_ID);

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
    const matchedItem = Object.entries(this.routesMap).find(([key, path]) => url.includes(path));
    this.activeMenuItem = matchedItem?.[0] || null;
  }

  navigateTo(menuItem: string): void {
    this.activeMenuItem = menuItem;

    if (isPlatformBrowser(this.platformId)) {
      const role = localStorage.getItem('role') || 'guest';

      if (!role && menuItem !== 'home') {
        this.toasterService.warning('Você precisa estar logado para acessar esta página.');
        this.router.navigate(['/home']);
        return;
      }

      localStorage.setItem('role', role);
    }

    const route = this.routesMap[menuItem] || '/home';
    this.router.navigate([route]);
  }
}
