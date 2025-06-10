import { Routes } from '@angular/router';
import { LeagueDetailsComponent } from './views/league-details/league-details.component';
import { HomeComponent } from './views/home/home.component';
import { roleGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./views/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'jogadores',
        loadComponent: () => import('./views/player-list/player-list.component').then(m => m.PlayerListComponent),
        data: {
            ssr: false
        }
    },
    {
        path: 'league-details/:name',
        component: LeagueDetailsComponent,
    },
    // {
    //     path: 'faq',
    //     loadComponent: () => import('./views/faq/faq.component').then(m => m.FaqComponent)
    // },
    {
        path: 'admin',
        loadComponent: () => import('./views/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
        canActivate: [roleGuard(['admin', 'super'])],
    },
    {
        path: 'meu-perfil',
        loadComponent: () => import('./views/user/usern-panel/user-panel.component').then(m => m.UserPanelComponent),
        canActivate: [roleGuard(['guest', 'admin', 'super'])],
    },
    {
        path: 'confirmar-conta',
        loadComponent: () => import('./views/confirm-account/confirm-account.component').then(m => m.ConfirmAccountComponent)
    },
    {
        path: 'admin/flags',
        loadComponent: () => import('./views/flag-admin/flag-admin.component').then(m => m.FlagAdminComponent),
    },

];
