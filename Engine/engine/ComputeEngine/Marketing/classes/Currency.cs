using System;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.ComponentModel;

namespace TypeScriptHTMLApp1
{
    public abstract class Currency
    {
        private string label;
        private string sign;

        public int exchangeRate
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
