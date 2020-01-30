import { iziPosServices } from './../../iziPos.services';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css']
})

export class LoginComponent implements OnInit
{
    isLoading: boolean;
    authenticationMesssage:any = {
        username:'',
        message:'',
        userRole:''
      };

    loginForm: FormGroup;
    myStyle: object = {};
	myParams: object = {};
	width: number = 100;
    height: number = 100;
    
    compName:string = "";

    constructor(private services: iziPosServices, private msg: NzMessageService, private route: Router){  }

    ngOnInit() 
    {
        this.services.setLocalInfo();
        this.loginForm = new FormGroup({
            userName: new FormControl('', Validators.required),
            secretKey: new FormControl('', Validators.required)
        });

        this.myStyle = {
            'position': 'fixed',
            'width': '100%',
            'height': '100%',
            'z-index': -1,
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0,
        };

        this.myParams = {
                particles: {
                    number: {
                        value: 200,
                    },
                    color: {
                        value: '#ff0000'
                    },
                    shape: {
                        type: 'triangle',
                    },
            }
        };
        this.compName = localStorage.getItem("c_name");
    }

    submitForm(credentials)
    {
        for (const i in this.loginForm.controls) {
            this.loginForm.controls[ i ].markAsDirty();
            this.loginForm.controls[ i ].updateValueAndValidity();
          }
        if (this.loginForm.valid)
        {
            this.isLoading = true;
            this.services.authentication(credentials)
            .subscribe(res => {
              this.authenticationMesssage = res;
              if(this.authenticationMesssage.message === 'Login Successful!')
              {
                this.services.loggedInUserRole = this.authenticationMesssage.userRole;
                sessionStorage.setItem("u_r", btoa(this.authenticationMesssage.userRole));
                this.msg.create("success",this.authenticationMesssage.message);
                this.route.navigateByUrl("/welcome/retail");
                sessionStorage.setItem("userId", this.authenticationMesssage.username)
                sessionStorage.setItem("AllowNav", btoa("yes"));
                this.isLoading = false;
              }
              else{
                this.msg.create("error",this.authenticationMesssage.message);  
                this.isLoading = false;
              }
            },
            error => {this.msg.create("error",error.message); this.isLoading = false;})
          }
        }
    
}