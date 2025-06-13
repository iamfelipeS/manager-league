import { Routes } from '@angular/router';
import { LeagueDetailsComponent } from './views/league-details/league-details.component';
import { HomeComponent } from './views/home/home.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'login',
    loadComponent: () => import('./views/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'confirmar-conta',
    loadComponent: () => import('./views/confirm-account/confirm-account.component').then(m => m.ConfirmAccountComponent),
  },
  {
    path: 'meu-perfil',
    loadComponent: () => import('./views/user/usern-panel/user-panel.component').then(m => m.UserPanelComponent),
    canActivate: [roleGuard(['super', 'admin', 'guest'])], // qualquer usuário autenticado
  },
  {
    path: 'jogadores',
    loadComponent: () => import('./views/player-list/player-list.component').then(m => m.PlayerListComponent),
    canActivate: [roleGuard(['super', 'admin'])], // apenas super/admin podem ver a lista completa
    data: {
      ssr: false
    }
  },
  {
    path: 'league-details/:id',
    component: LeagueDetailsComponent, // leitura pública; lógica de edição controlada dentro do componente
  },
  {
    path: 'admin',
    loadComponent: () => import('./views/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [roleGuard(['super', 'admin'])],
  },
  {
    path: 'admin/flags',
    loadComponent: () => import('./views/flag-admin/flag-admin.component').then(m => m.FlagAdminComponent),
    canActivate: [roleGuard(['super'])], // apenas super pode administrar flags
  },
];
