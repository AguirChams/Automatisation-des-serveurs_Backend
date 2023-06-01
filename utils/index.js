const eventUtilities = require('./eventUtilities');

module.exports = {
    eventUtilities,
    parseStringToBool: (str) => str == 'true'
};