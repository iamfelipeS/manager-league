// leagues.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Leagues } from '../models/leagues.model';

@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  // Dados mocados para simulação
  private leagues: Leagues[] = [
    { 
      name: 'Liga Verssat', 
      img: 'caminho/para/img1.jpg', 
      private: false, 
      organizer: [
        {
          name: 'Felipe',
          email: 'felipe@email.com'
        }
      ] 
    },
    { 
      name: 'Copa do Brasil', 
      img: '', 
      private: true,
      organizer: [
        {
          name: 'CBF',
          email: 'cbf@email.com'
        }
      ]
    },
    { 
      name: 'Brasileirão', 
      img: 'caminho/para/imagem3.jpg',
      private: false,
      organizer: [
        {
          name: 'CBF',
          email: 'cbf@email.com'
        }
      ]
    },
  ];

  constructor() { }

  getAllLeagues(): Observable<Leagues[]> {
    return of(this.leagues);
  }

  getLeagueByName(name: string): Observable<Leagues | null> {
    const league = this.leagues.find(l => l.name === name);
    return of(league || null);
  }
}