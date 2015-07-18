(function (CREDIT) {
    CREDIT[CREDIT["CASH"] = 0] = "CASH";
    CREDIT[CREDIT["ONE_MONTH"] = 30] = "ONE_MONTH";
    CREDIT[CREDIT["TWO_MONTH"] = 60] = "TWO_MONTH";
    CREDIT[CREDIT["THREE_MONTH"] = 90] = "THREE_MONTH";
})(exports.CREDIT || (exports.CREDIT = {}));
var CREDIT = exports.CREDIT;
(function (FUTURES) {
    FUTURES[FUTURES["IMMEDIATE"] = 0] = "IMMEDIATE";
    FUTURES[FUTURES["THREE_MONTH"] = 1] = "THREE_MONTH";
    FUTURES[FUTURES["SIX_MONTH"] = 2] = "SIX_MONTH";
})(exports.FUTURES || (exports.FUTURES = {}));
var FUTURES = exports.FUTURES;
(function (DELIVERY) {
    DELIVERY[DELIVERY["IMMEDIATE"] = 0] = "IMMEDIATE";
    DELIVERY[DELIVERY["NEXT_PERIOD"] = 1] = "NEXT_PERIOD";
    DELIVERY[DELIVERY["AFTERNEXT_PERIOD"] = 2] = "AFTERNEXT_PERIOD";
})(exports.DELIVERY || (exports.DELIVERY = {}));
var DELIVERY = exports.DELIVERY;
(function (QUALITY) {
    QUALITY[QUALITY["LQ"] = 0] = "LQ";
    QUALITY[QUALITY["MQ"] = 1] = "MQ";
    QUALITY[QUALITY["HQ"] = 2] = "HQ";
})(exports.QUALITY || (exports.QUALITY = {}));
var QUALITY = exports.QUALITY;
(function (SHIFT_LEVEL) {
    SHIFT_LEVEL[SHIFT_LEVEL["SINGLE"] = 0] = "SINGLE";
    SHIFT_LEVEL[SHIFT_LEVEL["DOUBLE"] = 1] = "DOUBLE";
    SHIFT_LEVEL[SHIFT_LEVEL["TREBLE"] = 2] = "TREBLE";
})(exports.SHIFT_LEVEL || (exports.SHIFT_LEVEL = {}));
var SHIFT_LEVEL = exports.SHIFT_LEVEL;
(function (PERIODS) {
    PERIODS[PERIODS["QUARTER"] = 3] = "QUARTER";
    PERIODS[PERIODS["HALF_YEAR"] = 6] = "HALF_YEAR";
    PERIODS[PERIODS["YEAR"] = 12] = "YEAR";
})(exports.PERIODS || (exports.PERIODS = {}));
var PERIODS = exports.PERIODS;
(function (IMPROVEMENT_TYPE) {
    IMPROVEMENT_TYPE[IMPROVEMENT_TYPE["NONE"] = 0] = "NONE";
    IMPROVEMENT_TYPE[IMPROVEMENT_TYPE["MINOR"] = 1] = "MINOR";
    IMPROVEMENT_TYPE[IMPROVEMENT_TYPE["MAJOR"] = 2] = "MAJOR";
})(exports.IMPROVEMENT_TYPE || (exports.IMPROVEMENT_TYPE = {}));
var IMPROVEMENT_TYPE = exports.IMPROVEMENT_TYPE;
(function (COM_AXES) {
    COM_AXES[COM_AXES["PRICE"] = 0] = "PRICE";
    COM_AXES[COM_AXES["CONFORT"] = 1] = "CONFORT";
    COM_AXES[COM_AXES["RESISTANCE"] = 2] = "RESISTANCE";
    COM_AXES[COM_AXES["ESTHETIC"] = 3] = "ESTHETIC";
})(exports.COM_AXES || (exports.COM_AXES = {}));
var COM_AXES = exports.COM_AXES;
(function (STAR_RATINGS) {
    STAR_RATINGS[STAR_RATINGS["ONE_STAR"] = 1] = "ONE_STAR";
    STAR_RATINGS[STAR_RATINGS["TWO_STAR"] = 2] = "TWO_STAR";
    STAR_RATINGS[STAR_RATINGS["THREE_STAR"] = 3] = "THREE_STAR";
    STAR_RATINGS[STAR_RATINGS["FOUR_STAR"] = 4] = "FOUR_STAR";
    STAR_RATINGS[STAR_RATINGS["FIVE_STAR"] = 5] = "FIVE_STAR";
})(exports.STAR_RATINGS || (exports.STAR_RATINGS = {}));
var STAR_RATINGS = exports.STAR_RATINGS;
//# sourceMappingURL=ENUMS.js.map