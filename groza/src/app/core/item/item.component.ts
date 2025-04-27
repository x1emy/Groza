import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Item {
  id: number;
  name: string;
  bought: boolean;
}

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent {
  @Input() item!: Item;
  @Output() toggle = new EventEmitter<void>();
  @Output() delete = new EventEmitter<MouseEvent>();

  onToggle(): void {
    this.toggle.emit(); // Просто сообщаем наверх, что нужно "переключить" куплено/не куплено
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation(); // чтобы клик не сработал на переключение
    this.delete.emit(event); // передаём событие наверх
  }
}
