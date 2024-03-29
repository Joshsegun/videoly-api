const { Customer } = require("../models/customer");
const { Rental, validate } = require("../models/rental");
const { Movies } = require("../models/movie");
// const Fawn = require("fawn");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Fawn.init(mongoose);

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort({ dateOut: -1 });
  res.send(rentals);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer");

  const movie = await Movies.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });
  rental = await rental.save();
  movie.numberInStock--;
  movie.save();

  res.send(rental);

  // try {
  //   new Fawn.Task()
  //     .save("rentals", rental)
  //     .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
  //     .run();

  //   res.send(rental);
  // } catch (ex) {
  //   res.status(500).send("Something failed");
  // }
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer");

  const movie = await Movies.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie");

  const rental = await Rental.findByIdAndUpdate(req.params.id, {
    $set: {
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
    },
  });
  if (!rental) return res.status(404).send("Rental does not exist");
  res.send(rental);
});

module.exports = router;
