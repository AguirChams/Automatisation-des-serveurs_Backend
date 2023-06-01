const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport"); 
const multer = require('multer');

// load validation
const validateProfileInput = require("../../validation/profile");

// import profile model
const Profile = require("../../models/Profile");

// import user model
const User = require("../../models/User");


// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// File filter for image upload
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });





// Get current user profile
// @access: private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "imgUrl"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// GET api/profile/all
// Get all profiles
// @access public
router.get("/all", (req, res) => {
  Profile.find()
    .populate("user", ["name", "imgUrl"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "There are no profiles" }));
});

// GET api/profile/user/:user_id
// Get profile by user ID
// @access public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "imgUrl"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

// create or edit user profile
// @access private

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // check validation
    if (!isValid) {
      // return 400
      return res.status(400).json(errors);
    }

    // get profile fields
    const profileFields = {};
    let http = 'http://';
    profileFields.user = req.user.id;
    if (req.body.server_ip) profileFields.server_ip = req.body.server_ip;
    if (req.body.key) profileFields.key = req.body.key;
    if (req.body.root) profileFields.root = req.body.root;
    if (req.body.username) profileFields.username = req.body.username;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        // update profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
          .then((profile) => {
            if (req.file) {
              profile.imgUrl = req.file.path;
              profile.save().then((profile) => res.json(profile));
            } else {
              res.json(profile);
            }
          })
        
          .catch((err) => {
            console.log(err);
            res.status(500).json({ error: 'Error updating profile' });
          });
      } else {
        // create profile

        // check if server_ip exists
        Profile.findOne({ server_ip: profileFields.server_ip }).then((profile) => {
          if (profile) {
            errors.server_ip = 'server_ip already in use';
            res.status(400).json(errors);
          } else {
            // save profile
            new Profile(profileFields)
              .save()
              .then((profile) => {
                if (req.file) {
                  profile.imgUrl = req.file.path;
                  profile.save().then((profile) => res.json(profile));
                } else {
                  res.json(profile);
                }
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ error: 'Error creating profile' });
              });
          }
        });
      }
    });
  }
);


// Upload photo
// @access private
router.post(
  '/upload',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  (req, res) => {
    if (req.file) {
      // Save the image path in the database
      Profile.findOne({ user: req.user.id })
        .then((profile) => {
          profile.imgUrl = req.file.path;
          profile.save().then((savedProfile) => {
            res.json(savedProfile);
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: 'Error updating profile' });
        });
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  }
);


router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);
module.exports = router;