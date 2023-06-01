const mongoose = require('mongoose');
const inventorySchema = new mongoose.Schema({
      /*node: {
        type: String,
      },*/
      ansible_host: {
        type: String,
      },
/*      ansible_user: {
        type: String,
      },
      ansible_python_interpreter: {
        type: String,
        default: '/usr/bin/python3',
        validate: {
          validator: function(v) {
            return v === '/usr/bin/python3';
          },
          message: props => `${props.value} is not a valid value for ansible_python_interpreter!`,
        },
      },*/
});
module.exports = mongoose.model('Inventory', inventorySchema);