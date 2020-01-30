import { WelcomeComponent } from './../welcome.component';
import { iziPosServices } from 'src/app/iziPos.services';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
    selector: 'app-sms',
    templateUrl: 'sms.component.html',
    styleUrls: ['sms.component.css']
})
export class SmsComponent implements OnInit
{
    countryCode: string = "233";
    phoneNumber: string = "";
    radioValue: string = "";
    msg: string = "";

    smsLists;
    smsTemp = [];

    smsResponse;
    loading:boolean = false;

    constructor(private message: NzMessageService, private service: iziPosServices,
        private home: WelcomeComponent) {}

    ngOnInit()
    {
        this.home.locationTitle = "SMS Portal";
    }

    onAdd()
    {
        if(this.radioValue === "")
        {
            this.message.create("warning","Please select a radio button to continue");
            return;
        }
        if(this.radioValue === "Specific" && this.phoneNumber === "")
        {
            this.message.create("warning","Please provide a phone number");
            return;
        }
        if(this.radioValue === "Specific")
        {
            this.smsTemp.push({fullName:'Specific',mobile:this.phoneNumber,status:''});
            this.smsLists = this.smsTemp;
            this.phoneNumber = '';
        }else{
            this.loading = true;
            this.service.getAllUsers().subscribe(res => {
                this.smsLists = res; 
                this.smsLists.forEach(e => {
                    this.smsTemp.push({fullName:e.fullName,mobile:e.mobile,status:''});
                });
                this.loading = false;
            },err => this.loading = false)
        }

    }

    onRemove(data)
    {
        let id = this.smsTemp.indexOf(data);
        this.smsTemp.splice(id,1);
        this.smsLists = this.smsTemp;
    }

    onSend()
    {
        if(this.msg == '')
        {
            this.message.create("warning","Please Type the message to send"); return;
        }
        if (this.smsTemp.length == 0){this.message.create("warning","Please Provide the recievers of the SMS"); return;}
        this.loading = true;

        this.smsTemp.forEach(e => {
            this.service.sendSpecific(e.mobile,this.msg).subscribe(res => {
                this.smsResponse = res;
                //console.log(this.smsResponse);
                if(this.smsResponse.message == 'messages sent successfully')
                    e.status = 'Sent';
                else
                    e.status = 'Failed';
            });
        });
        this.loading = false;
    }

    onCancel()
    {
        this.smsTemp = [];
        this.msg = '';
        this.smsLists = [];
    }
}