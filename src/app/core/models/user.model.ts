export interface User {
  id: string;
  email: string;
  createdAt: number;
}

export interface UserCheckResponse {
  id: string;
  email: string;
  createdAt: number;
}

export interface LoginRequest {
  email: string;
}

export interface CreateUserRequest {
  email: string;
}
