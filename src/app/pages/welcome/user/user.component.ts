import { Router } from '@angular/router';
import { iziPosServices } from './../../../iziPos.services';
import { NzMessageService } from 'ng-zorro-antd';
import { WelcomeComponent } from './../welcome.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-user',
    templateUrl: 'user.component.html',
    styleUrls: ['user.component.css']
})

export class UserManagementComponent implements OnInit
{
    userForm: FormGroup;
    dateFormat = "dd/MMM/yyyy";
    action: string = "N";
    serverResponse:any = {
        username:'',
        message:''
      };
    isLoading: boolean = false;
    allUsers;

    constructor(private home: WelcomeComponent, private msg: NzMessageService,
        private service: iziPosServices, private router: Router ) {}

    ngOnInit(): void {

        if(!this.service.allowAdminView)
        {
          this.msg.create('warning', 'Permission Denied!')
          if(!this.service.allowStockView)
            this.router.navigateByUrl("/welcome/retail");
          if(!this.service.allowRetailView)
            this.router.navigateByUrl("/welcome/stocks");
        }
        
        this.home.locationTitle = "User Management";
        this.action = "N";

        this.userForm = new FormGroup({
            authId: new FormControl(0),
            fullName: new FormControl('', Validators.required),
            gender: new FormControl('Male', Validators.required),
            address: new FormControl(''),
            mobile: new FormControl(''),
            dateRecruited: new FormControl(),
            idType: new FormControl("Voter's", Validators.required),
            idNumber: new FormControl('', Validators.required),
            username: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            confirmPass: new FormControl('', Validators.required),
            userRole: new FormControl('Sales',Validators.required)
        });
        this.getAllUsers();
    }

    saveDetails(details)
    {
        for (const i in this.userForm.controls) {
            this.userForm.controls[ i ].markAsDirty();
            this.userForm.controls[ i ].updateValueAndValidity();
            }
        if(this.userForm.valid)
        {
            if(this.userForm.get('confirmPass').value !== this.userForm.get('password').value)
            {
                this.msg.create('error', 'The Two Password Do not match! Please Try again');
            }else
            {
                this.isLoading = true;
                this.service.addEditUser(details, 'ADMIN', this.action ).subscribe(res => {
                    this.serverResponse = res;
                    if(this.serverResponse.username === 'Error')
                        this.msg.create('error', this.serverResponse.message);
                    else
                        this.msg.create('success', this.serverResponse.message);
                    this.isLoading = false;
                    this.getAllUsers();
                    this.action = 'N';
                }, err => {this.msg.create('error', err.message); this.isLoading = false;})
            }
        }
    }

    getAllUsers()
    {
        this.service.getAllUsers().subscribe(res => this.allUsers = res);
    }

    onEdit(data)
    {
        this.action = 'E'
        this.userForm.get('confirmPass').setValue(data.password);
        this.userForm.patchValue(data);
    }

    reset()
    {
        this.action = 'N';
    }
    
}