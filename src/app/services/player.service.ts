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
  avatar_url?: string | null;
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
  
    const players = (data as PlayerWithJoin[] ?? []).map(player => {
      const { player_flags, avatar_url, ...rest } = player;
  
      return {
        ...rest,
        avatarUrl: avatar_url ?? null, 
        flags: player_flags?.map(pf => pf.flags) ?? []
      };
    });
  
    return players;
  }
  

  async addPlayer(player: PlayerWithJoin): Promise<void> {
    const { flags, player_flags, avatarUrl, ...playerData } = player;
    const { error } = await this.supabase.from('players').insert([playerData]);
    if (error) throw error;
  }

  async updatePlayer(player: PlayerWithJoin): Promise<void> {
    const { flags, player_flags, avatarUrl, ...playerData } = player;
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
    const fileExt = file.name.split('.').pop();
    const filePath = `players/${player.id}/avatar.${fileExt}`; // novo caminho organizado
  
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      });
  
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Erro ao fazer upload do avatar');
    }
  
    const { data: publicData } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
  
    if (!publicData) {
      throw new Error('Erro ao obter URL pública do avatar');
    }
  
    const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;
  
    const { error: updateError } = await this.supabase
      .from('players')
      .update({ avatar_url: avatarUrl })
      .eq('id', player.id);
  
    if (updateError) {
      console.error('Update player error:', updateError);
      throw new Error('Erro ao atualizar o jogador com avatar');
    }
  
    player.avatarUrl = avatarUrl;
  }
  
    
}