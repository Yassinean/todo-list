import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4 max-w-2xl">
      <h1 class="text-2xl font-bold mb-6">
        {{ isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche' }}
      </h1>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Titre -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Titre</label>
          <input
            type="text"
            formControlName="title"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
          @if (taskForm.get('title')?.errors?.['required'] && taskForm.get('title')?.touched) {
            <p class="mt-1 text-sm text-red-600">Le titre est requis</p>
          }
          @if (taskForm.get('title')?.errors?.['maxlength']) {
            <p class="mt-1 text-sm text-red-600">Le titre ne doit pas dépasser 100 caractères</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            formControlName="description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Date d'échéance -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Date d'échéance</label>
          <input
            type="datetime-local"
            formControlName="dueDate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
          @if (taskForm.get('dueDate')?.errors?.['pastDate']) {
            <p class="mt-1 text-sm text-red-600">La date ne peut pas être dans le passé</p>
          }
        </div>

        <!-- Priorité -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Priorité</label>
          <select
            formControlName="priority"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Basse</option>
          </select>
        </div>

        <!-- Catégorie -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            formControlName="categoryId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            @for (category of categories$ | async; track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
        </div>

        <!-- Boutons -->
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            [disabled]="taskForm.invalid"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  categories$ = this.categoryService.getCategories();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.createForm();
  }

  ngOnInit() {
    const taskId = this.route.snapshot.params['id'];
    if (taskId) {
      this.isEditMode = true;
      this.loadTask(taskId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      dueDate: ['', [Validators.required, this.futureDateValidator()]],
      priority: ['MEDIUM', Validators.required],
      categoryId: ['', Validators.required],
      status: ['NOT_STARTED']
    });
  }

  private futureDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const date = new Date(control.value);
      return date < new Date() ? { pastDate: true } : null;
    };
  }

  private loadTask(id: string) {
    this.taskService.getTaskById(id).subscribe(task => {
      if (task) {
        this.taskForm.patchValue({
          ...task,
          dueDate: new Date(task.dueDate).toISOString().slice(0, 16)
        });
      }
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      
      if (this.isEditMode) {
        this.taskService.updateTask(
          this.route.snapshot.params['id'],
          taskData
        );
      } else {
        this.taskService.addTask(taskData);
      }
      
      this.router.navigate(['/tasks']);
    }
  }

  onCancel() {
    this.router.navigate(['/tasks']);
  }
}
