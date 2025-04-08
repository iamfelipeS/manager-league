import { Routes } from '@angular/router';
import { LeagueDetailsComponent } from './views/league-details/league-details.component';
import { HomeComponent } from './views/home/home.component';
import { PlayerListComponent } from './views/player-list/player-list.component';

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
        path: 'jogadores',
        component: PlayerListComponent,
    },
    {
        path: 'league-details/:name',
        component: LeagueDetailsComponent,
    },
    //   {
    //     path: '**',
    //     redirectTo: '',
    //   },
    // {
    //     path: '',
    //     redirectTo: 'home', 
    //     pathMatch: 'full'
    // },
    // {
    //     path: 'home',
    //     component: HomeComponent
    // },
    // {
    //     path: 'league-details/:name',
    //     component: LeagueDetailsComponent,
    //     children: [
    //         {
    //             path: '',
    //             redirectTo: 'overview',
    //             pathMatch: 'full'
    //         },
    //         {
    //             path: 'jogadores',
    //             component: PlayerListComponent
    //         },
    //         // {
    //         //     path: 'classificacao',
    //         //     component: ClassificacaoComponent
    //         // },
    //         // {
    //         //     path: 'vencedores',
    //         //     component: VencedoresComponent
    //         // },
    //         // {
    //         //     path: 'noticias',
    //         //     component: NoticiasComponent
    //}
    //     ]
    // },
    // {
    //     path: 'jogadores',
    //     component: PlayerListComponent
    // },
    // // {
    // //     path: 'classificacao',
    // //     component: ClassificacaoComponent
    // // },
    // // {
    // //     path: 'vencedores',
    // //     component: VencedoresComponent
    // // },
    // // {
    // //     path: 'noticias',
    // //     component: NoticiasComponent
    // // },
    // { 
    //     path: '**', 
    //     redirectTo: 'home' 
    // }
];
