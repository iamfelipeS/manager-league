// shared/components/modal/modal.component.ts
import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationBuilder, animate, style } from '@angular/animations';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss' 
})
export class ModalComponent {
  private animationBuilder = inject(AnimationBuilder);
  
  isOpen = signal(false);
  title = signal('Modal');
  showFooter = signal(true);
  showCancelButton = signal(true);
  showConfirmButton = signal(true);
  cancelButtonText = signal('Cancelar');
  confirmButtonText = signal('Confirmar');
  closeIfClickedOutside = signal(true);
  
  // Referências ao template e elementos DOM
  @ViewChild('backdrop') backdrop!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;
  
  // Template para conteúdo dinâmico
  contentTemplate?: TemplateRef<any>;
  contentContext: any = {};
  
  // Eventos
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  
  open(options?: {
    title?: string;
    template?: TemplateRef<any>;
    context?: any;
    showFooter?: boolean;
    showCancelButton?: boolean;
    showConfirmButton?: boolean;
    cancelButtonText?: string;
    confirmButtonText?: string;
    closeIfClickedOutside?: boolean;
  }) {
    if (options) {
      if (options.title !== undefined) this.title.set(options.title);
      if (options.showFooter !== undefined) this.showFooter.set(options.showFooter);
      if (options.showCancelButton !== undefined) this.showCancelButton.set(options.showCancelButton);
      if (options.showConfirmButton !== undefined) this.showConfirmButton.set(options.showConfirmButton);
      if (options.cancelButtonText !== undefined) this.cancelButtonText.set(options.cancelButtonText);
      if (options.confirmButtonText !== undefined) this.confirmButtonText.set(options.confirmButtonText);
      if (options.closeIfClickedOutside !== undefined) this.closeIfClickedOutside.set(options.closeIfClickedOutside);
      this.contentTemplate = options.template;
      this.contentContext = options.context || {};
    }
    
    this.isOpen.set(true);
    
    // Aplicar animação de entrada após um pequeno delay para permitir que o DOM seja renderizado
    setTimeout(() => {
      if (this.backdrop && this.modalContent) {
        const fadeIn = this.animationBuilder.build([
          style({ opacity: 0 }),
          animate('300ms ease-out', style({ opacity: 1 }))
        ]);
        
        const slideIn = this.animationBuilder.build([
          style({ transform: 'translateY(-20px)', opacity: 0 }),
          animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
        ]);
        
        fadeIn.create(this.backdrop.nativeElement).play();
        slideIn.create(this.modalContent.nativeElement).play();
      }
    }, 10);
  }
  
  close() {
    if (this.backdrop && this.modalContent) {
      const fadeOut = this.animationBuilder.build([
        style({ opacity: 1 }),
        animate('200ms ease-in', style({ opacity: 0 }))
      ]);
      
      const slideOut = this.animationBuilder.build([
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
      ]);
      
      fadeOut.create(this.backdrop.nativeElement).play();
      const player = slideOut.create(this.modalContent.nativeElement);
      player.play();
      
      // Esperar a animação terminar antes de fechar
      player.onDone(() => {
        this.isOpen.set(false);
        this.closed.emit();
      });
    } else {
      this.isOpen.set(false);
      this.closed.emit();
    }
  }
  
  confirm() {
    this.confirmed.emit();
    this.close();
  }
}