import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { iziPosServices } from './../../../iziPos.services';
import { WelcomeComponent } from './../welcome.component';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
    styleUrls: ['settings.component.css']

})
export class SettingsComponent
{
    constructor(private home: WelcomeComponent, private service: iziPosServices,
        private msg: NzMessageService, private router: Router ){}

    categoryForm: FormGroup;
    supplierForm: FormGroup;
    prescForm: FormGroup;
    allCats;
    allSuppliers;
    priceChangeForm: FormGroup;
    stocksToDisplay:any = [];
    allStocks;
    loggedInUser: string;

    serverResponse:any = 
    {
        username: '',
        message: ''
    };

    priceChangeR:any = 
    {
        Id: 0,
        message: ''
    };

    ngOnInit()
    {

        if(!this.service.allowAdminView)
        {
          this.msg.create('warning', 'Permission Denied!')
          if(!this.service.allowStockView)
            this.router.navigateByUrl("/welcome/retail");
          if(!this.service.allowRetailView)
            this.router.navigateByUrl("/welcome/stocks");
        }

        this.home.locationTitle = "Settings";

        this.categoryForm = new FormGroup({
            action: new FormControl('N'),
            catId: new FormControl(0),
            catName: new FormControl('', Validators.required)
        });

        this.supplierForm = new FormGroup({
            action: new FormControl('A'),
            supplierId: new FormControl(0),
            supplier: new FormControl('', Validators.required),
            address: new FormControl(''),
            contact: new FormControl(''),
            email: new FormControl('', Validators.email),
            representative: new FormControl('')
        });

        this.priceChangeForm = new FormGroup({
            itemId: new FormControl(0, Validators.required),
            retailPrice: new FormControl('', Validators.required),
            wholeSalePrice: new FormControl('', Validators.required),
            reason: new FormControl('', Validators.required),
            operator: new FormControl('')
        })

        this.prescForm = new FormGroup({
            itemId: new FormControl(0, Validators.required),
            productName: new FormControl('', Validators.required),
            category: new FormControl('', Validators.required),
            prescription: new FormControl('')
        })        

        this.getAllCats();
        this.getAllSuppliers();
        this.getAllStocks();
        this.loggedInUser = sessionStorage.getItem("userId");
    }

    getAllCats()
    {
        this.service.getCategories().subscribe(res => this.allCats = res);
    }

    getAllSuppliers()
    {
        this.service.getSuppliers().subscribe(res => this.allSuppliers = res );
    }

    getAllStocks()
    {
        this.service.getAllStocks().subscribe(res =>{
            this.allStocks = res;
            this.stocksToDisplay = this.allStocks;
          });
    }

    onCategorySave(cat)
    {
        for (const i in this.categoryForm.controls) {
            this.categoryForm.controls[ i ].markAsDirty();
            this.categoryForm.controls[ i ].updateValueAndValidity();
          }
        if(this.categoryForm.valid)
        {
            if(this.categoryForm.get('action').value === 'N')
                this.categoryForm.get('catId').setValue(0);
            this.service.addEditCategories(cat).subscribe(res => {
                this.serverResponse = res;
                this.msg.create('success', this.serverResponse.message);
                this.categoryForm.get('action').setValue('N');
                this.getAllCats();
            }, err => this.msg.create('error', err.message))
        }
    }

    onSupplierSave(details)
    {
        for (const i in this.supplierForm.controls) {
            this.supplierForm.controls[ i ].markAsDirty();
            this.supplierForm.controls[ i ].updateValueAndValidity();
          }

        if (this.supplierForm.valid)
        {
           if(this.supplierForm.get('action').value === 'N')
            this.supplierForm.get('supplierId').setValue(0);

           this.service.addEditSupplier(details).subscribe(res => 
            {
                this.serverResponse = res;
                this.msg.create('success', this.serverResponse.message);
                this.supplierForm.get('action').setValue('N')
                this.getAllSuppliers();
            }, err => this.msg.create('error', err.message))
            
        }
    }

    onCatEdit(det)
    {
        this.categoryForm.get('catId').setValue(det.categoryId);
        this.categoryForm.get('catName').setValue(det.categoryName);
        this.categoryForm.get('action').setValue('E');
    }

    onSupEdit(sup)
    {
        this.supplierForm.patchValue(sup);
        this.supplierForm.get('action').setValue('E');
    }

    onCatReset()
    {
        this.categoryForm.get('action').setValue('N');
    }

    onSupReset()
    {
        this.supplierForm.get('action').setValue('N');
    }

    savePrice(details)
    {
        var user = sessionStorage.getItem("userId");
        
        this.priceChangeForm.get("operator").setValue(user);
        for (const i in this.priceChangeForm.controls) {
            this.priceChangeForm.controls[ i ].markAsDirty();
            this.priceChangeForm.controls[ i ].updateValueAndValidity();
          }
        if(this.priceChangeForm.valid)  
        {
            console.log(details);
            
            this.service.processPriceChange(details).subscribe(res => console.log(res))
        }
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

    onEditPrice(data)
    {
        this.priceChangeForm.patchValue(data);
        this.priceChangeForm.get('itemId').setValue(data.itemId);
    }

    onPrescription(data)
    {
        this.prescForm.reset();
        this.prescForm.get('itemId').setValue(data.itemId);
        this.prescForm.get('productName').setValue(data.itemName);
        this.prescForm.get('category').setValue(data.category);

        this.service.getPrescriptionById(data.itemId).subscribe(res => {
            this.priceChangeR = res;
            if(this.priceChangeR.length === 0) return;
            this.prescForm.get('prescription').setValue(res[0].message);
        })
    }

    savePrescription(data)
    {
        var d = {
            ItemId: data.itemId,
            Prescription: data.prescription,
            Operator: sessionStorage.getItem("userId")
        }

        this.service.addPrescription(d).subscribe(res => {
            this.msg.create('success', res[0].message);
            this.prescForm.reset();
        });
    }

}