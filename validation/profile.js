const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.server_ip = !isEmpty(data.server_ip) ? data.server_ip : "";
  data.key = !isEmpty(data.key) ? data.key : "";
  data.root = !isEmpty(data.root) ? data.root : "";

  if (!Validator.isLength(data.server_ip, { min: 2, max: 30 })) {
    errors.server_ip = "server_ip needs to be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.server_ip)) {
    errors.server_ip = "Profile server_ip is required";
  }
  if (Validator.isEmpty(data.key)) {
    errors.key = "key field is required";
  }
  if (Validator.isEmpty(data.root)) {
    errors.root = "root field is required";
  }
 
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

