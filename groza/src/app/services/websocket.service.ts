import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;

  connect(listId: string): void {
    this.socket = new WebSocket(`ws://localhost:8000/ws/lists/${listId}/`);
  
    this.socket.onopen = () => {
      console.log('✅ WebSocket подключен');
    };
  
    this.socket.onclose = (event) => {
      console.log('❌ WebSocket отключен', event);
    };
  
    this.socket.onerror = (error) => {
      console.error('⚠️ Ошибка WebSocket', error);
    };
  }
  

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.onmessage = (event: MessageEvent<any>) => {
        const data = JSON.parse(event.data);
        callback(data);
      };
    }
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
