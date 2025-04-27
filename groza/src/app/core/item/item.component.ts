import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item.models';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent {
  @Input() item!: Item;
  @Output() toggle = new EventEmitter<Item>();
  @Output() delete = new EventEmitter<{item: Item, event: MouseEvent}>();

  onToggle() {
    this.toggle.emit(this.item);
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.delete.emit({item: this.item, event});
  }
}