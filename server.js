const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/api/users");
const User = require("./models/User");
const app = express();
const keys = require("./config/keys");
const path = require('path');
const configRouter = require("./routes/api/config");
const scripts = require("./routes/api/access");
const Access = require("./models/Access");
const cors = require("cors");
const sendEmail = require("./utils/sendEmail");
const dotenv = require("dotenv").config();
const fs = require('fs');
const inventory = require("./models/Inventory");
const Inventory = require("./routes/api/inventory");
const Server = require('./models/Server');
const remove = require("./routes/api/remove");
const certbotnginx = require("./routes/api/certbotnginx");
const certbotapache = require("./routes/api/certbotapache");
const server = require('./routes/api/server');
const fail2ban = require('./routes/api/fail2ban');
const ufw = require('./routes/api/ufw');
const profile = require('./routes/api/profile');
const kafka = require('./routes/api/kafka');
const jenkins = require('./routes/api/jenkins');
const kubernetes = require('./routes/api/kubernetes');
const mysql = require('./routes/api/mysql');
const mongo = require('./routes/api/mongodb');
const postgres = require('./routes/api/postgres');
const backup_mysql = require('./routes/api/backup_mysql_datbase');
const backup_project = require('./routes/api/project');
const modsecurity = require('./routes/api/modsecurity');
const access = require('./routes/api/access');
const php = require('./routes/api/php');
const java = require('./routes/api/java');
const git = require('./routes/api//git');
const docker = require('./routes/api/docker');
const apache = require('./routes/api/apache');
const nginx = require('./routes/api/nginx');
const vm = require('./routes/api/vm');
const configuration = require('./routes/api/Configuration');
const monitoring = require('./routes/api/monitoring');
const Mongo_Install = require('./routes/api/mongo_install');
const Postgres_Install = require('./routes/api/Postgresql_Install');
const scriptPath = '/home/aguirchams/ansible/ansible-roles/standardiser_acces/access/tasks/script.sh';
const scriptPath1 = '/home/aguirchams/ansible/ansible-roles/standardiser_acces/remove/tasks/script.sh';
const multer = require("multer");


app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(cors());

const db = require("./config/keys").mongoURI;
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

app.use(passport.initialize());
require("./config/passport")(passport);

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

// Routes
app.use("/api/users", users);
app.use("/api/configs", configRouter);
app.use("/api/access", access);
app.use("/api/server", server);
app.use("/api/inventory", Inventory);
app.use("/api/remove",remove);
app.use("/api/fail2ban", fail2ban);
app.use("/api/ufw", ufw);
app.use("/api/profile", profile);
app.use("/api/profile", upload.single("file"));
app.use("/api/kafka", kafka);
app.use("/api/jenkins", jenkins);
app.use("/api/kubernetes", kubernetes);
app.use("/api/mysql", mysql);
app.use("/api/mongodb", mongo);
app.use("/api/backup_mysql", backup_mysql);
app.use("/api/postgres", postgres);
app.use("/api/backup_project", backup_project);
app.use("/api/modsecurity", modsecurity);
app.use("/api/php", php);
app.use("/api/java", java);
app.use("/api/git", git);
app.use("/api/docker", docker);
app.use("/api/apache", apache);
app.use("/api/nginx", nginx);
app.use("/api/certbotnginx", certbotnginx);
app.use("/api/certbotapache", certbotapache);
app.use("/api/virtualmachines", vm);
app.use("/api/configuration", configuration);
app.use("/api/monitoring", monitoring);
app.use("/api/Mongo_Install", Mongo_Install);
app.use("/api/Postgresql_Install", Postgres_Install);
//app.use("/api/queue", queue);
app.use('/uploads', express.static('uploads'));

app.post("/api/sendemail", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    const send_to = user.email;
    const send_from = process.env.EMAIL_USER; 
    const reply_to = user.email;
    const subject = "Your account details";

    const message = `
      <p>Your account details:</p>
      <ul>
        <li>Email: ${user.email}</li>
        <li>Password: ${req.body.password}</li>
      </ul>
      <p>Thank you for joining us!</p>
    `;
    await sendEmail(subject, message, send_to, send_from, reply_to);
    
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/grafanausers", async (req, res) => {
  const { user, password } = req.body;

  try {
    const User_user = await User.findOne({ name: user });
    if (!User_user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const send_to = User_user.email;
    const send_from = process.env.EMAIL_USER; 
    const reply_to = User_user.email;
    const subject = "Your account details";

    const message = `
      <h3>Hi,</h3>
      <p>Your account details:</p>
      <ul>
        <li>Email: ${User_user.user}</li>
        <li>Password: ${password}</li>
      </ul>
      <p>Thank you for joining us!</p>
    `;
    await sendEmail(subject, message, send_to, send_from, reply_to);
    
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post("/api/grafanaadmin", async (req, res) => {
  const { grafana_admin_user, grafana_admin_password, email  } = req.body;

  try {
    const user = await User.findOne({ name: grafana_admin_user });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const send_to = email;
    const send_from = process.env.EMAIL_USER;
    const reply_to = email;
    const subject = "Your account details";

    const message = `
      <p>Your Grafana account details:</p>
      <ul>
        <li>Username: ${grafana_admin_user}</li>
        <li>Password: ${grafana_admin_password}</li>
      </ul>
      <p>Thank you for joining us!</p>
    `;

    await sendEmail(subject, message, send_to, send_from, reply_to);

    res.status(200).json({ success: true, message: "Email sent" });
  }catch (error) {
     res.status(500).json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server up and running on port ${port} !`));