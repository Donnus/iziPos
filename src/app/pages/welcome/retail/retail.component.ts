import { iziPosServices } from './../../../iziPos.services';
import { WelcomeComponent } from './../welcome.component';
import { Component, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { NzMessageService, isEmpty, NzModalService } from 'ng-zorro-antd';

@Component({
    selector: 'app-retail',
    templateUrl: 'retail.component.html',
    styleUrls: ['retail.component.css']
})

export class RetailComponent implements OnInit
{
    suggestions:any=[];
    allProducts:any = [];
    productName:string;
    quantity:number = 1;
    option:string;
    unitPrice:number;
    subtotal:number;
    search: string;
    serverResponse:any = {
      id:'',
      message:''
    };

    productReturnRes;
    getItemIdOnEnter;

    total = 0.00;
    totalSales = 0.00;

    tempOrder = [];
    orderList;
    isVisible: boolean = false;
    dailySales;

    productSelected;
    availInStock;
    returnReason: string = "";
    loggedInUser: string;
    companyName;
    companyAddress;
    companyContact;

    constructor(private location: WelcomeComponent, private services: iziPosServices
      ,private msg: NzMessageService, private modalServ: NzModalService) {}

    ngOnInit(): void {
        this.location.locationTitle = "Retail Point Of Sales";

        this.services.getAllStocks().subscribe(res => this.allProducts = res);
        this.loggedInUser = sessionStorage.getItem("userId");

        this.companyName = localStorage.getItem("c_name");
        this.companyAddress = localStorage.getItem("c_address");
        this.companyContact = localStorage.getItem("c_contact");
    }

    onSearch(query)
    {
        if(query === "")
          this.suggestions = null;
      else if (isNaN(query))
      {
        const data = this.allProducts.filter(x => x.itemName.toLowerCase().match(query.toLowerCase()));
        this.suggestions = data;
      }else
      {
        const data = this.allProducts.filter(x => x.barcode === query);

        if(data.length > 0)
        {
          this.search = data[0].itemName;
          this.onSelect(data[0]);
        }
      }
    }

    onEnter()
    {
      this.getItemIdOnEnter = this.search;
      if (isNaN(this.getItemIdOnEnter)) return;
      const data = this.allProducts.filter(x => x.itemId === this.search);

      this.search = data[0].itemName;
      this.onSelect(data[0]);
    }

    onSelect(selected)
    {
      this.productSelected = selected;
      this.productName = selected.itemName;
      if(this.productSelected.tablets === 1 )
        this.option = 'Container/Box';
      else
        this.option = 'Tablets';
      
      if(this.option === 'Tablets')
      {
        var p = (this.productSelected.retailPrice / this.productSelected.tablets)
      }else {p = selected.retailPrice;}
      this.unitPrice = p;

      this.services.getAllStocks().subscribe(res => {
        this.allProducts = res;
        const data = this.allProducts.filter(x => x.itemId === selected.itemId);
        this.availInStock = data[0].stockLevel;
      });
      
    }
    
    AddToCart()
    {
      if(this.quantity === null || isNaN(this.quantity) || this.option === '') return;

      if(this.quantity > this.availInStock && this.option === 'Container/Box' || this.availInStock === 0)
      {
        this.msg.create("warning", "You cannot sell below your available stock!");
        return
      }

      var sub = this.quantity * parseFloat(this.unitPrice.toFixed(2));
      this.tempOrder.push({itemId:this.productSelected.itemId,itemName: this.productSelected.itemName,
      qty:this.quantity,option: this.option,price: this.unitPrice.toFixed(2),subTotal: sub.toFixed(2)});
      this.orderList = this.tempOrder;

      this.total += sub;
      this.availInStock = null;

      this.onClear();
    }

    onOptionChange()
    {
      if (this.productName === '' || this.productName === null)
        return;
      if(this.option === 'Tablets' )
      {
        this.unitPrice = (this.productSelected.retailPrice / this.productSelected.tablets);
        if(isNaN(this.quantity)) return;
          this.subtotal = this.unitPrice * this.quantity;
      }
      if(this.option === 'Container/Box')
      {
        this.unitPrice = this.productSelected.retailPrice;
        if(isNaN(this.quantity)) return;
          this.subtotal = this.unitPrice * this.quantity;
      }
    }
    onClear()
    {
      this.productName='';
      this.quantity = 1;
      this.option = "Tablets";
      this.unitPrice = null;
      this.subtotal = null;
      this.search = null;
      this.availInStock = null;
    }

    onQtyChange()
    {
      if(isNaN(this.quantity)) return;
      this.subtotal = this.unitPrice * this.quantity;
    }

    onEdit(data)
    {
      var index = this.tempOrder.indexOf(data);
      this.tempOrder.splice(index,1);
      this.orderList = this.tempOrder;
      this.total = this.total - data.subTotal;
      const edited = this.allProducts.filter(x => x.itemName.toLowerCase().match(data.itemName.toLowerCase()));
      this.onSelect(edited[0]);
    }
    onRemove(data)
    {
      var index = this.tempOrder.indexOf(data);
      this.tempOrder.splice(index,1);
      this.orderList = this.tempOrder;
      this.total = this.total - data.subTotal;
    }

    onCancelOrder()
    {
      this.tempOrder = [];
      this.orderList = null;
      this.total = 0.00;
    }

    onPayment(r)
    {
      if(isNullOrUndefined(this.tempOrder) || isNullOrUndefined(this.orderList)) return;

      this.orderList.forEach(order => {
        this.services.saveOders(order, this.loggedInUser, 1).subscribe(res => {
          this.serverResponse = res;
        }, err => this.msg.create('error', err.message));
      });
      setTimeout(() => {
        if (this.serverResponse.id === 401)
        {
          this.msg.create('warning', this.serverResponse.message);
        }else{
          this.msg.create('success', "Payment Successful!"); 
          if(r === 1)
            this.services.printingService("orderReciept");
          if(r === 0)
            console.log("No reciept");          
          this.onCancelOrder();}      
      }, 1000);
      
    }

    onDailySale()
    {
      this.services.getDailySales(this.loggedInUser).subscribe(res => {
        this.dailySales = res;
        this.totalSales = this.dailySales.reduce((sum, s) => sum + s.total, 0);
        this.isVisible = true;
      })
    }
    handleCancel()
    {
      this.isVisible = false;
    }

    onProductReturn(data)
    {
      //console.log(data);
      if (this.returnReason === "" || this.returnReason === null)
      {
        this.msg.create('warning', "Please Provide a reason for returning this product");
        return
      }
      this.services.processedReturnedItem(data.serialId, this.loggedInUser, this.returnReason)
      .subscribe(res => {
        this.productReturnRes = res;
        if(this.productReturnRes.statusCode = 200)
          this.msg.create('success', 'Item Returned Successfully!');
        this.onDailySale();
      })
      
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