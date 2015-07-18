

namespace Simulator
{
    public interface Shift
    {
        int level
        {
            get;
            set;
        }

        int workersNeededNb
        {
            get;
            set;
        }

        int workCapacity
        {
            get;
            set;
        }

        int maxHoursWeekDays
        {
            get;
            set;
        }

        int maxHoursOvertimeSaturday
        {
            get;
            set;
        }

        int maxHoursOvertimeSunday
        {
            get;
            set;
        }

        int shiftPremium
        {
            get;
            set;
        }
    }
}
