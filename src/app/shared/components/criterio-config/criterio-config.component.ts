import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CriterioService } from '../../../services/criterio.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Criterio } from '../../../models/criterios.model';
import { ToasterService } from '../../../services/toaster.service';
import { AuthService } from '../../../services/auth.service';
import { Leagues } from '../../../models/leagues.model';

@Component({
  selector: 'app-criterio-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './criterio-config.component.html',
  styleUrl: './criterio-config.component.scss'
})


export class CriterioConfigComponent implements OnInit {
  @Input({ required: true }) league!: Leagues;


  private auth = inject(AuthService);
  private toaster = inject(ToasterService);
  private criterioService = inject(CriterioService);

  readonly canEdit = computed(() => this.auth.canEditLeague({ id: this.league.id }));

  criterios = signal<Criterio[]>([]);
  criterioSelecionado = signal<Criterio | null>(null);

  criteriosDisponiveis = signal<Criterio[]>([]);
  criteriosSelecionados = signal<Criterio[]>([]);

  async ngOnInit() {
    const lista = await this.criterioService.getCriteriosPorLiga(this.league.id);
    this.criterios.set(lista);
    this.separarCriterios(lista);
  }

  separarCriterios(lista: Criterio[]) {
    this.criteriosDisponiveis.set(lista.filter(c => !c.ativo));
    this.criteriosSelecionados.set(lista.filter(c => c.ativo));
  }

  selecionar(c: Criterio) {
    this.criterioSelecionado.set(c);
  }

  ativarSelecionado() {
    const atual = this.criterioSelecionado();
    if (!atual) return;
    atual.ativo = true;
    this.criterios.update(cs => cs.map(c => c.id === atual.id ? atual : c));
    this.separarCriterios(this.criterios());
  }

  desativarSelecionado() {
    const atual = this.criterioSelecionado();
    if (!atual) return;
    atual.ativo = false;
    this.criterios.update(cs => cs.map(c => c.id === atual.id ? atual : c));
    this.separarCriterios(this.criterios());
  }

  async criarCriterio() {
    if (!this.canEdit()) {
      this.toaster.warning('Apenas administradores podem criar critérios.');
      return;
    }
    const nome = prompt('Nome do novo critério:');
    if (!nome?.trim()) return;

    const criterioExistente = this.criterios().find(c => c.nome.toLowerCase() === nome.toLowerCase());
    if (criterioExistente) {
      alert('Esse critério já existe. Ative-o na lista disponível.');
      return;
    }

    alert('Critérios disponíveis são fixos. Peça para o admin adicionar no catálogo.');
  }

  async salvar() {
    const selecionados = this.criterios().filter(c => c.ativo);

    const pesos = selecionados.map(c => c.peso);
    const unicos = new Set(pesos);
    if (pesos.length !== unicos.size) {
      alert('Não é permitido repetir pesos entre os critérios.');
      return;
    }

    await this.criterioService.updateCriteriosPorLiga(
      this.criterios().map(c => ({
        ...c,
        league_id: this.league.id
      }))
    );
  }
}
