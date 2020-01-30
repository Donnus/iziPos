import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { Component } from  '@angular/core';
import { WelcomeComponent } from '../welcome.component';
import { iziPosServices } from 'src/app/iziPos.services';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-report',
    templateUrl: 'report.component.html',
    styleUrls: ['report.component.css'],
    providers: [DatePipe]
})

export class ReportComponent
{
    selectedReport;
    total: number;
    fromDate;
    toDate;
    myDate = new Date();
    rpv: string;
    ds:boolean;
    rt: boolean;
    st: boolean;
    em: boolean;
    ex: boolean;

    rptDaily: any = [];
    rptReturned: any = [];
    rptStock: any = [];
    rptEmp: any = [];
    rptExp: any = [];

    count:number;

    companyName;


    constructor(private location: WelcomeComponent, 
        private services: iziPosServices, private dp: DatePipe, private router: Router,
        private msg: NzMessageService) {}

    ngOnInit()
    {
        if(!this.services.allowAdminView)
        {
          this.msg.create('warning', 'Permission Denied!')
          if(!this.services.allowStockView)
            this.router.navigateByUrl("/welcome/retail");
          if(!this.services.allowRetailView)
            this.router.navigateByUrl("/welcome/stocks");
        }

        this.rpv = "d";
        this.location.locationTitle = "Report - Daily Sales";
        this.fromDate = this.dp.transform(this.myDate, 'dd-MMM-yyyy');
        this.toDate = this.dp.transform(this.myDate, 'dd-MMM-yyyy');
        this.setVisible();
        this.companyName = localStorage.getItem("c_name");
    }
    onDaily()
    {
        this.location.locationTitle = "Report - Daily Sales";
        this.rpv = "d";
        this.setVisible();
    }
    onReturned()
    {
        this.location.locationTitle = "Report - Returned Products";
        this.rpv = "r";
        this.setVisible();
    }
    onStock()
    {
        this.location.locationTitle = "Report - Stock History";
        this.rpv = "s";
        this.setVisible();
    }
    onEmployee()
    {
        this.location.locationTitle = "Report - Employees Drug Pick";
        this.rpv = "e";
        this.setVisible();
    }
    onExpired()
    {
        this.location.locationTitle = "Report - Expired Products";
        this.rpv = "x";
        this.setVisible();        
    }

    onPrint()
    {
        if(this.rpv == "d")
            this.services.printingService("dailyReport");
        if(this.rpv == "r")
            this.services.printingService("returnedReport");
        if(this.rpv == "s")
            this.services.printingService("stockReport");
        if(this.rpv == "e")
            this.services.printingService("empPickReport");
        if(this.rpv == "x")
            this.services.printingService("expiredReport");        
    }

    onFilter()
    {
        if (this.rpv == "d")
            this.services.dailySalesReport(this.dp.transform(this.fromDate,'yyyy-MM-dd'), 
            this.dp.transform(this.toDate,'yyyy-MM-dd')).subscribe(rpt => {
                this.rptDaily = rpt; this.count = this.rptDaily.length;});
        if (this.rpv == "r")
            this.services.returnedProductsReport(this.dp.transform(this.fromDate,'yyyy-MM-dd'), 
            this.dp.transform(this.toDate,'yyyy-MM-dd')).subscribe(rpt => {
                this.rptReturned = rpt; this.count = this.rptReturned.length});
        if (this.rpv == "s")
            this.services.stockHistoryReport(this.dp.transform(this.fromDate,'yyyy-MM-dd'), 
            this.dp.transform(this.toDate,'yyyy-MM-dd')).subscribe(rpt => {
                this.rptStock = rpt; this.count = this.rptStock.length});
        if (this.rpv == "e")
            this.services.employeeCareReport(this.dp.transform(this.fromDate,'yyyy-MM-dd'), 
            this.dp.transform(this.toDate,'yyyy-MM-dd')).subscribe(rpt => {
                this.rptEmp = rpt; this.count = this.rptEmp.length});
        if (this.rpv == "x")
            this.services.getExpiredProducts(this.dp.transform(this.fromDate,'yyyy-MM-dd'), 
            this.dp.transform(this.toDate,'yyyy-MM-dd')).subscribe(rpt => {
                this.rptExp = rpt; this.count = this.rptExp.length});
    }

    setVisible()
    {
        this.ds = false;
        this.em = false;
        this.rt = false;
        this.st = false;
        this.ex = false;
        if (this.rpv == "d")
            this.ds = true;
        else if ( this.rpv == "r")
            this.rt = true;
        else if (this.rpv == "s")
            this.st = true;
        else if (this.rpv == "e")
            this.em = true;
        else if (this.rpv == "x")
            this.ex = true;
    }
    
}