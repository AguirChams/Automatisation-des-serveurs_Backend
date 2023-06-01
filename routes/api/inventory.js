const express = require('express');
const router = express.Router();
const Inventory = require('../../models/Inventory');
const Server = require('../../models/Server');
const util = require('util');
const fs = require('fs');
// Define the endpoint for creating a new inventory
router.post('/addInventory', async (req, res) => {
  try {
    const { ansible_host } = req.body;
    const inventory = new Inventory({
      ansible_host
    });
    await inventory.save();
    res.status(201).send({ message: `Inventory created for ansible_host: ${ansible_host}` }); 
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/getData/:hosts', async (req, res) => {
  try {
    const { hosts } = req.params;
    const ansibleHosts = hosts.split(',').map((h) => h.trim());
    const data = await Server.find({ ansible_host: { $in: ansibleHosts } });
    if (!data || data.length === 0) {
      return res.status(404).json({ message: `No data found for hosts: ${hosts}` });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/executeInventory', async (req, res) => {
  try {
    const { ansible_host } = req.body;

    if (!ansible_host) {
      return res.status(400).json({ message: 'No ansible_host value provided' });
    }

    const hosts = ansible_host.split(',').map((s) => s.trim()); 

    const data = await Server.find({ ansible_host: { $in: hosts } }); 

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified hosts' });
    }

    const inventoryFilePath = '/home/aguirchams/ansible/inventory.ini';
    let fileContent = '';
    data.forEach((d) => {
      const { node, ansible_host, ansible_user } = d;
      fileContent += `${node} ansible_host=${ansible_host} ansible_user=${ansible_user} \n`;
    });


    // Generate script content
    const inventoryContent = 
      `[node]\n` +
      `${fileContent}` +
      `[all:vars]\n` +
      `ansible_python_interpreter=/usr/bin/python3\n`;

    // Write script file
    fs.writeFileSync(inventoryFilePath, inventoryContent);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
