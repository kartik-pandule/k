var express = require('express');
var app = express();
app.get('/',function(req,res){
    res.send("hello world kshviushvyjzb");
});

app.listen(3000,function(){
    console.log("server started...");
});