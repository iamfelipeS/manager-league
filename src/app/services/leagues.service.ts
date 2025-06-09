// leagues.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Leagues } from '../models/leagues.model';
import { supabase } from '../core/supabase/supabase.client';
import { SupabaseClient } from '@supabase/supabase-js';


@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  private supabase: SupabaseClient = supabase;

  private leagues: Leagues[] = [];

  constructor() { }

  async getAllLeagues(): Promise<Leagues[]> {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  getLeagueByName(name: string): Observable<Leagues | null> {
    const league = this.leagues.find(l => l.name === name);
    return of(league || null);
  }
}