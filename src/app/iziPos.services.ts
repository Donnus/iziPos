import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


const httpOptions = {
    headers: new HttpHeaders({'Content-Type':'application/json' })
};

@Injectable()

export class iziPosServices
{
    serverUrl = "https://localhost:5001/api/";
    company;
    loggedInUserRole: string;
    allowRetailView: boolean;
    allowStockView: boolean;
    allowAdminView: boolean;

    constructor( private http: HttpClient) {
        this.getCompanyDetails().subscribe(res => this.company = res["0"])
    }

    authentication(credentials)
    {
        return this.http.post(this.serverUrl + "authenticate", JSON.stringify(credentials), httpOptions);
    }

    getCategories()
    {
        return this.http.get(this.serverUrl + "get_cats", httpOptions);
    }
    getBrands()
    {
        return this.http.get(this.serverUrl + "get_brands", httpOptions);
    }
    getSuppliers()
    {
        return this.http.get(this.serverUrl + "get_suppliers", httpOptions);
    }
    addEditStocks(details, operator:string, action:string)
    {
        return this.http.post(this.serverUrl + "add_edit_stock/" + operator + "/" + action, JSON.stringify(details), httpOptions);
    }
    getAllStocks()
    {
        return this.http.get(this.serverUrl + "get_stocks", httpOptions);
    }
    saveOders(details, operator:string, isRetail)
    {
        return this.http.post(this.serverUrl + "save_order/" + operator + "/" + isRetail, JSON.stringify(details), httpOptions);
    }

    saveDispensed(details, operator:string, isRetail, comment: string)
    {
        return this.http.post(this.serverUrl + "save_dispense/" + operator + "/" + isRetail + "/" + comment
        , JSON.stringify(details), httpOptions);
    }

    addEditUser(details, operator, action)
    {
        return this.http.post(this.serverUrl + "user_management/" + action + "/" + operator, JSON.stringify(details), httpOptions);
    }

    getAllUsers()
    {
        return this.http.get(this.serverUrl + "all_users", httpOptions);
    }

    getDailySales(cashier: string)
    {
        return this.http.get(this.serverUrl + "daily_sales/" + cashier, httpOptions);
    }

    addEditCategories(details)
    {
        return this.http.post(this.serverUrl + "add_edit_cat", JSON.stringify(details), httpOptions);
    }

    addEditSupplier(details)
    {
        return this.http.post(this.serverUrl + "add_edit_suppliers", JSON.stringify(details), httpOptions);
    }

    getOutOfStockItems()
    {
        return this.http.get(this.serverUrl + "get_out_of_stock", httpOptions);
    }

    getCompanyDetails()
    {
        return this.http.get(this.serverUrl + "get_company_details", httpOptions)
    }

    getExpiredItems()
    {
        return this.http.get(this.serverUrl + "get_expired", httpOptions)
    }    

    processedReturnedItem(serialId, cashier, reason)
    {
        return this.http.get(this.serverUrl + "returned/" + serialId + "/" + reason + "/" + cashier, httpOptions);
    }

    processAdminTasks(task)
    {
        return this.http.get(this.serverUrl + "admin_process/"+ task, httpOptions);
    }

    setLocalInfo()
    {
        this.getCompanyDetails().subscribe(res => {
            this.company = res["0"];
            localStorage.setItem("c_name", this.company.companyName);
            localStorage.setItem("c_address", this.company.address);
            localStorage.setItem("c_contact", this.company.tel);
            localStorage.setItem("c_status", this.company.currentStatus);
            localStorage.setItem("c_wdate", this.company.workingDate);
          });        
    }

    processPriceChange(details)
    {
        return this.http.post(this.serverUrl + "price_change", details ,httpOptions);
    }

    processSupplierPayment(details)
    {
        return this.http.post(this.serverUrl + "sup_payment", details, httpOptions);
    }

    getPaymentHistory(accountId:string)
    {
        return this.http.get(this.serverUrl + "history/" + accountId, httpOptions);
    }

    moveExpired()
    {
        return this.http.get(this.serverUrl + "move_expired", httpOptions);
    }

    getExpiredProducts(from, to)
    {
        return this.http.get(this.serverUrl + "get_moved_expired/" + from + "/" + to, httpOptions);
    }

    sendEODSMS()
    {
        return this.http.get(this.serverUrl + "sms_eod", httpOptions);
    }

    sendSpecific(contact, msg)
    {
        return this.http.get(this.serverUrl + "sms_ind/" + contact + "/" + msg);
    }

    getPrescriptionById(id)
    {
        return this.http.get(this.serverUrl + "prescription/" + id, httpOptions);
    }

    addPrescription(data)
    {
        return this.http.post(this.serverUrl + "add_prescription", data, httpOptions);
    }

    deleteProductById(itemId, operator)
    {
        return this.http.get(this.serverUrl + "delete_item/" + itemId + "/" + operator, httpOptions);
    }

    getProfitAnalysis()
    {
        return this.http.get(this.serverUrl + "get_profit", httpOptions);
    }

    //REPORTING END POINTS
    dailySalesReport(from, to)
    {
        return this.http.get(this.serverUrl + "daily_report/" + from + "/" + to , httpOptions);
    }

    employeeCareReport(from, to)
    {
        return this.http.get(this.serverUrl + "empcare_report/" + from + "/" + to , httpOptions);
    }

    returnedProductsReport(from, to)
    {
        return this.http.get(this.serverUrl + "returned_report/" + from + "/" + to, httpOptions);
    }

    PriceChangeReport(from, to)
    {
        return this.http.get(this.serverUrl + "get_price_change/" + from + "/" + to, httpOptions);
    }

    stockHistoryReport(from, to)
    {
        return this.http.get(this.serverUrl + "stock_report/" + from + "/" + to, httpOptions);
    }

    mostSoldProducts(from, to)
    {
        return this.http.get(this.serverUrl + "get_most_sold/" + from + "/" + to, httpOptions);
    }

    printingService(section)
    {
        let printContents, popupWin;
        printContents = document.getElementById(section).innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>${this.company.companyName}</title>
              <style>
                body{
                    font-size: 8px;
                    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif
                }
                th, td {
                    border-bottom: 1px solid #ddd;
                    padding: 8px;
                    font-size: 8px;
                }
                tr:hover {background-color: #f5f5f5;}
                tr:nth-child(even) {background-color: #f2f2f2;}
                th {
                    background-color: rgb(14, 0, 123);
                    color: black;
                }
              </style>
            </head>
            <body onload="window.print();window.close()">${printContents}</body>
          </html>`
        );
        popupWin.document.close();
    }
}