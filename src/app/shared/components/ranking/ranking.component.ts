import { Component, Input, OnInit, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CriterioService } from '../../../services/criterio.service';
import { PlayerService } from '../../../services/player.service';
import { Player } from '../../../models/player.model';
import { ModalComponent } from '../modal/modal.component';
import { CriterioConfigComponent } from '../criterio-config/criterio-config.component';
import { PlayerCriterioService } from '../../../services/player-criterio.service';
import { ToasterService } from '../../../services/toaster.service';
import { AuthService } from '../../../services/auth.service';
import { Leagues } from '../../../models/leagues.model';
import { LoaderComponent } from '../loader/loader.component';
import { CriterioDaLiga } from '../../../models/criterios.model';

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
  private playerCriterioService = inject(PlayerCriterioService);

  readonly canEdit = computed(() => {
    const profile = this.auth.profile();
    if (!this.league || !profile) return false;
    return this.auth.canEditLeague(this.league);
  });

  readonly isGuest = computed(() => this.auth.isGuest());
  editingCriterios = signal<{ [playerId: string]: { [criterio: string]: boolean } }>({});


  isLoading = signal(true);
  players = signal<Player[]>([]);
  criterios = signal<CriterioDaLiga[]>([]);

  ngOnInit() {
    this.loadDados();
  }

  async loadDados() {
    this.isLoading.set(true);

    const [playersResp, criteriosResp, valoresResp] = await Promise.all([
      this.playerService.getPlayersPontuaveis(this.league.id),
      this.criterioService.getCriteriosDaLiga(this.league.id),
      this.playerCriterioService.getValoresPorLiga(this.league.id), // ✅
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
        const campo = crit.nome;
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
      await this.playerCriterioService.salvarValores(updates);

      // Salva os troféus dos jogadores
      await this.playerService.updateTrofeusBulk(this.players());

      this.toaster.success('Pontuações e troféus salvos com sucesso!');
    } catch (error) {
      this.toaster.error('Erro ao salvar pontuações e troféus.');
    } finally {
      this.isLoading.set(false);
    }
  }

  updateCriterio(player: Player, nome: string, valor: number) {
    if (!player.criterios) {
      player.criterios = {};
    }
    player.criterios[nome] = valor;
  }

  abrirModalCriterios() {
    this.modal.open({
      title: 'Configurar Critérios de Desempate',
      template: this.criteriosTemplateRef,
      showFooter: false,
    });
  }

  getValor(player: Player, chave: string): any {
    const isRestricted = this.league.private && this.auth.isGuest();
    if (isRestricted) return '-';

    return player.criterios?.[chave] ?? (player as Record<string, any>)[chave] ?? '-';
  }

  //EDIÇÃO
  getCriterioValor(player: Player, nome: string): number | null {
    return player.criterios?.[nome] ?? null;
  }
  getCriteriosDinamicos(): CriterioDaLiga[] {
    return this.criterios().filter(c => c.nome.toLowerCase() !== 'pontos');
  }

  setCriterioValor(player: Player, nome: string, valor: number): void {
    if (!player.criterios) {
      player.criterios = {};
    }
    player.criterios[nome] = valor;
  }


  estaEditando(playerId: string, criterio: string): boolean {
    return this.editingCriterios()[playerId]?.[criterio] ?? false;
  }

  ativarEdicao(playerId: string, criterio: string) {
    const editMap = { ...this.editingCriterios() };
    if (!editMap[playerId]) editMap[playerId] = {};
    editMap[playerId][criterio] = true;
    this.editingCriterios.set(editMap);
  }

  desativarEdicao(playerId: string, criterio: string) {
    const editMap = { ...this.editingCriterios() };
    if (editMap[playerId]) editMap[playerId][criterio] = false;
    this.editingCriterios.set(editMap);
  }

}
