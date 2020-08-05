const express = require('express');
const bodyParser = require('body-parser');
// const date = require(__dirname + '/date.js');
const securityData = require(__dirname + '/mongoDB-security-data.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb+srv://admin-arseniy:${securityData.password}@cluster0.kwkdp.mongodb.net/todolistDB?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsSchema = new mongoose.Schema({
  name: String
});
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema)

const item1 = new Item({
  name: 'Welcome to your todolist!'
})
const item2 = new Item({
  name: 'Hit the + button to add a new item'
})
const item3 = new Item({
  name: '<-- Hit this to delete an item'
})

const defaultItems = [item1, item2, item3];


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'))

app.get('/', function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.error(err)
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Inserted successfully!");
          }
        })
        res.redirect('/')
      } else {
        res.render('list', {
          listTitle: 'Today',
          newListItems: foundItems
        })
      }
    }
  })
})

app.get('/:listName', function(req, res) {
  const customListName = _.capitalize(req.params.listName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (err) {
      console.log(err);
    } else {
      if (foundList) {
        res.render('list', {
          listTitle: customListName,
          newListItems: foundList.items
        })
      } else if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect('/' + customListName)
      }
    }
  })
})

app.post('/', function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const addedItem = new Item({
    name: itemName
  })

  if (listName === 'Today') {
    addedItem.save();
    res.redirect('/');
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(addedItem);
        foundList.save();
        res.redirect('/' + listName)
      }
    })
  }
})

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      }
    })
    res.redirect('/')
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: { _id: checkedItemId}}}, function(err, result) {
      if (!err) {
        res.redirect('/' + listName)
      }
    })
  }
})


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
