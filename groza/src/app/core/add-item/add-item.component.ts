import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../services/websocket.service'; // добавляем импорт

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent {
  @Output() itemAdded = new EventEmitter<string>(); // <<< добавляем Output
  
  itemControl: FormControl<string | null> = new FormControl<string | null>('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  constructor(private websocketService: WebsocketService) {}

  addItem(): void {
    if (this.itemControl.valid && this.itemControl.value) {
      const itemName = this.itemControl.value.trim();
      if (!itemName) return;

      const newItem = {
        id: Date.now(),
        name: itemName,
        bought: false
      };

      // Отправляем в сокет
      this.websocketService.sendMessage({
        action: 'add',
        item: newItem
      });

      // Эмитим строку наверх родителю (ListComponent)
      this.itemAdded.emit(itemName);

      // Очищаем поле
      this.itemControl.reset('');
    }
  }
}
