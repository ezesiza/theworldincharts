import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Trade {
    trade_id: string;
    product_id: string;
    last_size: number;
    volume_24h: number;
    side: string;
    time: string;
    dateObj: Date;
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private webSocket: WebSocket;
    private tradesSubject = new BehaviorSubject<Trade[]>([]);
    trades$ = this.tradesSubject.asObservable();

    constructor() { }

    connect(productIds: string[]) {
        const url = 'wss://ws-feed-public.sandbox.exchange.coinbase.com';
        this.webSocket = new WebSocket(url);

        const subscription = {
            "type": "subscribe",
            "channels": [
                {
                    "name": "ticker",
                    "product_ids": productIds
                }
            ]
        };

        this.webSocket.onopen = () => {
            this.webSocket.send(JSON.stringify(subscription));
        };

        this.webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ticker') {
                data.dateObj = new Date(data.time);
                const currentTrades = this.tradesSubject.value;
                this.tradesSubject.next([...currentTrades, data]);
            }
        };

        this.webSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.webSocket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }

    disconnect() {
        if (this.webSocket) {
            this.webSocket.close();
        }
    }
} 