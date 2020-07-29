const express = require(`express`);
const bodyParser = require(`body-parser`);

const app = express();

let listOfTasks = ['Buy food', 'Cook food', 'Eat food'];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))

app.get('/', function(req, res) {
  let today = new Date();

  let options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };

  let day = today.toLocaleDateString('en-US', options);

  res.render('list', {
    kindOfDay: day,
    newListItems: listOfTasks
  })
})

app.post('/', function(req, res) {
  let newTask = req.body.newItem;
  listOfTasks.push(newTask);
  res.redirect('/');
  // res.render('list', {
  //   listOfTasks: currentTasks
  // })
})

app.listen(3000, function() {
  console.log(`Server is running on port 3000`);
})
