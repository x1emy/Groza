import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private onOpenCallback: (() => void) | null = null;
  private onCloseCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;
  private onMessageCallback: ((data: any) => void) | null = null;

  connect(listId: string): void {
    this.socket = new WebSocket(`ws://127.0.0.1:8000/ws/lists/${listId}/`);

    this.socket.onopen = () => {
      console.log('✅ WebSocket подключен');
      if (this.onOpenCallback) {
        this.onOpenCallback();
      }
    };

    this.socket.onclose = (event) => {
      console.log('❌ WebSocket отключен', event);
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    };

    this.socket.onerror = (error) => {
      console.error('⚠️ Ошибка WebSocket', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (e) {
        console.error('Ошибка парсинга сообщения', e);
      }
    };
  }

  // Новые методы для подписки на события
  onOpen(callback: () => void): void {
    this.onOpenCallback = callback;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  onMessage(callback: (data: any) => void): void {
    this.onMessageCallback = callback;
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket не подключен');
    }
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}