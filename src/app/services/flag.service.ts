import { Injectable, signal } from '@angular/core';
import { supabase } from '../core/supabase/supabase.client';
import { PlayerFlag } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class FlagService {
  readonly flags = signal<PlayerFlag[]>([]);

  async createFlag(name: string): Promise<PlayerFlag> {
    const { data, error } = await supabase
      .from('flags')
      .insert({ name })
      .select()
      .single();
  
    if (error) throw error;
    return data as PlayerFlag;
  }

  async getAllFlags(): Promise<PlayerFlag[]> {
    const { data, error } = await supabase
      .from<'flags', PlayerFlag>('flags')
      .select('*');
  
    if (error) throw error;
  
    this.flags.set(data ?? []);
    return data ?? [];
  }
  

  async getFlagsByPlayerId(playerId: string): Promise<PlayerFlag[]> {
    const { data, error } = await supabase
      .from('player_flags')
      .select('flag_id, flags (id, name)')
      .eq('player_id', playerId);

    if (error) throw error;

    return (data ?? []).map((item: any) => item.flags);
  }

  async updatePlayerFlags(playerId: string, flagIds: number[]): Promise<void> {
    // Remove antigas
    const { error: deleteError } = await supabase
      .from('player_flags')
      .delete()
      .eq('player_id', playerId);

    if (deleteError) throw deleteError;

    // Insere novas
    if (flagIds.length > 0) {
      const inserts = flagIds.map(flagId => ({
        player_id: playerId,
        flag_id: flagId
      }));

      const { error: insertError } = await supabase
        .from('player_flags')
        .insert(inserts);

      if (insertError) throw insertError;
    }
  }
}
