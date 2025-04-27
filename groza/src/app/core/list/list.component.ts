import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddItemComponent } from '../add-item/add-item.component';
import { ItemComponent } from '../item/item.component';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service'; // импортируем наш WebSocket сервис

interface Item {
  id: number;
  name: string;
  bought: boolean;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, AddItemComponent, ItemComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  constructor(private apiService: ApiService, private websocketService: WebsocketService) {}

  @Output() notify: EventEmitter<{ message: string, type: 'success' | 'error' }> = new EventEmitter();

  items: Item[] = [];

  ngOnInit(): void {
    const saved = localStorage.getItem('shopping-list');
    if (saved) {
      this.items = JSON.parse(saved);
    }

    const listId = '3f7d9a66-bbb7-4f1e-bd51-d8fe9826a870'; // заменишь на динамический id списка
    this.websocketService.connect(listId);

    this.websocketService.onMessage((data: any) => {
      if (data.action === 'add') {
        this.items.push(data.item);
      } else if (data.action === 'delete') {
        this.items = this.items.filter(i => i.id !== data.item.id);
      } else if (data.action === 'toggle') {
        const item = this.items.find(i => i.id === data.item.id);
        if (item) {
          item.bought = data.item.bought;
        }
      }

      this.saveItems();
    });
  }

  ngOnDestroy(): void {
    this.websocketService.close();
  }

  onItemAdded(itemName: string): void {
    const newItem: Item = {
      id: Date.now(),
      name: itemName,
      bought: false
    };

    this.items.push(newItem);
    this.saveItems();

    this.websocketService.sendMessage({
      action: 'add',
      item: newItem
    });

    this.notify.emit({ message: 'Элемент добавлен!', type: 'success' });
  }

  toggleBought(item: Item): void {
    item.bought = !item.bought;
    this.saveItems();

    this.websocketService.sendMessage({
      action: 'toggle',
      item: item
    });
  }

  deleteItem(item: Item, event: MouseEvent): void {
    event.stopPropagation();
    this.items = this.items.filter(i => i.id !== item.id);
    this.saveItems();

    this.websocketService.sendMessage({
      action: 'delete',
      item: item
    });

    this.notify.emit({ message: 'Элемент удален!', type: 'error' });
  }

  private saveItems(): void {
    localStorage.setItem('shopping-list', JSON.stringify(this.items));
  }
  sendItem(itemName: string): void {
    if (!itemName.trim()) {
      return; // Не отправляем пустое сообщение
    }
  
    const newItem: Item = {
      id: Date.now(),
      name: itemName,
      bought: false
    };
  
    this.items.push(newItem);
    this.saveItems();
  
    this.websocketService.sendMessage({
      action: 'add',
      item: newItem
    });
  
    this.notify.emit({ message: 'Элемент добавлен через WebSocket!', type: 'success' });
  }
  
}
