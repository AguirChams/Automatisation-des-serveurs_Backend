const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Config = require('../../models/Config');

// Define the endpoint for creating a new configuration data
router.post('/add', async (req, res) => {
  try {
    const { admin_username, admin_password } = req.body;
    const hashedPassword = await bcrypt.hash(admin_password, 10);

    const config = new Config({
      admin_username,
      admin_password: hashedPassword,
    });

    await config.save();
    res.status(201).send(config);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Define the endpoint for fetching all configuration data
router.get('/get', async (req, res) => {
  try {
    const configs = await Config.find({});
    res.send(configs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Define the endpoint for fetching a single configuration data by id
router.get('/get/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const config = await Config.findById(_id);

    if (!config) {
      return res.status(404).send();
    }

    res.send(config);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Define the endpoint for updating a configuration data by id
router.patch('/patch/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['admin_username', 'admin_password'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const _id = req.params.id;
    const config = await Config.findById(_id);

    if (!config) {
      return res.status(404).send();
    }

    updates.forEach(update => (config[update] = req.body[update]));
    await config.save();
    res.send(config);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Define the endpoint for deleting a configuration data by id
router.delete('/delete/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const config = await Config.findByIdAndDelete(_id);

    if (!config) {
      return res.status(404).send();
    }

    res.send(config);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

	
