const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },

    token : { 
        type: String,
         required:true
        },
});

const Token = mongoose.model("token", TokenSchema);
module.exports = Token;
