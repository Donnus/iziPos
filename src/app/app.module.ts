import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import { NgZorroAntdModule, NZ_I18N, en_US, NzPopoverModule } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { RouterModule } from '@angular/router';
import { ParticlesModule } from 'angular-particle';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';


import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginComponent } from './pages/login/login.component';
import { iziPosServices } from './iziPos.services';
import { StocksComponent } from './pages/welcome/stocks/stocks.component';
import { RetailComponent } from './pages/welcome/retail/retail.component';
import { WholeSalesComponent } from './pages/welcome/whole/whole.component';
import { UserManagementComponent } from './pages/welcome/user/user.component';
import { SettingsComponent } from './pages/welcome/settings/settings.component';
import { NotifierComponent } from './pages/welcome/notifier/notifier.component';
import { AuthServices } from './auth.service';
import { ReportComponent } from './pages/welcome/report/report.component';
import { EmpCareComponent } from './pages/welcome/empcare/empcare.component';
import { PaymentComponent } from './pages/welcome/payment/payment.component';
import { SmsComponent } from './pages/welcome/sms/sms.component';



registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    LoginComponent,
    StocksComponent,
    RetailComponent,
    WholeSalesComponent,
    UserManagementComponent,
    SettingsComponent,
    NotifierComponent,
    ReportComponent,
    EmpCareComponent,
    PaymentComponent,
    SmsComponent
  ],
  imports: [
    BrowserModule,
    NgZorroAntdModule,
    IconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    ParticlesModule,
    HttpClientModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    BrowserAnimationsModule,
    NzPopoverModule,
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', redirectTo: '/login' },
      { path: 'welcome', component: WelcomeComponent, canActivate: [AuthServices], children: [
        { path: 'stocks', component: StocksComponent },
        { path: 'retail', component: RetailComponent },
        { path: 'whole_sales', component: WholeSalesComponent },
        { path: 'user_management', component: UserManagementComponent },
        { path: 'settings', component: SettingsComponent },
        { path: 'notifier', component: NotifierComponent },
        { path: 'report', component: ReportComponent },
        { path: 'empcare', component: EmpCareComponent },
        { path: 'payment', component: PaymentComponent },
        { path: 'sms', component: SmsComponent }
      ] },
      { path: 'login', component: LoginComponent },
      { path: '**', redirectTo: '/login' }
    ])
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }, iziPosServices, AuthServices],
  bootstrap: [AppComponent]
})
export class AppModule { }
