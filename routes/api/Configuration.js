const express = require('express');
const router = express.Router();
const Configadmin = require('../../models/Configadmin');
const Configuser = require('../../models/Configuser');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const AdminUser = require('../../models/User');
const amqp = require('amqplib/callback_api');
const UserUser = require('../../models/User');

router.get('/admin-users', async (req, res) => {
  try {
    const adminUser = await AdminUser.find();
    res.json(adminUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/user-users', async (req, res) => {
    try {
      const userUser = await UserUser.find();
      res.json(userUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

  router.post('/addconfiguser', async (req, res) => {
    const { user, password } = req.body;
    try {
    const configuser = new Configuser({
        user,
        password
      });
      const savedconfiguser = await configuser.save();
      res.json(savedconfiguser);
    } catch (error) {
      console.error(error);
      res.status(400).send(error);
    }
  });  

// Route to update an admin script
router.post('/addconfigadmin', async (req, res) => {
  const { grafana_admin_user, grafana_admin_password } = req.body;
  try {
    const configadmin = new Configadmin({
      grafana_admin_user,
      grafana_admin_password
    });
    const savedconfigadmin = await configadmin.save();
    res.json(savedconfigadmin);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});


router.get('/getconfigadmin', async (req, res) => {
    try {
      const configadmins = await Configadmin.find();
      res.json(configadmins);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

  router.get('/getconfigadmin/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const configadmin = await Configadmin.findById(id);
      if (!configadmin) {
        return res.status(404).json({ message: 'Configadmin not found' });
      }
      res.json(configadmin);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  // Update a configuration admin by ID
  router.put('/updateconfigadmin/:id', async (req, res) => {
    const { id } = req.params;
    const { grafana_admin_user, grafana_admin_password } = req.body;
    try {
      const configadmin = await Configadmin.findByIdAndUpdate(
        id,
        {
          grafana_admin_user,
          grafana_admin_password
        },
        { new: true }
      );
      if (!configadmin) {
        return res.status(404).json({ message: 'Configadmin not found' });
      }
      res.json(configadmin);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  // Delete a configuration admin by ID
  router.delete('/deleteconfigadmin/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const configadmin = await Configadmin.findByIdAndDelete(id);
      if (!configadmin) {
        return res.status(404).json({ message: 'Configadmin not found' });
      }
      res.json({ message: 'Configadmin deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

  // Get all configuration users
router.get('/getconfiguser', async (req, res) => {
    try {
      const configusers = await Configuser.find();
      res.json(configusers);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  // Get a single configuration user by ID
  router.get('/getconfiguser/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const configuser = await Configuser.findById(id);
      if (!configuser) {
        return res.status(404).json({ message: 'Configuser not found' });
      }
      res.json(configuser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  // Update a configuration user by ID
  router.put('/updateconfiguser/:id', async (req, res) => {
    const { id } = req.params;
    const { user, password } = req.body;
    try {
      const configuser = await Configuser.findByIdAndUpdate(
        id,
        {
          user,
          password
        },
        { new: true }
      );
      if (!configuser) {
        return res.status(404).json({ message: 'Configuser not found' });
      }
      res.json(configuser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  // Delete a configuration user by ID
  router.delete('/deleteconfiguser/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const configuser = await Configuser.findByIdAndDelete(id);
      if (!configuser) {
        return res.status(404).json({ message: 'Configuser not found' });
      }
      res.json({ message: 'Configuser deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  

  module.exports = router;
  