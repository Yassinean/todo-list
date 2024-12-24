import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks$ = new BehaviorSubject<Task[]>([]);

  constructor() {
    // Charger les tâches depuis le localStorage au démarrage
    this.loadTasks();
  }

  private loadTasks(): void {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks$.next(JSON.parse(savedTasks));
    }
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    this.tasks$.next(tasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$.asObservable();
  }

  getTaskById(id: string): Observable<Task | undefined> {
    return this.tasks$.pipe(
      map(tasks => tasks.find(task => task.id === id))
    );
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const currentTasks = this.tasks$.value;
    this.saveTasks([...currentTasks, newTask]);
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const currentTasks = this.tasks$.value;
    const taskIndex = currentTasks.findIndex(task => task.id === id);
    
    if (taskIndex > -1) {
      const updatedTask = {
        ...currentTasks[taskIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      currentTasks[taskIndex] = updatedTask;
      this.saveTasks(currentTasks);
    }
  }

  deleteTask(id: string): void {
    const currentTasks = this.tasks$.value;
    this.saveTasks(currentTasks.filter(task => task.id !== id));
  }

  getTaskStats(): Observable<{
    completed: number;
    pending: number;
    overdue: number;
  }> {
    return this.tasks$.pipe(
      map(tasks => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
        const overdue = tasks.filter(t => 
          new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
        ).length;

        return {
          completed: total ? Math.round((completed / total) * 100) : 0,
          pending: total ? Math.round(((total - completed) / total) * 100) : 0,
          overdue
        };
      })
    );
  }
}
