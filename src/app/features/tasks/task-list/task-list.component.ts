import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Mes tâches</h1>
        <button 
          [routerLink]="['/tasks/new']"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Nouvelle tâche
        </button>
      </div>

      <!-- Barre de recherche -->
      <div class="mb-6">
        <input 
          [formControl]="searchControl"
          type="text"
          placeholder="Rechercher une tâche..."
          class="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
      </div>

      <!-- Liste des tâches -->
      <div class="grid gap-4">
        @for (task of filteredTasks$ | async; track task.id) {
          <div class="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
               [class.bg-green-50]="task.status === 'COMPLETED'"
               [class.bg-yellow-50]="task.status === 'IN_PROGRESS'">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-lg">{{ task.title }}</h3>
                <p class="text-gray-600">{{ task.description }}</p>
              </div>
              <div class="flex gap-2">
                <button 
                  [routerLink]="['/tasks', task.id, 'edit']"
                  class="text-blue-500 hover:text-blue-700">
                  Modifier
                </button>
                <button 
                  (click)="deleteTask(task.id)"
                  class="text-red-500 hover:text-red-700">
                  Supprimer
                </button>
              </div>
            </div>
            <div class="mt-3 flex gap-4 text-sm">
              <span [class]="getPriorityClass(task.priority)">
                {{ task.priority }}
              </span>
              <span [class]="getStatusClass(task.status)">
                {{ task.status }}
              </span>
              <span class="text-gray-500">
                Échéance: {{ task.dueDate | date:'dd/MM/yyyy HH:mm' }}
              </span>
            </div>
          </div>
        } @empty {
          <div class="text-center py-8 text-gray-500">
            Aucune tâche trouvée
          </div>
        }
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  searchControl = new FormControl('');
  filteredTasks$ = this.taskService.getTasks().pipe(
    map(tasks => this.filterTasks(tasks, this.searchControl.value || ''))
  );

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith('')
    ).subscribe(searchTerm => {
      this.filteredTasks$ = this.taskService.getTasks().pipe(
        map(tasks => this.filterTasks(tasks, searchTerm || ''))
      );
    });
  }

  deleteTask(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(id);
    }
  }

  private filterTasks(tasks: Task[], searchTerm: string): Task[] {
    if (!searchTerm) return tasks;
    searchTerm = searchTerm.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm)
    );
  }

  getPriorityClass(priority: Task['priority']): string {
    const classes = {
      'HIGH': 'bg-red-100 text-red-800 px-2 py-1 rounded',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded',
      'LOW': 'bg-green-100 text-green-800 px-2 py-1 rounded'
    };
    return classes[priority];
  }

  getStatusClass(status: Task['status']): string {
    const classes = {
      'COMPLETED': 'bg-green-100 text-green-800 px-2 py-1 rounded',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded',
      'NOT_STARTED': 'bg-gray-100 text-gray-800 px-2 py-1 rounded'
    };
    return classes[status];
  }
}
