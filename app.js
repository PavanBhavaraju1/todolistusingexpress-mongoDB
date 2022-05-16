const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ =require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://PavanBhavaraju:Hanuman-11@cluster0.5ys8h.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Welcome to do list"
});

const item2 = new Item({
  name: "Hit the '+' button to add an item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name:String,
  items: [itemsSchema]
});

const List = mongoose.model("list",listSchema);

var day = date.getdate();

app.get("/", function(req, res) {



  Item.find({}, function(err, founditems) {

    if (founditems.length===0){

      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("error");
        } else {
          console.log("successfully inserted");
        }
      });
      res.redirect("/");

    } else {
      res.render("list", {
        ListTitle: day,
        newlistItems: founditems
      });
    }
  });
});

app.get("/:customlistname",function(req,res){
  const customListname = _.capitalize(req.params.customlistname);
    List.findOne({name :customListname}, function(err, foundList) {
      if(!err){
        if(!foundList){

          const list = new List({
            name: customListname,
            items : defaultItems
          });
          list.save();
          res.redirect("/"+ customListname);
        }else{

          res.render("list", {
            ListTitle: foundList.name,
            newlistItems: foundList.items
          });
        }
        }
      });
    });



app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.List;

  const item = new Item({
    name: itemName
  });
  if (listName === day){
    item.save();
    res.redirect("/");
  }else{
      List.findOne({name :listName}, function(err, foundList) {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });

}

});

app.post("/delete",function(req,res){
  const checkedItemid =req.body.checkbox;
  const listName = req.body.listName;
  if(listName=== day){
  Item.findByIdAndRemove(checkedItemid,function(err){
if(!err){
  console.log("successfully deleted");
}
});
  res.redirect("/");
}else{
List.findOneAndUpdate({name :listName}, {$pull:{items:{_id:checkedItemid}}} ,function(err,foundList){
  if (!err){
    res.redirect("/" +listName);
  }
});

}

});



app.listen(3000, function() {
  console.log("server started running ");
});
