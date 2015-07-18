

namespace Simulator
{
    public class Supplier
    {
        private int name;
        private QUALITY quality;
        private CREDIT[] availableCredits;
        private int spotPrice;
        private int interestRate;
        private int rebateRate;
        private int discountRate;

        public int price
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public RawMaterial RawMaterial
        {
            get
            {
                throw new System.NotImplementedException();
            }
            set
            {
            }
        }

        public void order(int quantity, CREDIT credit, QUALITY quality, DELIVERY deliveryTime)
        {
            throw new System.NotImplementedException();
        }
    }
}
