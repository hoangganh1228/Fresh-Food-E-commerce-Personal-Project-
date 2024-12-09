const express = require("express");
const path = require('path');   
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const moment = require('moment');
const compression = require('compression');
const helmet = require('helmet');

const flash = require('express-flash');
require("dotenv").config();

const database = require("./config/database")
const systemConfig = require("./config/system")

const route = require("./routes/client/index.route")
const routeAdmin = require("./routes/admin/index.route")

database.connect();

const app = express();
const port = process.env.PORT;


app.use(express.static(`${__dirname}/public`));

app.use(methodOverride('_method'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.set("views", `${__dirname}//views`);
app.set("view engine", "pug");


// Tiny MCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
//End Tiny MCE

app.use(compression({
    threshold: 1024, // Chỉ nén các phản hồi lớn hơn 1KB
    level: 6,        // Nén với mức độ 6
    filter: (req, res) => {
      const contentType = res.getHeader('Content-Type');
      // Chỉ nén nếu nội dung là HTML, CSS, JS, hoặc JSON
      if (contentType && /text\/html|text\/css|application\/javascript|application\/json/.test(contentType)) {
        return true;
      }
      return false; // Bỏ qua nén cho các loại nội dung khác
    }
}));

// Helmet
app.use(helmet());
// End Helmet


// Flash

app.use(cookieParser('JHFJSBFJKSE'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());

// End Flash

app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;
// Routes
route(app);
routeAdmin(app);


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})

app.get("*", (req, res) => {
    res.render("client/pages/errors/404", {
        pageTitle: "404 Not Found",
    });
})