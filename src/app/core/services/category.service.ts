import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories$ = new BehaviorSubject<Category[]>([]);

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      this.categories$.next(JSON.parse(savedCategories));
    }
  }

  private saveCategories(categories: Category[]): void {
    localStorage.setItem('categories', JSON.stringify(categories));
    this.categories$.next(categories);
  }

  getCategories(): Observable<Category[]> {
    return this.categories$.asObservable();
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.categories$.pipe(
      map(categories => categories.find(category => category.id === id))
    );
  }

  addCategory(category: Omit<Category, 'id'>): void {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID()
    };

    const currentCategories = this.categories$.value;
    
    // Vérification des doublons
    if (currentCategories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
      throw new Error('Une catégorie avec ce nom existe déjà');
    }

    this.saveCategories([...currentCategories, newCategory]);
  }

  updateCategory(id: string, updates: Partial<Category>): void {
    const currentCategories = this.categories$.value;
    const categoryIndex = currentCategories.findIndex(category => category.id === id);
    
    if (categoryIndex > -1) {
      // if (updates?.name && 
      //     currentCategories.some(c => 
      //       c.id !== id && 
      //       c.name.toLowerCase() === updates.name.toLowerCase()
      //     )) {
      //   throw new Error('Une catégorie avec ce nom existe déjà');
      // }

      const updatedCategory = {
        ...currentCategories[categoryIndex],
        ...updates
      };
      
      currentCategories[categoryIndex] = updatedCategory;
      this.saveCategories(currentCategories);
    }
  }

  deleteCategory(id: string): void {
    const currentCategories = this.categories$.value;
    this.saveCategories(currentCategories.filter(category => category.id !== id));
  }
}
