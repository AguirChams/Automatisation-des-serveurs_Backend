const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require('mongoose');
const {ObjectId}=mongoose.Schema;
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");
const Profile = require("../../models/Profile");


// Get the current user
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json(req.user);
});


router.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        Pole: req.body.Pole, // Add the Pole field
        role: req.body.role // Add the role field
      });

      newUser
        .save()
        .then(user => {
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            Pole: user.Pole,
            role: user.role
          };

          // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              if (err) throw err;
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );

        })
        .catch(err => console.log(err));
    }
  });
});

router.get("/admin-users", (req, res) => {
  User.find({ role: "ADMIN" })
    .then(users => {
      res.json(users);
    })
    .catch(err => console.log(err));
});



router.get("/admin-count", (req, res) => {
  User.find({ role: "ADMIN" })
    .then(users => {
      res.json({
        count: users.length
      });
    })
    .catch(err => console.log(err));
});

router.get("/developer-count", (req, res) => {
  User.find({ role: "DEVELOPER" })
    .then(users => {
      res.json({
        count: users.length
      });
    })
    .catch(err => console.log(err));
});

router.get("/developer-users", (req, res) => {
  User.find({ role: "DEVELOPER" })
  .then(users => {
    res.json(users);
  })
    .catch(err => console.log(err));
});


// Login route
router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
   if (user) {

      // User matched
      // Create JWT Payload
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        Pole: user.Pole, // Add the Pole field
        role: user.role
      };

      // Sign token
      jwt.sign(
        payload,
        keys.secretOrKey,
        {
          expiresIn: 31556926 // 1 year in seconds
        },
        (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        }
      );
    } else {
      return res
        .status(400)
        .json({ passwordincorrect: "Password incorrect" });
    }
  });
});


// Get all users
router.get("/", (req, res) => {
  User.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => console.log(err));
});

// Get a specific user by ID
router.get("/:id", (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      res.json(user);
    })
    .catch(err => console.log(err));
});

router.post("/", (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    Pole: req.body.Pole,
    role: req.body.role
  });

  newUser
    .save()
    .then(user => {
      // Create a new profile for the user
      const newProfile = new Profile({
        user: user._id, // Assign the user's ID to the profile
        // Add any other profile fields you want to set initially
      });

      newProfile
        .save()
        .then(profile => {
          res.json({
            user: user,
            profile: profile
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

// Update a user by ID
router.put("/:id", (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      user.name = req.body.name;
      user.email = req.body.email;
      user.Pole = req.body.Pole;
      user.role = req.body.role;
      user.password = req.body.password;

      user
        .save()
        .then(() => res.json(user))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

// Delete a user by ID
router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => console.log(err));
});



module.exports = router;