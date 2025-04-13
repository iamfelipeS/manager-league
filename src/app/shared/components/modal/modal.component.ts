import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss' 
})
export class ModalComponent {
  // Controladores com signal
  isOpen = signal(false);
  title = signal('Modal');
  showFooter = signal(true);
  showCancelButton = signal(true);
  showConfirmButton = signal(true);
  cancelButtonText = signal('Cancelar');
  confirmButtonText = signal('Confirmar');
  closeIfClickedOutside = signal(true);

  // Template
  @ViewChild('backdrop') backdrop!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;
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
  }

  close() {
    this.isOpen.set(false);
    this.closed.emit();
  }

  confirm() {
    this.confirmed.emit();
    this.close();
  }
}