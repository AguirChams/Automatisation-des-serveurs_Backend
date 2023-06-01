const express = require('express');
const router = express.Router();
const Server = require('../../models/Server');

router.post('/add', async (req, res) => {
  try {
    const { node, ansible_host, ansible_user, ansible_python_interpreter } = req.body;

    const server = new Server({
      node,
      ansible_host,
      ansible_user,
      ansible_python_interpreter
    });

    await server.save();
    res.status(201).send(server);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/edit/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['node', 'ansible_host', 'ansible_user', 'ansible_python_interpreter'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const _id = req.params.id;
    const server = await Server.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!server) {
      return res.status(404).send();
    }

    res.send(server);
  } catch (error) {
    res.status(400).send(error);
  }
});


router.get('/get', async (req, res) => {
  try {
    const server = await Server.find({});
    res.send(server);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Define the endpoint for fetching a single configuration data by id
router.get('/get/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const server = await Server.findById(_id);

    if (!server) {
      return res.status(404).send();
    }

    res.send(server);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Define the endpoint for updating a configuration data by id
router.patch('/patch/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['node', 'ansible_host', 'ansible_user', 'ansible_python_interpreter'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const _id = req.params.id;
    const server = await Server.findById(_id);

    if (!server) {
      return res.status(404).send();
    }

    updates.forEach(update => (server[update] = req.body[update]));
    await server.save();
    res.send(server);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Define the endpoint for deleting a configuration data by id
router.delete('/delete/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const server = await Server.findByIdAndDelete(_id);

    if (!server) {
      return res.status(404).send();
    }

    res.send(server);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
