import { Directive, ElementRef, AfterViewInit, OnDestroy, Input } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements AfterViewInit, OnDestroy {
  @Input() appAutofocus: boolean | string = true;
  @Input() autofocusDelay: number = 100; // Delay en milisegundos

  private timeoutId?: number;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    // Convertir string 'false' a boolean false
    const shouldFocus = this.appAutofocus === true || this.appAutofocus === 'true' || this.appAutofocus === '';

    if (shouldFocus) {
      this.focus();
    }
  }

  ngOnDestroy(): void {
    // Limpiar timeout si existe
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  private focus(): void {
    this.timeoutId = window.setTimeout(() => {
      try {
        const element = this.elementRef.nativeElement;

        // Verificar si el elemento puede recibir foco
        if (element && typeof element.focus === 'function') {
          element.focus();

          // Para inputs de texto, seleccionar todo el contenido si existe
          if (element.select && element.value) {
            element.select();
          }
        }
      } catch (error) {
        console.warn('AutofocusDirective: Error al enfocar elemento', error);
      }
    }, this.autofocusDelay);
  }
}
