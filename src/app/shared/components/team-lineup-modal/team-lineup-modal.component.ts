import { Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldLineupComponent } from '../field-lineup/field-lineup.component';
import { Team } from '../../../models/team.model';
import { toBlob } from 'html-to-image';
import { ToasterService } from '../../../services/toaster.service';
import { LoaderComponent } from '../loader/loader.component';
@Component({
  selector: 'app-team-lineup-modal',
  standalone: true,
  imports: [CommonModule, FieldLineupComponent, LoaderComponent],
  templateUrl: './team-lineup-modal.component.html',
  styleUrl: './team-lineup-modal.component.scss'
})
export class TeamLineupModalComponent implements OnInit, OnDestroy {
  @Input() teams: Team[] = [];
  @Input() visible = signal(false);

  isLoading = signal(false);

  private isCapturing = signal(false);
  private toaster = inject(ToasterService);

  openedShareIndex: number | null = null;

  ngOnInit() {
    document.body.classList.add('overflow-hidden');
  }

  ngOnDestroy() {
    document.body.classList.remove('overflow-hidden');
  }


  toggleShareMenu(index: number): void {
    this.openedShareIndex = this.openedShareIndex === index ? null : index;
  }

  async shareTeamImage(teamName: string, elementId: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      this.toaster.error('Elemento não encontrado para captura.');
      return;
    }

    try {
      const blob = await toBlob(element);

      if (!blob) {
        throw new Error('Falha ao gerar imagem.');
      }

      const file = new File([blob], `${teamName}.png`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Time ${teamName}`,
          text: `Veja a escalação do time ${teamName} ⚽️`,
          files: [file],
        });
      } else {
        this.toaster.warning('Este dispositivo não suporta compartilhamento de arquivos.');
      }
    } catch (error) {
      this.toaster.error('Erro ao compartilhar o time.');
      console.error('Erro ao compartilhar imagem:', error);
    }
  }


  close() {
    this.visible.set(false);
    this.visible.set(false);
  }

  //GERAR COMPARTILHAMENTO DOS TIMES
  async generateAllTeamsCanvas(teams: Team[]) {
    for (let i = 0; i < teams.length; i++) {
      await this.generateCanvasFromTeamRealAvatars(teams[i], i);
    }
  }

  async generateCanvasFromTeamRealAvatars(team: Team, teamIndex: number) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 1200;

    if (!ctx) {
      console.error('Erro ao criar contexto do canvas');
      return;
    }

    const background = new Image();
    background.src = 'img/campo-futebol.jpeg';

    background.onload = async () => {
      // MENU DE AÇÃO
      const userChoice = window.prompt(
        `Escolha uma opção:\n1 - Salvar imagem\n2 - Compartilhar WhatsApp\n3 - Compartilhar Instagram (manual)`,
        '1'
      );

      if (userChoice === '1') {
        const link = document.createElement('a');
        link.download = `${team.name}-escalacao.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else if (userChoice === '2') {
        const whatsappUrl = `https://api.whatsapp.com/send?text=Veja%20a%20escala%C3%A7%C3%A3o%20do%20Time%20${teamIndex + 1}%20${encodeURIComponent(window.location.href)}`;
        window.open(whatsappUrl, '_blank');
      } else if (userChoice === '3') {
        alert('Imagem salva! Poste manualmente no Instagram Stories.');
        const link = document.createElement('a');
        link.download = `${team.name}-escalacao.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else {
        // Default se o usuário cancelar
        console.log('Nenhuma ação escolhida.');
      }

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Número do Time no topo
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Time ${teamIndex + 1}`, canvas.width / 2, 50);

      const positions: Record<'G' | 'D' | 'M' | 'A', { x: number, y: number }[]> = {
        G: [{ x: 400, y: 100 }],
        D: [],
        M: [],
        A: [],
      };

      const defenders = team.players.filter(p => p.posicao === 'D');
      const midfielders = team.players.filter(p => p.posicao === 'M');
      const attackers = team.players.filter(p => p.posicao === 'A');

      const distribute = (arr: any[], y: number) => {
        const step = 800 / (arr.length + 1);
        return arr.map((_, idx) => ({ x: step * (idx + 1), y }));
      };

      positions.D = distribute(defenders, 300);
      positions.M = distribute(midfielders, 600);
      positions.A = distribute(attackers, 900);

      for (const player of team.players) {
        const pos = positions[player.posicao].shift();
        if (!pos) continue;

        const avatar = new Image();
        avatar.crossOrigin = 'anonymous';
        avatar.src = player.avatarUrl || 'icons/user.png';

        await new Promise<void>((resolve) => {
          avatar.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 50, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, pos.x - 50, pos.y - 50, 100, 100);
            ctx.restore();
            resolve();
          };
          avatar.onerror = () => {
            console.error('Erro ao carregar avatar de', player.name);
            resolve();
          };
        });

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const textWidth = ctx.measureText(player.name).width;
        const padding = 15;
        ctx.fillRect(pos.x - textWidth / 2 - padding, pos.y + 48, textWidth + padding * 2, 24);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, pos.x, pos.y + 65);

        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(pos.x - 40, pos.y - 40, 14, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.posicao, pos.x - 40, pos.y - 36);
      }

      // Agora: opção de baixar ou compartilhar
      const blob = await (await fetch(canvas.toDataURL())).blob();
      const file = new File([blob], `${team.name}-escalacao.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Time ${teamIndex + 1}`,
          text: `Veja a escalação do Time ${teamIndex + 1}!`,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = `${team.name}-escalacao.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    };
  }
}  