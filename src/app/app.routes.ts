import { Routes } from '@angular/router';
import { LeagueDetailsComponent } from './views/league-details/league-details.component';
import { HomeComponent } from './views/home/home.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home', pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'leagueDetails/:name',
        component: LeagueDetailsComponent
    },
    { path: '**', redirectTo: 'home' }, // Rota para handling de páginas não encontradas
];
