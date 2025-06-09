import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CriterioService, Criterio } from '../../../services/criterio.service';
import { PlayerService } from '../../../services/player.service';
import { Player } from '../../../models/player.model';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss'
})
export class RankingComponent implements OnInit {
  private playerService = inject(PlayerService);
  private criterioService = inject(CriterioService);

  players = signal<Player[]>([]);
  criterios = signal<Criterio[]>([]);
  isAdmin = signal<boolean>(false);

  ngOnInit() {
    this.loadDados();
  }

  async loadDados() {
    const [playersResp, criteriosResp] = await Promise.all([
      this.playerService.getPlayersPontuaveis(),
      this.criterioService.getCriterios(),
    ]);

    this.players.set(playersResp);
    this.criterios.set(criteriosResp.sort((a, b) => a.prioridade - b.prioridade));
  }

  ordenarJogadores(): Player[] {
    return this.players().sort((a, b) => {
      for (const criterio of this.criterios()) {
        const key = criterio.nome.toLowerCase() as keyof Player;
        if (a[key]! > b[key]!) return -1;
        if (a[key]! < b[key]!) return 1;
      }
      return 0;
    });
  }

  togglePontua(player: Player) {
    player.pontua = !player.pontua;
    this.playerService.update(player); // ⚠️ Certifique-se que esse método existe
  }

  salvarCriterios() {
    this.criterioService.updateAll(this.criterios());
  }

  getValor(player: Player, chave: string): any {
    return (player as Record<string, any>)[chave] ?? '-';
  }

}
