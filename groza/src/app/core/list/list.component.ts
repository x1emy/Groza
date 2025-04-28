import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddItemComponent } from '../add-item/add-item.component';
import { ItemComponent } from '../item/item.component';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { Item } from '../../models/item.models';
import { AIHelperComponent } from '../../ai-helper/ai-helper.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, AddItemComponent, ItemComponent, AIHelperComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  @Output() notify = new EventEmitter<{ message: string; type: 'success' | 'error' }>();
  items: Item[] = [];
  listId = '3f7d9a66-bbb7-4f1e-bd51-d8fe9826a870'; // TODO: Заменить на динамический ID
  private isConnected = false;

  constructor(
    private apiService: ApiService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.initWebSocket();
  }

  ngOnDestroy(): void {
    this.websocketService.close();
  }

  private loadInitialData(): void {
    this.apiService.getList(this.listId).subscribe({
      next: (response: any) => {
        
        const items = Array.isArray(response) ? response : response?.data || [];
        this.items = this.normalizeItems(items);
        this.saveItems();
      },
      error: (err) => {
        console.error('Ошибка загрузки списка:', err);
        this.loadFromLocalStorage();
      }
    });
  }

  private initWebSocket(): void {
  this.websocketService.connect(this.listId);
  
 
  this.websocketService.onOpen$.subscribe(() => {
    this.isConnected = true;
    this.notify.emit({
      message: 'Соединение установлено',
      type: 'success'
    });
  });

  this.websocketService.onClose$.subscribe(() => {
    this.isConnected = false;
    this.notify.emit({
      message: 'Соединение потеряно',
      type: 'error'
    });
    
    setTimeout(() => this.initWebSocket(), 5000);
  });

  this.websocketService.onError$.subscribe((error) => {
    console.error('WebSocket ошибка:', error);
    this.notify.emit({
      message: 'Ошибка соединения',
      type: 'error'
    });
  });
  this.websocketService.messages$.subscribe((data) => {
    this.handleIncomingMessage(data);
  });
  
}
  private handleIncomingMessage(data: any): void {
    console.log('WebSocket сообщение:', data);
    
    const processedItem = this.processItem(data.item);

    switch (data.action) {
      case 'add':
        this.addItemToLocalState(processedItem);
        break;
      case 'delete':
        this.removeItemFromLocalState(processedItem.id);
        break;
      case 'toggle':
        this.updateItemInLocalState(processedItem);
        break;
    }

    this.saveItems();
    this.notify.emit({
      message: `Список обновлён (${data.action})`,
      type: 'success'
    });
  }

  // === Основные публичные методы ===
  onItemAdded(itemName: string): void {
    if (!itemName.trim()) return;
  
    const newItem: Item = {
      id: Date.now(),
      name: itemName,
      bought: false
    };
  
    this.websocketService.sendMessage({
      action: 'add',
      item: newItem
    });
  }

  toggleBought(item: Item): void {
    this.websocketService.sendMessage({
      action: 'toggle',
      item: {
        id: item.id,
        bought: !item.bought
      }
    });
  }

  deleteItem(item: Item, event: MouseEvent): void {
    event.stopPropagation();
    this.websocketService.sendMessage({
      action: 'delete',
      item: { id: item.id }
    });
  }


  private normalizeItems(items: Item[] | null | undefined): Item[] {
    return (items || []).map(item => ({
      id: item.id,
      name: item.name,
      bought: item.bought ?? false
    }));
  }

  private processItem(item: any): Item {
    return {
      id: item.id,
      name: item.name,
      bought: item.bought ?? false
    };
  }

  private addItemToLocalState(item: Item): void {
    if (!this.items.some(i => i.id === item.id)) {
      this.items.push(item);
    }
  }

  private removeItemFromLocalState(itemId: number): void {
    this.items = this.items.filter(i => i.id !== itemId);
  }

  private updateItemInLocalState(updatedItem: Item): void {
    const item = this.items.find(i => i.id === updatedItem.id);
    if (item) {
      item.bought = updatedItem.bought;
    }
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem('shopping-list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.items = this.normalizeItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Ошибка загрузки из localStorage:', e);
        this.items = []; 
      }
    }
  }

  private saveItems(): void {
    localStorage.setItem('shopping-list', JSON.stringify(this.items));
  }
  handleNotification(event: { message: string; type: 'success' | 'error' }) {
    
    console.log(`AI Helper: ${event.type} - ${event.message}`);
  }
  handleAISuggestions(items: string[]) {
   
    items.forEach(item => {
      this.onItemAdded(item);
    });
  }
  onItemsAdded(items: string[]) {
    items.forEach(item => {
      this.onItemAdded(item);
    });
  }
}