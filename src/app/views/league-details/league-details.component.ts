import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeaguesService } from '../../services/leagues.service';
import { PlayerService } from '../../services/player.service';
import { TeamService, Team } from '../../services/team.service';
import { Player } from '../../models/player.model';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../template/footer/footer.component';
import { Leagues } from '../../models/leagues.model';
import { FormsModule } from '@angular/forms';
import { ToasterService } from '../../services/toaster.service';

@Component({
  selector: 'app-league-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './league-details.component.html',
  styleUrl: './league-details.component.scss'
})
export class LeagueDetailsComponent implements OnInit {
  leagueName: string = '';
  league: Leagues | null = null;
  imagemPadrao = '';
  isAdmin = true;
  isFollowing = false;
  activeTab: string = 'info';
  selectedTeamCount = 2;

  // Lista de jogadores disponível (para teste, usamos todos os jogadores do mock)
  playerList: Player[] = [];
  // Times gerados, conforme o TeamService
  generatedTeams: Team[] = [];

  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);
  private playerService = inject(PlayerService);
  private leaguesService = inject(LeaguesService);
  private toasterService = inject(ToasterService);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.leagueName = params['name'];
      this.loadLeagueDetails();
    });

    this.checkIfUserIsAdmin();

    // Para teste: carrega os jogadores do mock
    this.playerList = this.playerService.getPlayers();

    //por liga
    // this.playerList = this.playerService.getPlayers().filter(p => p.leagueId === this.leagueName);

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

  generateTeams() {
    const selectedPlayers = this.playerList.filter(p => p.selected);
  
    if (selectedPlayers.length < 2) {
      this.toasterService.warning('Selecione pelo menos dois jogadores para gerar os times.');
      return;
    }
  
    this.teamService.generateTeams(selectedPlayers, this.selectedTeamCount);
    this.generatedTeams = this.teamService.teams();
  }
  

  togglePlayerSelection(player: Player) {
    player.selected = !player.selected;
  }

  setAutoTeamCount() {
    const selected = this.playerList.filter(p => p.selected);
    const totalPlayers = selected.length;

    // Cada time precisa ter ao menos 5 jogadores de linha + 1 goleiro
    const possibleTeams = Math.floor(totalPlayers / 6);
    this.selectedTeamCount = Math.max(possibleTeams, 2); // mínimo 2 times
  }


  followLeague() {
    this.isFollowing = !this.isFollowing;
    // Lógica de seguir/desseguir a liga
  }

  checkIfUserIsAdmin() {
    // Simulação aleatória para teste
    this.isAdmin = Math.random() > 0.5;
  }
}
