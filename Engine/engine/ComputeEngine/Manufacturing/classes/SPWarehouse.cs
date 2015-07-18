using System;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.ComponentModel;

namespace Stratège
{
    public class SPWarehouse : Simulator.Warehouse
    {
        public Simulator.SemiProduct SemiProduct
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
