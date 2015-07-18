
namespace Simulator
{
    public class Machine : Object
    {
        private int deliveryTime;
        private int usefulLife;
        private int residualValue;
        private int workCapacity;
        private int breakdownProba;
        private int disposalPrice;
        private int acquisitionPrice;

        public int usedNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public Atelier Atelier
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int decommissionedNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int availablesNextPeriodNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int boughtNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int workedHoursNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int maintenancePlannedHoursNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int breakdownHoursNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int efficiencyAvg
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int theoreticalAvailableHoursNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public void buy(int units)
        {
            throw new System.NotImplementedException();
        }

        public void sell(int units)
        {
            throw new System.NotImplementedException();
        }

        public void repair()
        {
            throw new System.NotImplementedException();
        }

        public void doMaintenance(int hoursNb)
        {
            throw new System.NotImplementedException();
        }
    }
}
