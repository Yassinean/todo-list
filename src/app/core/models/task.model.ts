export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}
