import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss'
})
export class UserPanelComponent implements OnInit {
  private auth = inject(AuthService);
  private toaster = inject(ToasterService);

  profile = this.auth.profile;
  role = this.auth.role;

  nomeEditado = signal('');
  isEditing = signal(false);

  ngOnInit(): void {
    this.nomeEditado.set(this.profile()?.username || '');
  }

  habilitarEdicao() {
    this.isEditing.set(true);
  }

  async salvarNome() {
    const nome = this.nomeEditado().trim();
    if (!nome) return;
  
    const error = await this.auth.updateProfile({ username: nome });
    if (!error) {
      this.toaster.success('Nome atualizado com sucesso');
      this.isEditing.set(false);
  
      const user = this.profile();
      if (user) {
        user.username = nome;
        this.profile.set({ ...user });
      }
    } else {
      this.toaster.error('Erro ao atualizar nome');
    }
  }
  
}
