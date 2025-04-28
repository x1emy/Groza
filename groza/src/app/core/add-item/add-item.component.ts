import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../services/websocket.service'; 

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemComponent {
  @Output() itemAdded = new EventEmitter<string>(); 
  
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

      
      this.websocketService.sendMessage({
        action: 'add',
        item: newItem
      });

      
      this.itemAdded.emit(itemName);

      
      this.itemControl.reset('');
    }
  }
}
