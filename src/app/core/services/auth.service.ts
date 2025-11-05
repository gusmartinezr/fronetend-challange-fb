import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, UserCheckResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly STORAGE_KEY = 'currentUser';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getUserFromStorage(): User | null {
    try {
      const userJson = localStorage.getItem(this.STORAGE_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
    return null;
  }

  checkUserExists(email: string): Observable<{ exists: boolean; user?: User }> {
    const params = new HttpParams().set('email', email);

    return this.http.get<UserCheckResponse>(`${this.API_URL}/users`, { params }).pipe(
      map(response => ({
        exists: true,
        user: {
          id: response.id,
          email: response.email,
          createdAt: response.createdAt
        }
      })),
      catchError(error => {
        // Si es 404, el usuario no existe
        if (error.status === 404) {
          return of({ exists: false });
        }
        return this.handleError(error);
      })
    );
  }

  createUser(email: string): Observable<User> {
    return this.http.post<UserCheckResponse>(
      `${this.API_URL}/users`,
      { email }
    ).pipe(
      map(response => ({
        id: response.id,
        email: response.email,
        createdAt: response.createdAt
      })),
      tap(user => {
        this.setCurrentUser(user);
      }),
      catchError(this.handleError)
    );
  }

  login(email: string): Observable<{ exists: boolean; user?: User }> {
    return this.checkUserExists(email).pipe(
      tap(response => {
        if (response.exists && response.user) {
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  private setCurrentUser(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error saving user to storage:', error);
      this.currentUserSubject.next(user);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string | null {
    return this.currentUserSubject.value?.id || null;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUserEmail(): string | null {
    return this.currentUserSubject.value?.email || null;
  }

  getCurrentUserCreatedDate(): Date | null {
    const user = this.currentUserSubject.value;
    return user ? new Date(user.createdAt) : null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 404:
          errorMessage = 'Usuario no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status}`;
      }
    }

    console.error('Auth Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
