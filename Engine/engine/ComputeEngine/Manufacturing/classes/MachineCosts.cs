
namespace Simulator
{
    public interface MachineCosts
    {
        int maintenance
        {
            get;
            set;
        }

        int breakdownRepairs
        {
            get;
            set;
        }

        int decommissioning
        {
            get;
            set;
        }

        int overheads
        {
            get;
            set;
        }

        int runningHour
        {
            get;
            set;
        }
    }
}
