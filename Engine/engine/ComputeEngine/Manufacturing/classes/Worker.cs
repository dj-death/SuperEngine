
namespace Simulator
{
    [TsClass]
    public class Worker : Object
    {
        private string category;
        private int minHoursWork;
        private int overtimeSatPremium;
        private int overtimeSunPremium;
        private int minHourlyWageRate;
        private int minPaidHours;
        private int strikeHoursPerWeek;
        private WorkerCosts costs;

        public int workersNb
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

        public int trainedNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int dismissedNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int recruitedNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int availableHours
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int absenteeismHours
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int workedHours
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int strikeNextPeriodWeeksNb
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public int wages
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public void recruit(int number)
        {
            throw new System.NotImplementedException();
        }

        public void train(int number)
        {
            throw new System.NotImplementedException();
        }

        public void dismiss(int number)
        {
            throw new System.NotImplementedException();
        }

        public void work(/*SHIFT_LEVEL shiftLevel*/)
        {
            throw new System.NotImplementedException();
        }

        public void pay(int hourlyWageRate)
        {
            throw new System.NotImplementedException();
        }
    }
}
