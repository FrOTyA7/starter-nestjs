/**
 * trzsz: https://github.com/trzsz/trzsz.js
 * Copyright(c) 2022 Lonny Wong <lonnywong@qq.com>
 * @license MIT
 */

const os = require("os");
console.log(7)
const { spawn } = require("child_process");
const express = require("express");
const base64js = require("base64-js");

const app = express();
require("express-ws")(app);

app.use(express.static("public"));

app.get("/is_win", function (req, res) {
  res.send(os.platform() === "win32");
});

app.ws("/ws/shell", function (ws, req) {
  console.log("create shell");

  const cmd = os.platform() === "win32" ? "powershell.exe" : "bash";
  const shell = spawn(cmd, []);
  shell.stdout.on("data", (data) => ws.send(data.toString()));
  ws.on("message", (message) => {
    data = JSON.parse(message);
    if (data.input) {
      shell.stdin.write(data.input.replaceAll('\r', '\n'));
    } else if (data.binary) {
      shell.stdin.write(base64js.toByteArray(data.binary));
    } else if (data.cols && data.rows) {
      console.log(`resize shell: cols=${data.cols}, rows=${data.rows}`);
      // shell.resize(data.cols, data.rows);
    }
  });

  ws.on("close", () => {
    console.log("close shell");
    //shell.destroy();
  });
});

const port = process.env.PORT || 8083;
app.listen(port, "127.0.0.1", function () {
  console.log(`Started at http://localhost:${port}`);
});
