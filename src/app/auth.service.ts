import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable()

export class AuthServices implements CanActivate
{
    isAuth:string = '';

    canActivate()
    {
        this.isAuth = sessionStorage.getItem("AllowNav");
        if (atob(this.isAuth) == 'yes')
            return true;
        else    
            return false;
    }
}