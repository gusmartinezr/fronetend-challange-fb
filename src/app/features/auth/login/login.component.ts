import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomValidators } from '../../../shared/validators/custom-validators';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    AutofocusDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          CustomValidators.noWhitespace(),
          CustomValidators.strictEmail()
        ]
      ]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const email = this.loginForm.value.email.trim().toLowerCase();

    this.authService.login(email).subscribe({
      next: (response) => {
        if (response.exists && response.user) {
          this.notificationService.success(`¡Bienvenido de nuevo!`);
          this.router.navigate(['/tasks']);
        } else {
          this.notificationService.error(`El correo "${email}" no está registrado.`);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al verificar el usuario. Por favor, intenta nuevamente.';
        this.notificationService.error(this.errorMessage);
        this.isLoading = false;
        console.error('Login error:', error);
      }
    });
  }

  private createUser(email: string): void {
    this.isLoading = true;

    this.authService.createUser(email).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.notificationService.success('¡Cuenta creada exitosamente!');
        console.log('Usuario creado:', user); // Para debug
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al crear el usuario. Por favor, intenta nuevamente.';
        this.notificationService.error(this.errorMessage);
        this.isLoading = false;
        console.error('Create user error:', error);
      }
    });
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (this.email?.hasError('email') || this.email?.hasError('invalidEmail')) {
      return 'Ingresa un correo electrónico válido';
    }
    if (this.email?.hasError('whitespace')) {
      return 'El correo no puede contener espacios';
    }
    return '';
  }

  onEnterKey(event: Event): void {
    (event as KeyboardEvent).preventDefault();
    this.onSubmit();
  }
}
