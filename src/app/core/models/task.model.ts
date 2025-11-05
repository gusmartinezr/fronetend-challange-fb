export interface Task {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date | number; // Puede ser Date o timestamp
  userId: string;
  updatedAt?: Date | number;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  userId: string;
}

export interface TaskFilters {
  userId: string;
  completed?: boolean;
  search?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
}
