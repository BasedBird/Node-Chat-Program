var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "3240",
  database: "test"

});
var d = new Date();

function insertMessage(user, content, id){
  q = "";
  d = new Date();
  var dt = d.getUTCFullYear() + "-" + (d.getUTCMonth()+1) + "-" + d.getUTCDate() + " " +
      d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds() + "." +
      d.getUTCMilliseconds();
  q += "'" + user + "',";
  q += "'" + dt + "',";
  q += "'" + content + "',";
  q += id.toString();
  con.query("INSERT INTO chat_test values(" + q + ")", function (err, result, fields) {
    if (err) throw err;
    console.log(user, "insert success");
  });
}

const fetchLatest = function(callback) {
  con.query("SELECT * FROM chat_test ORDER BY datetime DESC LIMIT 20", (err, result, fields) => {
    if (err) reject(err);
    return callback(parseResult(result));
  });
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
    ret.push([temp.username, temp.content]);
  }
  return ret;
}

exports.test = test;
exports.insertMessage = insertMessage;
exports.fetchLatest = fetchLatest;
