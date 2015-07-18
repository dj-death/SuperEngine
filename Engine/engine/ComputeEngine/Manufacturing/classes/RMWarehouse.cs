using System;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.ComponentModel;

namespace Stratège
{
    public class RMWarehouse : Simulator.Warehouse
    {
        public Simulator.RawMaterial RawMaterial
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
