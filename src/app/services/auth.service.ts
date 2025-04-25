import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../enviroments/enviroment';
import { Profile, Role } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  currentUser = signal<Profile | null>(null);
  role = signal<'super' | 'admin' | 'guest' | null>(null);

  constructor() {
    this.refreshUserSession(); // Carrega sessão ao iniciar
  }

  async refreshUserSession() {
    const { data } = await this.supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id, username, role, avatar_url')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        this.currentUser.set(profile);
        this.role.set(profile.role);
      }
    }
  }

  async login(email: string, password: string) {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    await this.refreshUserSession();
    return error;
  }

  async register(email: string, password: string) {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/confirmar-conta'
      }
    });
    return error;
  }

  async sendPasswordReset(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/nova-senha',
    });
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.role.set(null);
  }

  async updateProfile(data: { username?: string; avatar_url?: string }) {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    const { error } = await this.supabase.from('profiles').upsert({
      id: userId,
      ...data,
    });

    return error;
  }

  async updateRole(userId: string, newRole: Role) {
    const { error } = await this.supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      this.role.set(newRole);
    }

    return error;
  }

  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, username, role, avatar_url');

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    return data as Profile[];
  }

  async setSessionWithHashToken(access_token: string, refresh_token: string) {
    return await this.supabase.auth.setSession({ access_token, refresh_token });
  }

  async getCurrentRawUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }
}
