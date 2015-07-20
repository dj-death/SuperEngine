import Employee = require('../../Personnel/src/Employee');
import LabourPool = require('../../Environnement/src/LabourPool');

import ObjectsManager = require('../../ObjectsManager');

import Market = require('./Market');

import console = require('../../../../utils/logger');


interface SalesForceCost extends Employee.EmployeeCosts {
    minSupportPerAgent: number;
}



interface SalesForceParam extends Employee.EmployeeParams {
    id: string;
    isCommissionsBasedOnOrders: boolean;

    isECommerceDistributor: boolean;
    costs: SalesForceCost;
}


class SalesForce extends Employee.Employee {
    // params
    params: SalesForceParam;

    market: Market;
    
    // decision
    appointedNb: number;
    commissionRate: number;

    supportPerAgent: number;

    constructor(params: SalesForceParam) {
        super(params);
    }

    // helpers

    init(availablesAgentsNb: number, labourPool: LabourPool, market?: Market) {
        this.reset();
        
        super.init(availablesAgentsNb, labourPool);

        this.market = market;

        ObjectsManager.register(this, "marketing");
    }

    reset() {
        this.initialised = false;
    }

    // result

    // costs
    get supportCost(): number {
        return this.supportPerAgent * this.employeesNb;
    }

    get totalCost(): number {
        return this.supportCost + this.commissionsCost + this.personnelCost;
    }

    get commissionsCost(): number {
        var commissionsBase: number,
            salesRevenue: number,
            ordersValue: number,
            commissions: number;

        salesRevenue = this.market.salesRevenue;
        ordersValue = this.market.ordersValue;

        commissionsBase = this.params.isCommissionsBasedOnOrders ? ordersValue : salesRevenue;

        commissions = Math.round(commissionsBase * this.commissionRate);

        return commissions;
    }

    // actions
    appoint(appointedNb: number, supportPerAgent: number, commissionRate: number): boolean {
        this.appointedNb = appointedNb;
        this.commissionRate = commissionRate;
        this.supportPerAgent = supportPerAgent < this.params.costs.minSupportPerAgent ? this.params.costs.minSupportPerAgent : supportPerAgent;

        if (this.employeesNb < appointedNb) {
            this.recruit(appointedNb - this.employeesNb);
        }

        if (this.employeesNb > appointedNb) {
            this.dismiss(this.employeesNb - appointedNb);
        }

        return true;
    }

    getEndState(): any {
        var result = {};

        var state = {
            "effectiveAppointedNb": this.appointedNb,
            "resignedNb": this.resignedNb,
            "availablesNextPeriodNb": this.availablesNextPeriodNb
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.params.id + "_";
            prop += key;

            result[prop] = state[key];
        }

        return result;

    }

}

export = SalesForce;