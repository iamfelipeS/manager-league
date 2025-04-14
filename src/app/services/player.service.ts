import { Injectable, signal } from '@angular/core';
import { Player, PlayerFlag } from '../models/player.model';
import { supabase } from '../core/supabase/supabase.client';
import { SupabaseClient } from '@supabase/supabase-js';

type PlayerWithJoin = Player & {
  player_flags?: {
    flag_id: number;
    flags: PlayerFlag;
  }[];
};

@Injectable({ providedIn: 'root' })
export class PlayerService {
  
  private players = signal<Player[]>([]);
  private supabase: SupabaseClient = supabase;

  async getPlayers(): Promise<Player[]> {
    const { data, error } = await this.supabase
      .from('players')
      .select('*, player_flags:player_flags(flag_id, flags(id, name))');
  
    if (error) throw error;
  
    const players = (data as PlayerWithJoin[] ?? []).map(player => ({
      ...player,
      flags: player.player_flags?.map(pf => pf.flags) ?? []
    }));
  
    return players.map(p => ({
      ...p,
      flags: p.flags ?? []
    }));
  }

  async addPlayer(player: PlayerWithJoin): Promise<void> {
    const { flags, player_flags, ...playerData } = player;
    const { error } = await this.supabase.from('players').insert([playerData]);
    if (error) throw error;
  }
  
  async updatePlayer(player: PlayerWithJoin): Promise<void> {
    const { flags, player_flags, ...playerData } = player;
    const { error } = await this.supabase
      .from('players')
      .update(playerData)
      .eq('id', player.id);
    if (error) throw error;
  }

  async deletePlayer(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('players')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}