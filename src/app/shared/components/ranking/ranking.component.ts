import { Component, Input, OnInit, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CriterioService, Criterio } from '../../../services/criterio.service';
import { PlayerService } from '../../../services/player.service';
import { Player } from '../../../models/player.model';
import { ModalComponent } from '../modal/modal.component';
import { CriterioConfigComponent } from '../criterio-config/criterio-config.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, CriterioConfigComponent, ModalComponent],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss'
})
export class RankingComponent implements OnInit {
  @Input({ required: true }) leagueId!: string;
  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('criteriosTemplate') criteriosTemplateRef!: TemplateRef<any>;

  private playerService = inject(PlayerService);
  private criterioService = inject(CriterioService);

  players = signal<Player[]>([]);
  criterios = signal<Criterio[]>([]);
  isAdmin = signal<boolean>(true);

  ngOnInit() {
    this.loadDados();
  }

  async loadDados() {
    const [playersResp, criteriosResp] = await Promise.all([
      this.playerService.getPlayersPontuaveis(this.leagueId),
      this.criterioService.getCriterios(),
    ]);

    this.players.set(playersResp);
    this.criterios.set(criteriosResp.sort((a, b) => a.prioridade - b.prioridade));

    console.log(this.players)
  }

  ordenarJogadores(): Player[] {
    return this.players().sort((a, b) => {
      for (const criterio of this.criterios()) {
        const key = criterio.nome.toLowerCase() as keyof Player;
        if ((a as any)[key] > (b as any)[key]) return -1;
        if ((a as any)[key] < (b as any)[key]) return 1;
      }
      return 0;
    });
  }

  togglePontua(player: Player) {
    player.pontua = !player.pontua;
    this.playerService.update(player);
  }

  salvarCriterios() {
    this.criterioService.updateAll(this.criterios());
  }

  getValor(player: Player, chave: string): any {
    return (player as Record<string, any>)[chave] ?? '-';
  }

  abrirModalCriterios() {
    this.modal.open({
      title: 'Configurar Critérios de Desempate',
      template: this.criteriosTemplateRef,
    });
  }

}
