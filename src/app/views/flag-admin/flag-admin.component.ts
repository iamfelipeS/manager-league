import { Component, inject, signal } from '@angular/core';
import { FlagService } from '../../services/flag.service';
import { ToasterService } from '../../services/toaster.service';
import { PlayerFlag } from '../../models/player.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flag-admin',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './flag-admin.component.html',
  styleUrl: './flag-admin.component.scss'
})
export class FlagAdminComponent {
  private flagService = inject(FlagService);
  private toaster = inject(ToasterService);

  flags = signal<PlayerFlag[]>([]);
  isLoading = signal(true);

  async ngOnInit() {
    this.loadFlags();
  }

  async loadFlags() {
    this.isLoading.set(true);
    try {
      const list = await this.flagService.getAllFlags();
      this.flags.set(list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })));
    } catch (error) {
      this.toaster.error('Erro ao carregar flags');
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleAffectsGeneration(flag: PlayerFlag) {
    try {
      flag.affectsTeamGeneration = !flag.affectsTeamGeneration;
      await this.flagService.updateFlag(flag);
      this.toaster.success(`Flag atualizada: ${flag.name}`);
    } catch (error) {
      this.toaster.error('Erro ao atualizar flag');
    }
  }
  async createFlagPrompt() {
    const name = prompt('Digite o nome do novo grupo:');
    if (!name || !name.trim()) return;
  
    try {
      const newFlag = await this.flagService.createFlag(name.trim(), true);
      this.flags.update(list =>
        [...list, newFlag].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
      );
      this.toaster.success('Grupo criado!');
    } catch (error) {
      this.toaster.error('Erro ao criar grupo');
    }
  }
  async deleteFlag(flag: PlayerFlag) {
    if (!confirm(`Deseja realmente remover o grupo "${flag.name}"?`)) return;
  
    try {
      await this.flagService.deleteFlag(flag.id);
      this.flags.update(list => list.filter(f => f.id !== flag.id));
      this.toaster.success('Grupo removido.');
    } catch (error) {
      this.toaster.error('Erro ao remover grupo');
    }
  }
    
}
