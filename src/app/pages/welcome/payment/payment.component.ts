import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { iziPosServices } from './../../../iziPos.services';
import { WelcomeComponent } from './../welcome.component';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-payment',
    templateUrl: 'payment.component.html',
    styleUrls: ['payment.component.css']
})

export class PaymentComponent
{
    paymentForm: FormGroup;
    allSuppliers;
    selectedSupplier:string;
    history:any = [];

    serverResponse:any =
    {
        id: '',
        message: ''
    };
    isVisible:boolean;

    constructor(private home: WelcomeComponent, private service: iziPosServices,
        private msg: NzMessageService, private router: Router){}

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

        this.home.locationTitle = "Suppliers Payment";

        this.paymentForm = new FormGroup({
            supplierId: new FormControl('', Validators.required),
            amount: new FormControl('', Validators.required),
            narration: new FormControl('', Validators.required),
            operator: new FormControl(sessionStorage.getItem("userId"), Validators.required)
        });
        this.getAllSuppliers();
    }

    getAllSuppliers()
    {
        this.service.getSuppliers().subscribe(res => this.allSuppliers = res );
    }    

    onPayment(data)
    {
        this.paymentForm.get("supplierId").setValue(data.supplierId);
    }

    processPayment(details)
    {
        // var user = sessionStorage.getItem("userId");
        
        // this.paymentForm.get("operator").setValue(user);

        for (const i in this.paymentForm.controls) {
            this.paymentForm.controls[ i ].markAsDirty();
            this.paymentForm.controls[ i ].updateValueAndValidity();
        }    
        if(this.paymentForm.valid)
        {
            this.service.processSupplierPayment(details).subscribe(res => {
                this.serverResponse = res["0"];
                if (this.serverResponse.id === 401)
                    this.msg.create('warning', this.serverResponse.message);
                else
                {
                    this.msg.create('success', this.serverResponse.message);
                    this.getAllSuppliers();
                    this.paymentForm.reset();
                }
            }, err => this.msg.create('error', err.Message))
        }    
    }

    onHistory(data)
    {
        this.isVisible = true;
        this.selectedSupplier = data.supplier;
        this.service.getPaymentHistory(data.supplierId).subscribe(res => {
            this.history = res;
        });
    }

    handleCancel()
    {
        this.isVisible = false;
    }

    print(section)
    {
        this.service.printingService(section);
    }
}