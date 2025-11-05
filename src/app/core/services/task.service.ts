import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Task, CreateTaskDto, UpdateTaskDto, TaskFilters } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = environment.apiUrl;

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTasks(userId: string, filters?: TaskFilters): Observable<Task[]> {
    this.loadingSubject.next(true);

    let params = new HttpParams().set('userId', userId);

    if (filters?.completed !== undefined) {
      params = params.set('completed', filters.completed.toString());
    }

    return this.http.get<Task[]>(`${this.API_URL}/tasks`, { params }).pipe(
      map(tasks => this.transformTasks(tasks)),
      tap(tasks => {
        const sortedTasks = this.sortTasksByDate(tasks);
        this.tasksSubject.next(sortedTasks);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  getTaskById(taskId: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${taskId}`).pipe(
      map(task => this.transformTask(task)),
      catchError(this.handleError)
    );
  }

  createTask(taskData: CreateTaskDto): Observable<Task> {
    const task = {
      ...taskData,
      completed: false
    };

    return this.http.post<Task>(`${this.API_URL}/tasks`, task).pipe(
      map(newTask => this.transformTask(newTask)),
      tap(newTask => {
        const currentTasks = this.tasksSubject.value;
        const updatedTasks = this.sortTasksByDate([newTask, ...currentTasks]);
        this.tasksSubject.next(updatedTasks);
      }),
      catchError(this.handleError)
    );
  }

  updateTask(taskId: string, updates: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/tasks/${taskId}`, updates).pipe(
      map(updatedTask => this.transformTask(updatedTask)),
      tap(updatedTask => {
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex(t => t.id === taskId);

        if (index !== -1) {
          currentTasks[index] = updatedTask;
          this.tasksSubject.next([...currentTasks]);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${taskId}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value;
        const filteredTasks = currentTasks.filter(t => t.id !== taskId);
        this.tasksSubject.next(filteredTasks);
      }),
      catchError(this.handleError)
    );
  }

  toggleTaskCompletion(task: Task): Observable<Task> {
    return this.updateTask(task.id!, { completed: !task.completed });
  }

  completeTask(taskId: string): Observable<Task> {
    return this.updateTask(taskId, { completed: true });
  }

  uncompleteTask(taskId: string): Observable<Task> {
    return this.updateTask(taskId, { completed: false });
  }

  private transformTasks(tasks: Task[]): Task[] {
    return tasks.map(task => this.transformTask(task));
  }

  private transformTask(task: any): Task {
    return {
      ...task,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined
    };
  }

  private sortTasksByDate(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Más recientes primero
    });
  }

  getTotalTasksCount(): number {
    return this.tasksSubject.value.length;
  }

  getCompletedTasksCount(): number {
    return this.tasksSubject.value.filter(t => t.completed).length;
  }

  getPendingTasksCount(): number {
    return this.tasksSubject.value.filter(t => !t.completed).length;
  }

  getCompletedTasks(): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(t => t.completed))
    );
  }

  getPendingTasks(): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => tasks.filter(t => !t.completed))
    );
  }

  clearTasks(): void {
    this.tasksSubject.next([]);
  }

  refreshTasks(userId: string): void {
    this.getTasks(userId).subscribe({
      error: (error) => console.error('Error refreshing tasks:', error)
    });
  }

  searchTasks(searchTerm: string): Observable<Task[]> {
    return this.tasks$.pipe(
      map(tasks => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return tasks;

        return tasks.filter(task =>
          task.title.toLowerCase().includes(term) ||
          task.description.toLowerCase().includes(term)
        );
      })
    );
  }

  getCurrentTasks(): Task[] {
    return this.tasksSubject.value;
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
          errorMessage = error.error?.message || 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status}`;
      }
    }

    console.error('Task Service Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
