import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-4 max-w-lg">
      <h1 class="text-2xl font-bold mb-6">
        {{ isEditMode ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
      </h1>

      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Nom -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            formControlName="name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
          @if (categoryForm.get('name')?.errors?.['required'] && categoryForm.get('name')?.touched) {
            <p class="mt-1 text-sm text-red-600">Le nom est requis</p>
          }
        </div>

        <!-- Couleur -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Couleur</label>
          <input
            type="color"
            formControlName="color"
            class="mt-1 block w-full h-10 rounded-md border-gray-300"
          >
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
            [disabled]="categoryForm.invalid"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.createForm();
  }

  ngOnInit() {
    const categoryId = this.route.snapshot.params['id'];
    if (categoryId) {
      this.isEditMode = true;
      this.loadCategory(categoryId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      color: ['#3B82F6']
    });
  }

  private loadCategory(id: string) {
    this.categoryService.getCategoryById(id).subscribe(category => {
      if (category) {
        this.categoryForm.patchValue(category);
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      try {
        if (this.isEditMode) {
          this.categoryService.updateCategory(
            this.route.snapshot.params['id'],
            this.categoryForm.value
          );
        } else {
          this.categoryService.addCategory(this.categoryForm.value);
        }
        this.router.navigate(['/categories']);
      } catch (error: any) {
        alert(error.message);
      }
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }
}