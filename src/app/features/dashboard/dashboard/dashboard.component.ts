import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Tableau de bord</h1>

      <!-- Statistiques générales -->
      <div class="grid gap-4 md:grid-cols-3 mb-8">
        <div class="p-6 bg-green-100 rounded-lg">
          <h3 class="text-lg font-semibold text-green-800">Tâches accomplies</h3>
          <p class="text-3xl font-bold text-green-600">
            {{ (stats$ | async)?.completed }}%
          </p>
        </div>

        <div class="p-6 bg-yellow-100 rounded-lg">
          <h3 class="text-lg font-semibold text-yellow-800">Tâches en cours</h3>
          <p class="text-3xl font-bold text-yellow-600">
            {{ (stats$ | async)?.pending }}%
          </p>
        </div>

        <div class="p-6 bg-red-100 rounded-lg">
          <h3 class="text-lg font-semibold text-red-800">Tâches en retard</h3>
          <p class="text-3xl font-bold text-red-600">
            {{ (stats$ | async)?.overdue }}
          </p>
        </div>
      </div>

      <!-- Statistiques par catégorie -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Tâches par catégorie</h2>
        <div class="space-y-4">
          @for (category of categoryStats$ | async; track category.id) {
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                @if (category.color) {
                  <div 
                    class="w-4 h-4 rounded-full"
                    [style.backgroundColor]="category.color">
                  </div>
                }
                <span>{{ category.name }}</span>
              </div>
              <div class="flex gap-4">
                <span>{{ category.taskCount }} tâches</span>
                <span class="text-green-600">
                  {{ category.completedCount }} terminées
                </span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  stats$ = this.taskService.getTaskStats();

  categoryStats$ = combineLatest([
    this.categoryService.getCategories(),
    this.taskService.getTasks()
  ]).pipe(
    map(([categories, tasks]) => {
      return categories.map(category => ({
        ...category,
        taskCount: tasks.filter(task => task.categoryId === category.id).length,
        completedCount: tasks.filter(
          task => task.categoryId === category.id && task.status === 'COMPLETED'
        ).length
      }));
    })
  );

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService
  ) {}
}
