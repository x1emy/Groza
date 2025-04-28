import { Component, EventEmitter, Output } from '@angular/core';
import { AIService } from '../services/ai.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-helper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-helper">
      <h3><i class="fas fa-robot"></i> AI Помощник</h3>
      
      <div class="input-group">
        <textarea 
          [(ngModel)]="prompt" 
          placeholder="Пример: 'продукты для борща' или 'что купить для омлета'"
          rows="3"
          [disabled]="isLoading"
        ></textarea>
        <button (click)="generate()" [disabled]="isLoading || !prompt.trim()">
          <i *ngIf="!isLoading" class="fas fa-magic"></i>
          {{ isLoading ? 'Генерация...' : 'Сгенерировать' }}
        </button>
      </div>

      <div *ngIf="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <div *ngIf="suggestions.length > 0" class="suggestions">
        <h4><i class="fas fa-lightbulb"></i> Рекомендации:</h4>
        <ul>
          <li *ngFor="let item of suggestions">
            <span>{{ item }}</span>
            <button (click)="addItem(item)" class="add-btn">
              <i class="fas fa-plus"></i>
            </button>
          </li>
        </ul>
        <button (click)="addAllItems()" class="add-all-btn">
          <i class="fas fa-cart-plus"></i> Добавить все
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./ai-helper.component.css']
})
export class AIHelperComponent {
  @Output() itemAdded = new EventEmitter<string[]>();
  
  prompt: string = '';
  suggestions: string[] = [];
  isLoading: boolean = false;
  error: string = '';
  usingFallback: boolean = false;

  constructor(private aiService: AIService) {}

  async generate() {
    if (!this.prompt.trim()) {
      this.error = 'Пожалуйста, введите запрос';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.suggestions = [];
    this.usingFallback = false;

    try {
      
      const response = await this.aiService.generateList(this.prompt).toPromise();
      
      if (response && response.length > 0) {
        this.suggestions = response;
      } else {
        throw new Error('Пустой ответ от сервера');
      }
      
    } catch (err) {
      console.error('AI Error:', err);
      this.error = 'Сервис недоступен. Используем базовые рекомендации...';
      this.usingFallback = true;
      this.suggestions = this.getFallbackSuggestions();
      
      
      setTimeout(() => this.error = '', 3000);
    } finally {
      this.isLoading = false;
    }
  }

  addItem(item: string) {
    this.itemAdded.emit([item]);
    if (this.usingFallback) {
      this.removeItemFromSuggestions(item);
    }
  }

  addAllItems() {
    if (this.suggestions.length > 0) {
      this.itemAdded.emit([...this.suggestions]);
      if (this.usingFallback) {
        this.suggestions = [];
      }
    }
  }

  private removeItemFromSuggestions(item: string) {
    this.suggestions = this.suggestions.filter(i => i !== item);
  }

  private getFallbackSuggestions(): string[] {
    const promptLower = this.prompt.toLowerCase();
    
    if (promptLower.includes('борщ') || promptLower.includes('борща')) {
      return ['Говядина', 'Свекла', 'Капуста', 'Картофель', 'Морковь', 'Лук', 'Томатная паста', 'Чеснок', 'Зелень'];
    } 
    else if (promptLower.includes('завтрак') || promptLower.includes('омлет')) {
      return ['Яйца', 'Молоко', 'Хлеб', 'Сыр', 'Колбаса', 'Масло сливочное', 'Овощи'];
    }
    else if (promptLower.includes('салат') || promptLower.includes('салата')) {
      return ['Помидоры', 'Огурцы', 'Лук', 'Масло оливковое', 'Лимон', 'Зелень'];
    }
    else {
      return ['Молоко', 'Хлеб', 'Яйца', 'Масло', 'Сахар', 'Соль', 'Кофе', 'Чай'];
    }
  }
}