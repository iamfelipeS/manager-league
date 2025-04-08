import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Player } from '../../../../models/player.model';
import { PlayerService } from '../../../../services/player.service';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player-form.component.html',
  styleUrl: './player-form.component.scss'
})
export class PlayerFormComponent implements OnInit {
  @Input() jogador: Player | null = null;


  private fb = inject(FormBuilder);
  private playerService = inject(PlayerService);

  form: FormGroup = this.fb.group({
    name: [''],
    posicao: [''],
    qualidade: [3],
    velocidade: [2],
    movimentacao: ['Normal'],
    fase: [2],
  });

  qualidadeLabels = ['Muito ruim', 'Ruim', 'OK', 'Bom', 'Craque'];
  velocidadeLabels = ['Lento', 'Médio', 'Rápido'];
  movimentacaoOptions = ['Estático', 'Normal', 'Intenso'];
  faseLabels = ['Zicado', 'Normal', 'Iluminado'];

  ngOnInit(): void {
    if (this.jogador) {
      this.form.patchValue(this.jogador);
    }
  }

  set(field: string, value: any): void {
    this.form.patchValue({ [field]: value });
  }

  getLabel(field: string): string {
    const value = this.form.value[field];
    if (field === 'qualidade') return this.qualidadeLabels[value - 1];
    if (field === 'velocidade') return this.velocidadeLabels[value - 1];
    if (field === 'fase') return this.faseLabels[value - 1];
    return '';
  }

  calculateRating(): number {
    const { qualidade, velocidade, fase } = this.form.value;
    return Math.round((qualidade + velocidade + fase) / 3);
  }

  // onSubmit(): void {
  //   if (this.form.valid) {
  //     const playerData: Player = {
  //       id: this.jogador?.id || crypto.randomUUID(),
  //       ...this.form.value,
  //       rating: this.calculateRating()
  //     };

  //     if (this.jogador) {
  //       console.log('Editando jogador:', playerData);
  //     } else {
  //       console.log('Criando novo jogador:', playerData);
  //     }
  //   }
  // }
  onSubmit(): void {
    if (this.form.valid) {
      const playerData: Player = {
        id: this.jogador?.id || crypto.randomUUID(),
        ...this.form.value,
        rating: this.calculateRating(),
      };
  
      if (this.jogador) {
        this.playerService.update(playerData);
      } else {
        this.playerService.add(playerData);
      }
    }
  }


  onCancel(): void {
    console.log('Cancelado');
  }
}
