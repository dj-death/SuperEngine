import ENUMS = require('../../ENUMS');

import Market = require('./Market');
import SalesForce = require('./SalesForce');

import ObjectsManager = require('../../ObjectsManager');

interface WebsiteCosts {
    serviceCostRate: number;
    initialJoiningFees: number;
    websiteOnePortOperating: number;
    closingDownFees: number;
}

interface WebsiteParams {
    id: string;
    distributorsNb: number;
    capacityChangeEffectiveness: ENUMS.FUTURES;
    costs: WebsiteCosts;
}

class ECommerce {
    private initialised: boolean;

    params: WebsiteParams;

    internetMarket: Market;
    distributor: SalesForce;

    constructor(params: WebsiteParams) {
        this.params = params;
    }

    init(activeLastPeriodWebsitePortsNb: number, internetMarket: Market, distributor: SalesForce) {
        this.reset();

        // begin from the last period
        this.activeWebsitePortsNb = activeLastPeriodWebsitePortsNb;

        this.distributor = distributor;
        this.internetMarket = internetMarket;
        // ok
        this.initialised = true;

        ObjectsManager.register(this, "marketing");
    }

    reset() {
        this.websiteVisitsNb = 0;
        this.failedWebsiteVisitsNb = 0;
        this.potentialWebsiteVisitsNb = 0;

        this.serviceComplaintsNb = 0;

        this.initialised = false;
    }

    // decisions
    websiteDevBudget: number;
    wantedWebsitePortsNb: number;


    // results
    /*
     * Number of internet ports: 
     *  The number of ports which you decided to operate last quarter. 
     *  This determines the capacity of your web-site (see below).
     */
    activeWebsitePortsNb: number;

    isInitialJoining: boolean;
    isClosingDown: boolean;
   
    /*
     * This section gives performance statistics relating to your internet operation. 
     * If you are not operating a web-site the statistics will show as 0.
     * 
     */

  
    /*
     * Number of visits to your web-site: 
     *  The number of successful visits made to your web-site last quarter. 
     *  This shows the degree of interest in your web-site. 
     *  Your success in converting these visits into orders for products will depend on the effectiveness of your web-site 
     *  and on the marketing image of your products. 
     *  This statistic is provided by your ISP.
     */
    websiteVisitsNb: number;
    failedWebsiteVisitsNb: number;
    potentialWebsiteVisitsNb: number;

    /*
     *  Estimated level of failed visits (%): 
     *  the number of failed attempts to visit your web-site last quarter divided by the total number of potential visits. 
     *  This performance statistic is provided by your ISP.
     */
    get failedWebsiteVisitsRate(): number {
        if (this.potentialWebsiteVisitsNb === 0) {
            return 0;
        }

        return this.failedWebsiteVisitsNb / this.potentialWebsiteVisitsNb;
    }

    /*
     *  Internet service complaints: 
     *  The number of complaints received by your internet distributor because of poor packaging, 
     *  incorrect addressing, or other delivery problems. It is an indication of the efficiency of your internet distributor's operation, 
     *  and affects your marketing image. 
     */
    serviceComplaintsNb: number;

    /*
     * Software determines the quality of your website (attractiveness, ease of use, etc.) 
     * and you decide how much to spend on website development, which is mainly for such software.
     * Regular, independent surveys give "Star Ratings" which show how customers rate your web-site. 
     * Five stars are the best possible; one star is the worst. Such information incurs an additional cost.
     */
    websiteCustomersRatings: ENUMS.STAR_RATINGS;

    /*
     * your website should have the capacity to cope with the volume of traffic that it might attract. 
     * This capacity is defined in terms of the number of access "ports" it has.
     */

    theoreticalAvgCapacity: number;
    practicalWorkingCapacity: number;

    // costs

    get websiteDevelopmentCost(): number {
        return this.websiteDevBudget;
    }

    get feesCost(): number {
        var fees: number;

        if (this.isClosingDown) {
            fees = this.params.costs.closingDownFees;
        }

        if (this.isInitialJoining) {
            fees = this.params.costs.initialJoiningFees;
        }

        return fees || 0;
    }

    get websiteOperatingCost(): number {
        return this.activeWebsitePortsNb * this.params.costs.websiteOnePortOperating;
    }

    get serviceCost(): number {
        return Math.round(this.internetMarket.salesRevenue * this.params.costs.serviceCostRate);
    }

    get ISPCost(): number {
        return this.websiteOperatingCost + this.serviceCost;
    }

    get internetDistributionCost(): number {
        return this.distributor.totalCost + this.feesCost;
    }

    // actions
    developWebsite(budget: number) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }

        this.websiteDevBudget = budget;

    }

    operateOn(portsNb: number) {
        if (!this.initialised) {
            console.log('not initialised');
            return false;
        }

        this.wantedWebsitePortsNb = portsNb;

        this.isInitialJoining = this.activeWebsitePortsNb === 0 && portsNb > 0;
        this.isClosingDown = this.activeWebsitePortsNb > 0 && portsNb === 0;

        if (this.isClosingDown) {
            this.distributor.dismiss(this.params.distributorsNb);
        }

        if (this.isInitialJoining) {
            this.distributor.recruit(this.params.distributorsNb);
        }

        if (this.params.capacityChangeEffectiveness === ENUMS.FUTURES.IMMEDIATE) {
            this.activeWebsitePortsNb = portsNb;
        }

    }

    getEndState(): any {
        var result = {};

        var state = {
            "activeWebsitePortsNb": this.activeWebsitePortsNb,
            "websiteVisitsNb": this.websiteVisitsNb,
            //"successfulWebsiteVisitsPerThousand": this.failedWebsiteVisitsRate,
            "serviceComplaintsNb": this.serviceComplaintsNb,

            "distributionCost": this.internetDistributionCost,
            "ISPCost": this.ISPCost,
            "websiteDevelopmentCost": this.websiteDevelopmentCost
        };

        for (var key in state) {
            if (!state.hasOwnProperty(key)) {
                continue;
            }

            var prop = this.params.id + "_" + key;
            result[prop] = state[key];
        }

        return result;

    }


}

export = ECommerce;