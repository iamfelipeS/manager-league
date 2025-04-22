import { Injectable, signal } from '@angular/core';
import { Player, PlayerFlag } from '../models/player.model';
import { supabase } from '../core/supabase/supabase.client';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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

  // AVATAR // 
  async updateAvatar(player: Player, file: File): Promise<void> {
    const ext = file.name.split('.').pop();
    const filePath = `players/${player.id}-${uuidv4()}.${ext}`;
    const session = await this.supabase.auth.getSession();
    console.log('Sessão atual:', session);
    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type, // ← obrigatório!
      });
  
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Erro ao fazer upload do avatar');
    }
  
    const { data } = this.supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarUrl = data.publicUrl;
  
    const { error: updateError } = await this.supabase
      .from('players')
      .update({ avatarUrl })
      .eq('id', player.id);
  
    if (updateError) {
      throw new Error('Erro ao atualizar o jogador com avatar');
    }
  
    player.avatarUrl = avatarUrl;
  }
  
  
}