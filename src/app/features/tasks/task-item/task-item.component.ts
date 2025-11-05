import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
// import { Task } from '../../../core/models/task.model';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    TimeAgoPipe
  ],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.scss'
})
export class TaskItemComponent {

  @Input() task!: Task;
  @Output() toggle = new EventEmitter<Task>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();

  onToggle(event: MatCheckboxChange): void {
    this.toggle.emit(this.task);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.task);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.task);
  }

  getFormattedDate(): string {
    const date = new Date(this.task.createdAt);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onCardClick(): void {
    // Opcional: podría expandir detalles o hacer algo más
  }
}
