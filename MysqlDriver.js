var mysql = require('mysql');
const fs = require('fs');
const {createHash} = require('node:crypto');
var temp = [];
try {
  const data = fs.readFileSync('sql.txt');
  temp = data.toString().split('\n');
  for (str in temp) {
    temp[str] = temp[str].replace(/[\n\r]/g, '');
  }
} catch (err) {
  console.error(err);
}

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: temp[0],
  database: temp[1]
});
var d = new Date();

function insertMessage(user, id, content){
  let dt, hash, hashedID;
  q = "";
  d = new Date();
  dt = d.getUTCFullYear() + "-" + (d.getUTCMonth()+1) + "-" + d.getUTCDate() + " " +
      d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds() + "." +
      d.getUTCMilliseconds();
  hash = createHash('md5');
  hash.update(dt + id);
  hashedID = user + ':' + hash.digest('hex');
  q += "'" + user + "',";
  q += "'" + dt + "',";
  q += "'" + content + "',";
  q += "'" + hashedID + "'";
  con.query("INSERT INTO chat_test values(" + q + ")", function (err, result, fields) {
    if (err) throw err;
    console.log(user, "insert success");
  });
  return hashedID;
}

function fetchLatest() {
  var promise = new Promise( (resolve, reject) => {
    temp = con.query("SELECT * FROM chat_test ORDER BY datetime DESC LIMIT 20", (err, result, fields) => {
      if (err) reject(err);
      resolve(parseResult(result));
    });
  });
  return promise;
}

async function test(temp){
  while(true){
      var dt = d.getUTCFullYear() + "-" + (d.getUTCMonth()+1) + "-" + d.getUTCDate() + " " +
        d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds() + "." +
        d.getUTCMilliseconds() + " " + temp;
      console.log(dt);
      await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

function parseResult(res){
  const ret = new Array();
  for (let i = 0; i < res.length; i++){
    temp = res[i];
    ret.push([temp.username, temp.content, temp.id]);
  }
  return ret;
}

exports.test = test;
exports.insertMessage = insertMessage;
exports.fetchLatest = fetchLatest;
