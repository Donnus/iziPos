import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { iziPosServices } from './../../../iziPos.services';
import { WelcomeComponent } from './../welcome.component';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import * as XLSX from 'xlsx'; 

@Component({
    selector: 'app-stocks',
    templateUrl: 'stocks.component.html',
    styleUrls: ['stocks.component.css']
})

export class StocksComponent implements OnInit
{
    dateFormat = "dd/MMM/yyyy";
    categories:any = [{
      categoryId: '',
      categoryName: '',
      dateAdded: ''
    }];
    brands:any = [{
      brandId: '',
      brand: ''
    }];
    suppliers;
    stockForm: FormGroup;
    isLoading: boolean;
    action:string;
    serverResponse:any = {
      username:'',
      message:''
    };

    allStocks:any=[];
    stocksToDisplay = [];
    loggedInUser: string;
    companyName;

    constructor(private home : WelcomeComponent, 
      private services: iziPosServices, private msg: NzMessageService, private router: Router){} 

    ngOnInit(): void {

      if(!this.services.allowStockView)
      {
        this.msg.create('warning', 'Permission Denied!')
          this.router.navigateByUrl("/welcome/retail");
      }

      this.companyName = localStorage.getItem("c_name");
      this.home.locationTitle = "Stock Management";
      this.action = 'A';
      this.loggedInUser = sessionStorage.getItem("userId");

      this.stockForm = new FormGroup({
        itemId: new FormControl(0),
        barcode: new FormControl(''),
        itemName: new FormControl('', Validators.required),
        category: new FormControl('', Validators.required),
        brand: new FormControl('', Validators.required),
        retailPrice: new FormControl('', Validators.required),
        wholeSalePrice: new FormControl('', Validators.required),
        cost: new FormControl('', Validators.required),
        quantity: new FormControl('', Validators.required),
        tablets: new FormControl('', Validators.required),
        expiryDate: new FormControl('', Validators.required),
        supplier: new FormControl('', Validators.required),
        stockLevel: new FormControl({value:0,disabled:true}),
        minLimit: new FormControl('20')
      });
      
      this.getAllStock();

      this.services.getCategories().subscribe(res => this.categories = res);
      this.services.getBrands().subscribe(res => this.brands = res);
      this.services.getSuppliers().subscribe(res => this.suppliers = res);
    }

    saveStock(details)
    {
      for (const i in this.stockForm.controls) {
        this.stockForm.controls[ i ].markAsDirty();
        this.stockForm.controls[ i ].updateValueAndValidity();
      }
      if(this.stockForm.valid)
      {

        this.isLoading = true;
        this.services.addEditStocks(details,this.loggedInUser,this.action).subscribe(res =>
          {
            this.serverResponse = res;

            if(this.serverResponse.username === 401)
            {
              this.msg.create('warning', this.serverResponse.message);
            }else{
              this.msg.create("success",this.serverResponse.message);
              this.stockForm.reset();
              this.stockForm.get('itemId').setValue(0);
              this.stockForm.get('barcode').setValue('');              
              this.getAllStock();
            }
            this.isLoading = false;
          },  err => {this.isLoading = false; this.msg.create("error",err.message);})
      }
    }

    onEdit(data)
    {
      this.action = 'E';
      this.stockForm.patchValue(data);
      this.stockForm.get('itemId').setValue(data.itemId);
    }

    onNewStock(data)
    {
      this.action = 'A';
      this.stockForm.patchValue(data);
      this.stockForm.get('itemId').setValue(data.itemId);      
    }

    reset()
    {
      this.action = 'A';
      this.stockForm.reset();
      this.stockForm.get('itemId').setValue(0);   
    }

    onSearch(val)
    {
      if(val === "")
        this.stocksToDisplay = this.allStocks;
      else
      {
        const data = this.allStocks.filter(x => x.itemName.toLowerCase().match(val.toLowerCase()));
        this.stocksToDisplay = data;
      }
    }

    getAllStock()
    {
      this.services.getAllStocks().subscribe(res =>{
        this.allStocks = res;
        this.stocksToDisplay = this.allStocks
      });
    }

    ExportToExcel() { 
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.allStocks);  
      const wb: XLSX.WorkBook = XLSX.utils.book_new();  
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  
      XLSX.writeFile(wb, 'Stocks.xlsx');  
    }

    onPrint()
    {
      this.services.printingService("stockReport");
    }
}