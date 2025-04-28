import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './shared/header/header.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ShoppingListService } from './services/shopping-list.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    FormsModule,
    HeaderComponent,
 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'groza';
  
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  notificationVisible: boolean = false;

  triggerNotification(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.notificationVisible = true;

    setTimeout(() => {
      this.notificationVisible = false;
    }, 3000);
  }
  prompt = '';
  items: string[] = [];

  constructor(private shoppingService: ShoppingListService) {}

  getList() {
    this.shoppingService.getShoppingList(this.prompt)
      .subscribe(response => {
        this.items = response.items;
      });
  }
}