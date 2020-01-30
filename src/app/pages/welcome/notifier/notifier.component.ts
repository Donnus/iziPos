import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { WelcomeComponent } from './../welcome.component';
import { iziPosServices } from './../../../iziPos.services';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-notifier',
    templateUrl: 'notifier.component.html',
    styleUrls: ['notifier.component.css']
})

export class NotifierComponent implements OnInit
{

    outOfStocks;
    outOfStocksDisplay = [];

    expired;
    expiredDisplay = [];
    companyName;
    selectedValue = "All";

    constructor(private service: iziPosServices, private home: WelcomeComponent,
      private router: Router, private msg: NzMessageService) {}

    ngOnInit(): void {

        this.selectedValue = "All";
        this.companyName = localStorage.getItem("c_name");
        var userRole = atob(sessionStorage.getItem("u_r"));
        if (userRole == "Sales")
          this.router.navigateByUrl('/welcome/retail');

        this.home.locationTitle = "Product Notifications"

        this.service.getOutOfStockItems().subscribe(res => {
            this.outOfStocks = res;
            
            this.outOfStocksDisplay = this.outOfStocks;  
            });

        this.service.getExpiredItems().subscribe(res =>{
          this.expired = res;
          this.expiredDisplay = this.expired;
        });
    }

    onSearch(val)
    {
      if(val === "")
        this.outOfStocksDisplay = this.outOfStocks;
      else
      {
        const data = this.outOfStocks.filter(x => x.itemName.toLowerCase().match(val.toLowerCase()));
        this.outOfStocksDisplay = data;
      }
    }

    onSelectionChanged()
    {
      if(this.selectedValue === "All")
        this.expiredDisplay = this.expired;
      if(this.selectedValue === "Expired")
      {
        const data = this.expired.filter(x => x.remainingDays <= 0);
        this.expiredDisplay = data;        
      }
    }

    onSearchExpired(val)
    {
      if(val === "")
        this.expiredDisplay = this.expired;
      else
      {
        const data = this.expired.filter(x => x.itemName.toLowerCase().match(val.toLowerCase()));
        this.expiredDisplay = data;
      }      
    }

    onPrint(section)
    {
      this.service.printingService(section);
    }

    onMoveExpired()
    {
      this.service.moveExpired().subscribe(res => {
        this.msg.create("success", res["0"].message);
        this.service.getExpiredItems().subscribe(res =>{
          this.expired = res;
          this.expiredDisplay = this.expired;
        });        
      })
    }
    
}