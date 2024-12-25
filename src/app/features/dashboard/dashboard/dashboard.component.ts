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
  templateUrl: './dashboard.component.html'
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
