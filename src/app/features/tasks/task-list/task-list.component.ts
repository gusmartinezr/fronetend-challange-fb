import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { Task } from '../../../core/models/task.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TaskItemComponent } from '../task-item/task-item.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    TaskItemComponent, // <-- si es standalone también
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit, OnDestroy {

  tasks: Task[] = [];
  currentUser: User | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.subscribeToTasks();
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private subscribeToTasks(): void {
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
      });
  }

  private loadTasks(): void {
    if (!this.currentUser?.id) return;

    this.isLoading = true;
    this.taskService.getTasks(this.currentUser.id).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.notificationService.error('Error al cargar las tareas');
        this.isLoading = false;
      }
    });
  }

  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      data: { userId: this.currentUser?.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.success('Tarea creada exitosamente');
      }
    });
  }

  onEditTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      data: { task, userId: this.currentUser?.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.success('Tarea actualizada exitosamente');
      }
    });
  }

  onDeleteTask(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar tarea',
        message: `¿Estás seguro de que deseas eliminar la tarea "${task.title}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteTaskById(task.id);
      }
    });
  }

  private deleteTaskById(taskId?: string): void {
    if (!taskId) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => this.notificationService.success('Tarea eliminada exitosamente'),
      error: (error) => {
        console.error('Error deleting task:', error);
        this.notificationService.error('Error al eliminar la tarea');
      }
    });
  }

  onToggleTask(task: Task): void {
    this.taskService.toggleTaskCompletion(task).subscribe({
      next: () => {
        const status = task.completed ? 'pendiente' : 'completada';
        this.notificationService.info(`Tarea marcada como ${status}`);
      },
      error: (error) => {
        console.error('Error toggling task:', error);
        this.notificationService.error('Error al actualizar la tarea');
      }
    });
  }

  logout(): void {
    // Limpia tareas
    this.taskService.clearTasks();

    // Cierra sesión
    this.authService.logout();

    // Muestra notificación
    this.notificationService.info('Sesión cerrada exitosamente');

    // Redirige al login
    this.router.navigate(['/login']);
  }


  get completedTasksCount(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  get pendingTasksCount(): number {
    return this.tasks.filter(t => !t.completed).length;
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id || index.toString();
  }
}
