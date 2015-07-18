var exogenous = function (req, res, next) {
    var status: number, // error 500
        data: any;

    console.log(req.body);


    var error = false;
    var message;

    if (!error) {
        message = "init_success";
    }



    data = {
        message: message
    };


    res.json(data);
};

export = exogenous;