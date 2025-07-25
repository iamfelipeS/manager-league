import { Component, Input, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CriterioService } from '../../../services/criterio.service';
import { PlayerService } from '../../../services/player.service';
import { Player } from '../../../models/player.model';
import { ModalComponent } from '../modal/modal.component';
import { CriterioConfigComponent } from '../criterio-config/criterio-config.component';
import { Criterio } from '../../../models/criterios.model';
import { ToasterService } from '../../../services/toaster.service';
import { AuthService } from '../../../services/auth.service';
import { Leagues } from '../../../models/leagues.model';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, CriterioConfigComponent, ModalComponent, LoaderComponent],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss'
})
export class RankingComponent implements OnInit {
  @Input({ required: true }) league!: Leagues;

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('criteriosTemplate') criteriosTemplateRef!: TemplateRef<any>;

  private auth = inject(AuthService);
  private toaster = inject(ToasterService);
  private playerService = inject(PlayerService);
  private criterioService = inject(CriterioService);

  readonly canEdit = computed(() => {
    const profile = this.auth.profile();
    if (!this.league || !profile) return false;
    return this.auth.canEditLeague(this.league);
  });

  readonly isGuest = computed(() => this.auth.isGuest());

  isLoading = signal(true);
  players = signal<Player[]>([]);
  criterios = signal<Criterio[]>([]);

  ngOnInit() {
    this.loadDados();
  }

  async loadDados() {
    this.isLoading.set(true);

    const [playersResp, criteriosResp, valoresResp] = await Promise.all([
      this.playerService.getPlayersPontuaveis(this.league.id),
      this.criterioService.getCriteriosPorLiga(this.league.id),
      this.criterioService.getValoresPorLiga(this.league.id),
    ]);

    const criteriosMap = new Map<string, Record<string, number>>();

    for (const val of valoresResp) {
      if (!criteriosMap.has(val.player_id)) {
        criteriosMap.set(val.player_id, {});
      }
      criteriosMap.get(val.player_id)![val.criterio] = val.valor;
    }

    const jogadoresComValores = playersResp.map(player => ({
      ...player,
      criterios: criteriosMap.get(player.id) ?? {},
    }));

    this.players.set(jogadoresComValores);
    this.criterios.set(criteriosResp);
    this.isLoading.set(false);
  }

  ordenarJogadores(): Player[] {
    const criterios = this.criterios().filter(c => c.ativo).sort((a, b) => a.peso - b.peso);
    const jogadores = [...this.players()];

    return jogadores.sort((a, b) => {
      for (const crit of criterios) {
        const campo = crit.nome.toLowerCase();
        const valorA = this.getValor(a, campo);
        const valorB = this.getValor(b, campo);
        if (valorA !== valorB) return valorB - valorA;
      }
      return 0;
    });
  }

  incrementarTrofeu(player: Player) {
    player.trofeus = (player.trofeus ?? 0) + 1;
    this.playerService.update(player);
  }

  decrementarTrofeu(player: Player) {
    player.trofeus = Math.max((player.trofeus ?? 0) - 1, 0);
    this.playerService.update(player);
  }

  async salvarCriterios() {
    this.isLoading.set(true);
    const criteriosAtualizados = this.criterios().map(c => ({
      ...c,
      league_id: this.league.id,
    }));

    try {
      await this.criterioService.updateCriteriosPorLiga(criteriosAtualizados);
      this.toaster.success('Critérios atualizados com sucesso!');
      this.modal.close();

      const criteriosAtualizadosResp = await this.criterioService.getCriteriosPorLiga(this.league.id);
      this.criterios.set(criteriosAtualizadosResp);
    } catch (error) {
      console.error(error);
      this.toaster.error('Erro ao salvar os critérios.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async salvarAlteracoesJogadores() {
    this.isLoading.set(true);
    try {
      const updates = this.players().flatMap(player => {
        return Object.entries(player.criterios || {}).map(([criterio, valor]) => ({
          player_id: player.id,
          league_id: this.league.id,
          criterio,
          valor: typeof valor === 'number' ? valor : Number(valor),
        }));
      });

      if (!updates.length) {
        this.toaster.warning('Nenhum dado para salvar.');
        return;
      }

      // Salva os critérios
      await this.criterioService.salvarValores(updates);

      // Salva os troféus dos jogadores
      await this.playerService.updateTrofeusBulk(this.players());

      this.toaster.success('Pontuações e troféus salvos com sucesso!');
    } catch (error) {
      this.toaster.error('Erro ao salvar pontuações e troféus.');
    } finally {
      this.isLoading.set(false);
    }
  }


  abrirModalCriterios() {
    this.modal.open({
      title: 'Configurar Critérios de Desempate',
      template: this.criteriosTemplateRef,
      showFooter: false,
    });
  }

  getValor(player: Player, chave: string): any {
    return (player as Record<string, any>)[chave] ?? '-';
  }
}
