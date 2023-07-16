#!/usr/bin/env node
const sql_driver = require('./MysqlDriver');

sql_driver.fetchLatest(function(res){
  for (let i = 0; i<5; i++){
    console.log(res[i][0], res[i][1]);
  }
})
