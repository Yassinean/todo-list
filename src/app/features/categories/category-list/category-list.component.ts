import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { TaskService } from '../../../core/services/task.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent {
  categoriesWithCount$ = this.categoryService.getCategories().pipe(
    switchMap(categories => {
      const tasks$ = this.taskService.getTasks();
      return tasks$.pipe(
        map(tasks => {
          return categories.map(category => ({
            ...category,
            taskCount: tasks.filter(task => task.categoryId === category.id).length
          }));
        })
      );
    })
  );

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService
  ) {}

  deleteCategory(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.categoryService.deleteCategory(id);
    }
  }
}
