import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { CreateTaskDto, Task, UpdateTaskDto } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

interface DialogData {
  task?: Task;
  userId: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = !!data.task;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: [
        this.data.task?.title || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          CustomValidators.notOnlyWhitespace()
        ]
      ],
      description: [
        this.data.task?.description || '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
          CustomValidators.notOnlyWhitespace()
        ]
      ]
    });
  }

  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) this.updateTask();
    else this.createTask();
  }

  private createTask(): void {
    const taskData: CreateTaskDto = {
      title: this.taskForm.value.title.trim(),
      description: this.taskForm.value.description.trim(),
      userId: this.data.userId
    };

    this.taskService.createTask(taskData).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al crear la tarea';
        this.isLoading = false;
      }
    });
  }

  private updateTask(): void {
    if (!this.data.task?.id) return;

    const updates: UpdateTaskDto = {
      title: this.taskForm.value.title.trim(),
      description: this.taskForm.value.description.trim()
    };

    this.taskService.updateTask(this.data.task.id, updates).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al actualizar la tarea';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void { this.dialogRef.close(false); }

  getTitleErrorMessage(): string {
    if (this.title?.hasError('required')) return 'El título es requerido';
    if (this.title?.hasError('minlength')) return 'El título debe tener al menos 3 caracteres';
    if (this.title?.hasError('maxlength')) return 'El título no puede exceder 100 caracteres';
    if (this.title?.hasError('onlyWhitespace')) return 'El título no puede ser solo espacios';
    return '';
  }

  getDescriptionErrorMessage(): string {
    if (this.description?.hasError('required')) return 'La descripción es requerida';
    if (this.description?.hasError('minlength')) return 'La descripción debe tener al menos 10 caracteres';
    if (this.description?.hasError('maxlength')) return 'La descripción no puede exceder 500 caracteres';
    if (this.description?.hasError('onlyWhitespace')) return 'La descripción no puede ser solo espacios';
    return '';
  }

  getTitleProgress(): number { return Math.min((this.title?.value?.length || 0) / 100 * 100, 100); }
  getDescriptionProgress(): number { return Math.min((this.description?.value?.length || 0) / 500 * 100, 100); }
}
