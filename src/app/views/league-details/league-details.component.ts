import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeaguesService } from '../../services/leagues.service';
import { Leagues } from '../../models/leagues.model';

@Component({
  selector: 'app-league-details',
  standalone: true,
  imports: [],
  templateUrl: './league-details.component.html',
  styleUrl: './league-details.component.scss'
})
export class LeagueDetailsComponent implements OnInit {
  leagueName: string = '';
  league: Leagues | null = null;
  imagemPadrao = '';
  isAdmin = false; 
  isFollowing = false;
  activeTab: string = 'info';
  
  private route = inject(ActivatedRoute);
  private leaguesService = inject(LeaguesService);
  

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.leagueName = params['name'];
      this.loadLeagueDetails();
    });
    
    // Simulação de verificação de admin (implemente sua própria lógica)
    this.checkIfUserIsAdmin();
  }

  loadLeagueDetails() {
    this.leaguesService.getLeagueByName(this.leagueName).subscribe({
      next: (league) => {
        this.league = league;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes da liga', err);
      }
    });
    
    // Simulação para desenvolvimento
    this.league = {
      name: this.leagueName,
      img: '',
      private: true,
      organizer: [
        { name: 'Organizador 1', email: 'contato@organizador.com' }
      ]
    };
  }
  
  followLeague() {
    // Implementar lógica para seguir/deixar de seguir a liga
    this.isFollowing = !this.isFollowing;
    // Aqui você deve chamar o serviço para salvar essa preferência
  }
  
  checkIfUserIsAdmin() {
    // Simulando uma verificação de admin (implemente sua própria lógica)
    // Por exemplo, verificar se o email do usuário logado coincide com o email do organizador
    this.isAdmin = Math.random() > 0.5; // Simulação aleatória para demonstração
  }
}
