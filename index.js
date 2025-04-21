const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const userRoutes = require("./routes/user.routes");
const ticketRoutes = require("./routes/ticket.routes");
require("dotenv").config();

const allowedOrigins = [
  "https://banking-desk.vercel.app",
  "https://banking-help-desk-website.vercel.app",
  "https://securetech-bizzkonn.online",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/", userRoutes);
app.use("/", ticketRoutes);

app.get("*", (req, res) => {
  res.send("Server is Running...");
});

app.listen(process.env.PORT_NUMBER || 3000, () => {
  console.log(
    `⚙️  Server is running at port --> http://localhost:${process.env.PORT_NUMBER}`
  );
});
