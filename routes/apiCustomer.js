var router = require('express').Router();
var HttpStatus = require('http-status-codes');
var Customer = require('../model/customer');


function DateToJSON(date) {
    return new Date(date).toISOString().replace(/T/, ' ').replace(/\..+/, '')
}

router.route('/customer/:id').get(function(req, res) {
    Customer.findOne({ _id: req.params.id }, function(err, customer) {
        if (err) {
            return res.status(HttpStatus.NOT_FOUND).send(err);
        }
        res.status(HttpStatus.OK).json(customer);
    });
});

function pagination(req) {
    var page = parseInt(req.query.page) || 0;
    var size = parseInt(req.query.size) || 0;
    var skip = page > 0 ? ((page - 1) * size) : 0;

    return { skip: skip, limit: size };
}

function filter(req) {
    return req.body || null;
}

router.route('/customer')
    .get(function(req, res) {
        var paging = pagination(req);

        Customer.find(filter, null, paging, function(err, customers) {
            if (err) {
                return res.status(HttpStatus.NOT_FOUND).send(err);
            }

            res.status(HttpStatus.OK).json(customers);
        });
    })
    .post(function(req, res) {
        req.body.dob = DateToJSON(req.body.dob);
        var customer = new Customer(req.body);

        customer.save(function(err, added) {
            if (err) {
                return res.status(HttpStatus.BAD_REQUEST).send(err);
            }

            res.status(HttpStatus.CREATED).send(added);
        });
    });


router.route('/customer/:id').put(function(req, res) {
    Customer.findOne({ _id: req.params.id }, function(err, customer) {
        if (err) {
            return res.status(HttpStatus.NOT_FOUND).send(err);
        }

        for (prop in req.body) {
            customer[prop] = req.body[prop];
        }

        // save the customer
        customer.save(function(err, updated) {
            if (err) {
                return res.status(HttpStatus.BAD_REQUEST).send(err);
            }

            res.status(HttpStatus.OK).json(updated);
        });
    });
});


router.route('/customer/:id').delete(function(req, res) {
    Customer.remove({
        _id: req.params.id
    }, function(err, deleted) {
        if (err) {
            return res.status(HttpStatus.BAD_REQUEST).send(err);
        }

        res.status(HttpStatus.OK).json(deleted);
    });
});

module.exports = router;