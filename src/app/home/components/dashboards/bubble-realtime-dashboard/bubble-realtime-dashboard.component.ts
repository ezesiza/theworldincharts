import { Component, OnInit, OnDestroy } from '@angular/core';
import { Trade, WebSocketService } from 'app/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bubble-realtime-dashboard',
  templateUrl: './bubble-realtime-dashboard.component.html',
  styleUrl: './bubble-realtime-dashboard.component.less'
})
export class BubbleRealtimeDashboardComponent implements OnInit, OnDestroy {

  trades: Trade[] = [];
  productIds = [
    "BTC-USD", "ETH-USD", "XRP-USD", "XLM-USD", "LTC-USD",
    "BCH-USD", "ZRX-USD", "ALGO-USD", "EOS-USD"
  ];
  private subscription: Subscription;

  constructor(private webSocketService: WebSocketService) {
  }

  ngOnInit() {
    this.webSocketService.connect(this.productIds);
    this.subscription = this.webSocketService.trades$.subscribe(
      trades => {
        this.trades = trades;
      }
    );
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
