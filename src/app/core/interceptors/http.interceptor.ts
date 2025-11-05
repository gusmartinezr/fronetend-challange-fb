import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Interceptor HTTP para manejo de errores y headers
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clonar la request y agregar headers necesarios
  const clonedRequest = req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;

        // Si es un error 401, redirigir al login
        if (error.status === 401) {
          router.navigate(['/login']);
        }
      }

      console.error(errorMessage);
      return throwError(() => error);
    })
  );
};
