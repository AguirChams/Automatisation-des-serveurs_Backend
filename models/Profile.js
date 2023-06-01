const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const ProfilSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    server_ip: {
      type: String,
      required: true,
      default:"170.170.170.1"
    },

    key: {
      type: String,
      required: true,
      default:"key"
    },
    root: {
      type: String,
      required: true,
      default:"root"
    },
    username: {
      type: String,
      required: true,
      default:"Whoami"
    },
    imgUrl: {
      type: String,
      default:"https://digimedia.web.ua.pt/wp-content/uploads/2017/05/default-user-image.png",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("profil", ProfilSchema);

