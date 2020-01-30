import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { iziPosServices } from './../../iziPos.services';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  servResponse:any = {
    Id:'',
    message:''
  };

  isCollapsed = false;
  locationTitle:string;
  loggedinUser:string;
  companyDetails:any = [];
  outOfStock:any = [];
  expired:any = [];
  totalExpired = 0;
  totalOut = 0;
  notify = false;
  isVisible = false;

  status: string ="";
  workingDate: string = "";
  userRole: string;
  isRetailAllow: boolean;
  isStockAllow: boolean;
  isAdministrationAllow: boolean;
  
  constructor(private service: iziPosServices, private router: Router, private msg: NzMessageService) { }

  ngOnInit() {
    this.locationTitle = "Home";
    this.status = localStorage.getItem("c_status");
    this.workingDate = localStorage.getItem("c_wdate");
    this.userRole = atob(sessionStorage.getItem("u_r"));
    if(this.userRole == "Administrator")
    {
      this.isAdministrationAllow = true;
      this.isStockAllow = true;
      this.isRetailAllow = true;
      this.service.allowAdminView = true;
      this.service.allowRetailView = true;
      this.service.allowStockView = true;
    }
    else if (this.userRole == "Sales" )
    {
      this.isAdministrationAllow = false;
      this.isStockAllow = false;
      this.isRetailAllow = true;
      this.service.allowAdminView = false;
      this.service.allowRetailView = true;
      this.service.allowStockView = false;
    }
    else if (this.userRole == "Stock Management")
    {
      this.router.navigateByUrl("/welcome/stocks");
      this.isAdministrationAllow = false;
      this.isStockAllow = true;
      this.isRetailAllow = false;
      this.service.allowAdminView = false;
      this.service.allowRetailView = false;
      this.service.allowStockView = true;
    }

    this.service.getCompanyDetails().subscribe(res => this.companyDetails = res["0"] );
    this.service.getOutOfStockItems().subscribe(res => {
      this.outOfStock = res;
      this.outOfStock.forEach(e => {
        this.totalOut += 1;
      });

      this.service.getExpiredItems().subscribe(res => {
        this.expired = res;
        this.expired.forEach( ex => {
          this.totalExpired += 1;
        })
      })

      if(this.totalOut > 0 || this.totalExpired > 0)
      {
        this.notify = true;
        this.isVisible = true;
      }

      this.loggedinUser = sessionStorage.getItem("userId");
        
    });
  }

  setTitle()
  {
    this.locationTitle = "Home";
  }

  handleCancel()
  {
    this.isVisible = false;
  }

  handleOk()
  {
    this.isVisible = false;
    if (this.userRole == "Administrator" || this.userRole == "Stock Management")
      this.router.navigateByUrl('/welcome/notifier');
  }

  onLogout()
  {
    sessionStorage.clear();
    this.router.navigateByUrl("/login");
  }

  onBusinessClose()
  {
    this.service.processAdminTasks("EOD").subscribe(res => {
      this.servResponse = res["0"];
      this.service.sendEODSMS().subscribe(res => console.log(res));
      this.msg.create("success", this.servResponse.message);
      this.service.setLocalInfo();
      setTimeout(() => {
        this.status = localStorage.getItem("c_status");
        this.workingDate = localStorage.getItem("c_wdate");
      }, 2000);
    });
  }

  onBusinessOpen()
  {
    this.service.processAdminTasks("SOB").subscribe(res => {
      this.servResponse = res["0"];
      
      this.msg.create("success", this.servResponse.message);
      this.service.setLocalInfo();
      setTimeout(() => {
        this.status = localStorage.getItem("c_status");
        this.workingDate = localStorage.getItem("c_wdate");
      }, 2000);
    });
  }

}
