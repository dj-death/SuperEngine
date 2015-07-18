using System;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.ComponentModel;

namespace TypeScriptHTMLApp1
{
    public class Market
    {
        private int name;
        private Currency currency;
        private int unemploymentRate;
        private int externalTradeBalance;
        private int interestBaseRate;
        private int population;
        private int GDP;
        private int internetAcces;
        private bool acceptBacklog;
        private bool isCommissionsBasedOnOrders;

        public Distribution Distribution
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public Product Product
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int cashFlows
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }
    }
}
