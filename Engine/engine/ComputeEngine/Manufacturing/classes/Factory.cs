namespace Simulator
{
    [TypeScriptInterface]
    public class Factory : Object
    {
        private Atelier[] ateliers;
        private int maxLandUse;
        private int maxFactorySpaceUse;
        private int fixedExpenses;

        public void produce()
        {
        }

        public void extendSpace(int extension)
        {
        }

        public int spaceNeeded
        {
            get
            {
                return 0;
            }
            set
            {
            }
        }

        public int label
        {
            get
            {
                return 0;
            }
            set
            {
                 
            }
        }

        public int CO2Footprint
        {
            get
            {
                return 0;
                 
            }
            set
            {
                 
            }
        }

        public Production Production
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
