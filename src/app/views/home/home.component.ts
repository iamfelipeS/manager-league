import { Component, inject, OnInit, signal } from '@angular/core';
import { Leagues } from '../../models/leagues.model';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToasterService } from '../../services/toaster.service';
import { LeaguesService } from '../../services/leagues.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  private router = inject(Router);
  private toaster = inject(ToasterService);
  private leaguesService = inject(LeaguesService);
  readonly authService = inject(AuthService);

  filtro = signal('');
  leagues = signal<Leagues[]>([]);
  isLoading = signal(true);

  async ngOnInit() {
    const msg = localStorage.getItem('mensagem_ativacao');
    if (msg) {
      this.toaster.success(msg);
      localStorage.removeItem('mensagem_ativacao');
    }

    this.isLoading.set(true);
    try {
      const all = await this.leaguesService.getAllLeagues();
      this.leagues.set(all);
    } catch (err) {
      this.toaster.error('Erro ao carregar ligas');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  ligasFiltradas(): Leagues[] {
    const termo = this.filtro().toLowerCase().trim();
    return this.leagues().filter(liga =>
      liga.name.toLowerCase().includes(termo)
    );
  }

  imagemPadrao = 'liga_padrao.png';

  navigateToDetails(id: string) {
    this.router.navigate(['/league-details', id]);
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/']); 
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      this.toaster.error('Erro ao fazer logout');
    }
  }
}
