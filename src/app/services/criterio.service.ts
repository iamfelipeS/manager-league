import { Injectable, signal } from '@angular/core';
import { supabase } from '../core/supabase/supabase.client';

export interface Criterio {
  id: number;
  nome: string;
  prioridade: number;
  peso: number;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CriterioService {
  readonly criterios = signal<Criterio[]>([]);

  async getCriterios(): Promise<Criterio[]> {
    const { data, error } = await supabase
      .from('criterios')
      .select('*')
      .order('prioridade', { ascending: true });

    if (error) throw error;

    this.criterios.set(data ?? []);
    return data ?? [];
  }

  async updateAll(criterios: Criterio[]): Promise<void> {
    const { error } = await supabase
      .from('criterios')
      .upsert(criterios.map(c => ({
        id: c.id,
        nome: c.nome,
        prioridade: c.prioridade,
        peso: c.peso,
        ativo: c.ativo,
      })));

    if (error) throw error;

    this.criterios.set([...criterios]);
  }
}
