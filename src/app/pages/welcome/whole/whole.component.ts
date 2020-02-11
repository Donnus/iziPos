import { iziPosServices } from '../../../iziPos.services';
import { WelcomeComponent } from '../welcome.component';
import { Component, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { NzMessageService, isEmpty, NzModalService } from 'ng-zorro-antd';

@Component({
    selector: 'app-whole',
    templateUrl: 'whole.component.html',
    styleUrls: ['whole.component.css']
})

export class WholeSalesComponent implements OnInit
{
    w_suggestions:any=[];
    w_allProducts:any = [];
    w_productName:string;
    w_quantity:number = 1;
    w_option:string = "Container/Box";
    w_unitPrice:number;
    w_subtotal:number;
    w_search: string;
    serverResponse:any = {
      id:'',
      message:''
    };

    w_total = 0.00;
    w_totalSales = 0.00;

    w_tempOrder = [];
    w_orderList;
    isVisible: boolean = false;
    dailySales;
    availInStock;

    w_productSelected;
    loggedInUser: string;
    companyName;
    companyAddress;
    companyContact;

    constructor(private location: WelcomeComponent, private services: iziPosServices
      ,private msg: NzMessageService, private modalServ: NzModalService) {}

    ngOnInit(): void {
        this.location.locationTitle = "Whole Sales";
        this.w_option = "Container/Box";
        this.services.getAllStocks().subscribe(res => this.w_allProducts = res);

        this.loggedInUser = sessionStorage.getItem("userId");

        this.companyName = localStorage.getItem("c_name");
        this.companyAddress = localStorage.getItem("c_address");
        this.companyContact = localStorage.getItem("c_contact");
    }

    w_onSearch(query)
    {
      if(query === "")
          this.w_suggestions = null;
      else if (isNaN(query))
      {
        const data = this.w_allProducts.filter(x => x.itemName.toLowerCase().match(query.toLowerCase()));
        this.w_suggestions = data;
      }else
      {
        const data = this.w_allProducts.filter(x => x.barcode === query);

        if(data.length > 0)
        {
          this.w_search = data[0].itemName;
          this.w_onSelect(data[0]);
        }
      }
    }

    w_onSelect(selected)
    {
      this.w_productSelected = selected;
      this.w_productName = selected.itemName;
      this.w_unitPrice = selected.retailPrice;

      this.services.getAllStocks().subscribe(res => {
        this.w_allProducts = res;
        const data = this.w_allProducts.filter(x => x.itemId === selected.itemId);
        this.availInStock = data[0].stockLevel;
      });
    }
    
    w_AddToCart()
    {
      if(this.w_quantity === null || isNaN(this.w_quantity)) return;
      if(this.w_quantity > this.availInStock)
      {
        this.msg.create("warning", "You cannot sell below your available stock!");
        return
      }

      var sub = this.w_quantity * parseFloat(this.w_unitPrice.toFixed(2)) ;
      this.w_tempOrder.push({itemId:this.w_productSelected.itemId,itemName: this.w_productSelected.itemName,
      qty:this.w_quantity,option: this.w_option,price: this.w_unitPrice.toFixed(2),subTotal: sub.toFixed(2)});
      this.w_orderList = this.w_tempOrder;

      this.w_total += sub;
      this.availInStock = null;

      this.w_onClear();
    }

    w_onClear()
    {
      this.w_productName='';
      this.w_quantity = 1;
      this.w_option = "Container/Box";
      this.w_unitPrice = null;
      this.w_subtotal = null;
      this.w_search = null;
      this.availInStock = null;
    }

    w_onQtyChange()
    {
      if(isNaN(this.w_quantity)) return;
      this.w_subtotal = this.w_unitPrice * this.w_quantity;
    }

    w_onEdit(data)
    {
      var index = this.w_tempOrder.indexOf(data);
      this.w_tempOrder.splice(index,1);
      this.w_orderList = this.w_tempOrder;
      this.w_total = this.w_total - data.subTotal;
      const edited = this.w_allProducts.filter(x => x.itemName.toLowerCase().match(data.itemName.toLowerCase()));
      this.w_onSelect(edited[0]);
    }
    w_onRemove(data)
    {
      var index = this.w_tempOrder.indexOf(data);
      this.w_tempOrder.splice(index,1);
      this.w_orderList = this.w_tempOrder;
      this.w_total = this.w_total - data.subTotal;
    }

    w_onCancelOrder()
    {
      this.w_tempOrder = [];
      this.w_orderList = null;
      this.w_total = 0.00;
      this.availInStock = null;
    }

    w_onPayment(r)
    {
      if(isNullOrUndefined(this.w_tempOrder) || isNullOrUndefined(this.w_orderList)) return;

      this.w_orderList.forEach(order => {
        this.services.saveOders(order, this.loggedInUser, 0).subscribe(res => {
          this.serverResponse = res;
        }, err => this.msg.create('error', err.message));
      });
      setTimeout(() => {
        if (this.serverResponse.id === 401)
        {
          this.msg.create('warning', this.serverResponse.message);
        }else{
          this.msg.create('success', "Payment Successful!"); 
          this.w_onCancelOrder();}      
      }, 1000);

      if(r === 1)
        this.services.printingService("orderReciept");
      if(r === 0)
        console.log("No reciept");
    }

    onDailySale()
    {
      this.services.getDailySales(this.loggedInUser).subscribe(res => {
        this.dailySales = res;
        this.w_totalSales = this.dailySales.reduce((sum, s) => sum + s.total, 0);
        this.isVisible = true;
      })
    }
    handleCancel()
    {
      this.isVisible = false;
    }

    onViewPrescription(data)
    {
      this.services.getPrescriptionById(data.itemId).subscribe(res => {
        this.serverResponse = res;
            if(this.serverResponse.length === 0) return;
            this.modalServ.info({
              nzTitle: data.itemName,
              nzContent: "<pre>" + res[0].message + "</pre>"
            })
      })
    }
}