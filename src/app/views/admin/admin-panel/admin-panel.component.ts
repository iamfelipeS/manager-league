import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ToasterService } from '../../../services/toaster.service';
import { Profile, Role } from '../../../models/profile.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  private auth = inject(AuthService);
  private toaster = inject(ToasterService);

  currentUser = this.auth.currentUser;
  currentRole = this.auth.role;
  isSuper = computed(() => this.currentRole() === 'super');

  users = signal<Profile[]>([]);

  async ngOnInit() {
    if (this.isSuper()) {
      const all = await this.auth.getAllUsers();
      this.users.set(all);
    }
  }

  async trocarRole(userId: string, novaRole: Role) {
    const error = await this.auth.updateRole(userId, novaRole);
    if (!error) {
      const updatedUsers = this.users().map(user =>
        user.id === userId ? { ...user, role: novaRole } : user
      );
      this.users.set(updatedUsers);
      this.toaster.info(`Usuário atualizado para ${novaRole}`);
    } else {
      this.toaster.error('Erro ao atualizar role');
    }
  }
}
