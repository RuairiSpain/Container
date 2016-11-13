ar express = require('express').Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

var Customer = require('../model/customer');

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))


function DateToJSON(date) {
    retrun date.substring(0, date.toISOString().indexOf('T'));
}


//build the REST operations at the base for customers
//this will be accessible from http://127.0.0.1:3000/customers if the default route for / is left unchanged
router.route('/')
    //GET all customers
    .get(function(req, res, next) {
        //retrieve all customers from Monogo
        Customer.find({}, function(err, customers) {
            if (err) {
                return console.error(err);
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //HTML response will render the index.jade file in the views/customers folder. We are also setting "customers" to be an accessible variable in our jade view
                    html: function() {
                        res.render('customers/index', {
                            title: 'All my customers',
                            "customers": customers
                        });
                    },
                    //JSON response will show all customers in JSON format
                    json: function() {
                        res.json(customers);
                    }
                });
            }
        });
    })
    //POST a new Customer
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var badge = req.body.badge;
        var dob = req.body.dob;
        var company = req.body.company;
        var isloved = req.body.isloved;
        //call the create function for our database
        Customer.create({
            name: name,
            badge: badge,
            dob: dob,
            isloved: isloved
        }, function(err, customer) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //Customer has been created
                console.log('POST creating new customer: ' + customer);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function() {
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("customers");
                        // And forward to success page
                        res.redirect("/customers");
                    },
                    //JSON response will show the newly created customer
                    json: function() {
                        res.json(customer);
                    }
                });
            }
        })
    });

/* GET New Customer page. */
router.get('/new', function(req, res) {
    res.render('customers/new', { title: 'Add New Customer' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    Customer.findById(id, function(err, customer) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function() {
                    next(err);
                },
                json: function() {
                    res.json({ message: err.status + ' ' + err });
                }
            });
            //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(customer);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});



router.route('/:id').get(function(req, res) {
    Customer.findById(req.id, function(err, customer) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            console.log('GET Retrieving ID: ' + customer._id);
            var customerdob = DateToJSON(customer.dob);
            res.format({
                html: function() {
                    res.render('customers/show', {
                        "customerdob": customerdob,
                        "customer": customer
                    });
                },
                json: function() {
                    res.json(customer);
                }
            });
        }
    });
});

router.route('/:id/edit').get(function(req, res) {
        //search for the customer within Mongo
        Customer.findById(req.id, function(err, customer) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                //Return the customer
                console.log('GET Retrieving ID: ' + customer._id);
                var customerdob = DateToJSON(customer.dob);
                res.format({
                    //HTML response will render the 'edit.jade' template
                    html: function() {
                        res.render('customers/edit', {
                            title: 'Customer' + customer._id,
                            "customerdob": customerdob,
                            "customer": customer
                        });
                    },
                    //JSON response will return the JSON output
                    json: function() {
                        res.json(customer);
                    }
                });
            }
        });
    })
    //PUT to update a customer by ID
    .put(function(req, res) {
        // Get our REST or form values. These rely on the "name" attributes
        var name = req.body.name;
        var badge = req.body.badge;
        var dob = req.body.dob;
        var company = req.body.company;
        var isloved = req.body.isloved;

        //find the document by ID
        Customer.findById(req.id, function(err, customer) {
            //update it
            customer.update({
                name: name,
                badge: badge,
                dob: dob,
                isloved: isloved
            }, function(err, customerID) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                } else {
                    //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                    res.format({
                        html: function() {
                            res.redirect("/customers/" + customer._id);
                        },
                        //JSON responds showing the updated values
                        json: function() {
                            res.json(customer);
                        }
                    });
                }
            })
        });
    })
    //DELETE a Customer by ID
    .delete(function(req, res) {
        //find customer by ID
        Customer.findById(req.id, function(err, customer) {
            if (err) {
                return console.error(err);
            } else {
                //remove it from Mongo
                customer.remove(function(err, customer) {
                    if (err) {
                        return console.error(err);
                    } else {
                        //Returning success messages saying it was deleted
                        console.log('DELETE removing ID: ' + customer._id);
                        res.format({
                            //HTML returns us back to the main page, or you can create a success page
                            html: function() {
                                res.redirect("/customers");
                            },
                            //JSON returns the item with the message that is has been deleted
                            json: function() {
                                res.json({
                                    message: 'deleted',
                                    item: customer
                                });
                            }
                        });
                    }
                });
            }
        });
    });

module.exports = router;