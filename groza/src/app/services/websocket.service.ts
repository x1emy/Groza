
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private openSubject = new Subject<void>();
  private closeSubject = new Subject<void>();
  private errorSubject = new Subject<Event>();

  public messages$: Observable<any> = this.messageSubject.asObservable();
  public onOpen$: Observable<void> = this.openSubject.asObservable();
  public onClose$: Observable<void> = this.closeSubject.asObservable();
  public onError$: Observable<Event> = this.errorSubject.asObservable();

  connect(listId: string): void {
    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/lists/${listId}/`);

    this.socket.onopen = () => {
      console.log('✅ WebSocket подключен');
      this.openSubject.next();
    };

    this.socket.onclose = (event) => {
      console.log('❌ WebSocket отключен', event);
      this.closeSubject.next();
    };

    this.socket.onerror = (error) => {
      console.error('⚠️ Ошибка WebSocket', error);
      this.errorSubject.next(error);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.messageSubject.next(data);
      } catch (e) {
        console.error('Ошибка парсинга сообщения', e);
      }
    };
  }

  sendMessage(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket не подключен');
    }
  }

  close(): void {
    this.socket?.close();
    this.socket = null;
  }
}