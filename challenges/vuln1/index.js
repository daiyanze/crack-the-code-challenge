import express from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import _ from "lodash";
import "dotenv/config";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_DIR = "uploads/";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./static/index.html"));
});

app.post("/json", (req, res) => {
  console.log(req.body);

  try {
    let parsed = _.merge(
      { watermark: "by secure json team!" },
      JSON.parse(req.body.input)
    );
    const writePath = path.normalize(`${FILE_DIR}${req.body.filename}`);
    if (!writePath.startsWith(FILE_DIR)) {
      return res.send("Invalid path");
    }
    fs.writeFileSync(writePath, JSON.stringify(parsed), "utf-8");
    return res.send(JSON.stringify(parsed));
  } catch (e) {
    console.log(e.message);
    return res.send("Check your JSON input");
  }
});

app.post("/read", (req, res) => {
  console.log(req.body);
  res.send(fs.readFileSync(`${FILE_DIR}${req.body.filename}`, "utf-8"));
});

app.post("/login", (req, res) => {
  const user = {
    // just pretend this comes from a db
    password: "$2a$12$3cSdZFdEIG9FizllB9.5E.M8DTQQ185zyITtBTBz7Lz3Va8s0xjSy",
  };

  let passed = false;
  switch (user.auth_method ?? "bcrypt") {
    case "bcrypt":
      passed = bcrypt.compareSync(req.body.password, user.password);
      break;
    case "superadmin":
      passed = req.body.password === process.env.SUPER_ADMIN_PASS;
      break;
    default:
      throw new Error("invaid auth method");
  }

  return res.send(passed ? "flag" : "wrong!");
});

app.listen(81, () => console.log("Started on http://localhost:81"));
