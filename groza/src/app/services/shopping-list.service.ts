// shopping-list.service.ts
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket('ws://localhost:8000/ws/shopping-list/');
  }

  getShoppingList(prompt: string) {
    this.socket$.next({ prompt });
    return this.socket$.asObservable();
  }
}