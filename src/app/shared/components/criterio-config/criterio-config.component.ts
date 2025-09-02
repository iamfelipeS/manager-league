import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Leagues } from '../../../models/leagues.model';
import { CriterioService } from '../../../services/criterio.service';
import { ToasterService } from '../../../services/toaster.service';
import { CriterioBase, CriterioDaLiga } from '../../../models/criterios.model';

@Component({
  selector: 'app-criterio-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './criterio-config.component.html',
})
export class CriterioConfigComponent implements OnInit {
  @Input() league?: Leagues;

  private criterioService = inject(CriterioService);
  private toaster = inject(ToasterService);

  readonly criteriosDisponiveis = signal<CriterioBase[]>([]);
  readonly criteriosSelecionados = signal<CriterioDaLiga[]>([]);
  readonly criterioSelecionado = signal<CriterioBase | null>(null);

  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    if (!this.league?.id) return;

    const [todos, selecionados] = await Promise.all([
      this.criterioService.getCriteriosBase(),
      this.criterioService.getCriteriosDaLiga(this.league.id),
    ]);

    const selecionadosIds = new Set(selecionados.map(c => c.id));
    this.criteriosDisponiveis.set(todos.filter(c => !selecionadosIds.has(c.id)));
    this.criteriosSelecionados.set(selecionados);
  }

  selecionar(criterio: CriterioBase): void {
    this.criterioSelecionado.set(criterio);
  }

  ativarSelecionado(): void {
    const crit = this.criterioSelecionado();
    if (!crit || this.criteriosSelecionados().some(c => c.id === crit.id)) return;

    const atualizado = [
      ...this.criteriosSelecionados(),
      {
        ...crit,
        peso: 1,
        ativo: true,
        mostrar_na_tabela: true,
        league_id: this.league?.id ?? '',
      },
    ];

    this.criteriosSelecionados.set(atualizado);
    this.criteriosDisponiveis.set(this.criteriosDisponiveis().filter(c => c.id !== crit.id));
    this.criterioSelecionado.set(null);
  }

  desativarSelecionado(): void {
    const crit = this.criterioSelecionado();
    if (!crit || this.criteriosDisponiveis().some(c => c.id === crit.id)) return;

    const atualizado = this.criteriosSelecionados().filter(c => c.id !== crit.id);
    this.criteriosSelecionados.set(atualizado);
    this.criteriosDisponiveis.set([...this.criteriosDisponiveis(), crit]);
    this.criterioSelecionado.set(null);
  }

  async criarCriterio(): Promise<void> {
    try {
      const nome = prompt('Nome do novo critério:')?.trim();
      if (!nome) return;

      const novo = await this.criterioService.createCriterio(nome);
      this.criteriosDisponiveis.set([...this.criteriosDisponiveis(), novo]);
      this.toaster.success('Critério criado com sucesso!');
    } catch (err) {
      this.toaster.error('Erro ao criar critério');
      console.error(err);
    }
  }

  async salvarCriterios(): Promise<void> {
    this.isLoading.set(true);
    if (!this.league?.id) return;

    try {
      await this.criterioService.salvarCriteriosDaLiga(
        this.league.id,
        this.criteriosSelecionados()
      );
      this.toaster.success('Critérios salvos com sucesso!');
    } catch (err) {
      this.toaster.error('Erro ao salvar critérios');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

}
