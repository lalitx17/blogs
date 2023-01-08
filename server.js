const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

//cloudinary configuration
cloudinary.config({ 
    cloud_name: 'ddskth9s2', 
    api_key: '471433769291981', 
    api_secret: '5mafsLEJuDEblaNAc_KDY2GY--U',
    secure: true
  });


const DB = process.env.DATABASE_CONNECTION;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/reviews', express.static(path.join(__dirname, 'public')));
app.use('/content', express.static(path.join(__dirname, 'public')));




//connect the server with the database.
mongoose.connect(DB).then(() => {
    console.log("Connection Successful");
  }).catch((err) => console.log(err));


/* cloudinary.uploader
.upload("./public/images/lightbulb.png", {
    resource_type: "auto", folder: 'litwords'
})
.then((result) => {
    console.log("Success", JSON.stringify(result, null, 2));
})
.catch((error) => {
    console.log("error", JSON.stringify(error, null, 2));
}); */





const wordSchema = new mongoose.Schema({
  title: String,
  articleId: Number,
  content: [String],
  imageUrl: String,
  comments: [{name:String, email: String, body: String}]
});


//mongoose model
const Blog = new mongoose.model("Blog", wordSchema);

const BookReview = new mongoose.model("BookReview", wordSchema);

var numberOfBlogs = 0;
var oddBit = 0; 
var fullData = [];


app.get("/", (req,res) =>{
    Blog.find({}, function(err, foundBlogs){
        if(err){
            console.log(err);
        }else{
         numberOfBlogs = foundBlogs.length;
         fullData = foundBlogs;
        }
    });

    if (numberOfBlogs % 2 !== 0){
        numberOfBlogs -= 1;
        oddBit = 1; 
    }
    res.render("blog", {
        numberOfBlogs: numberOfBlogs,
        oddBit: oddBit,
        fullData: fullData
    });
});

/* REVIEW */


var fullReview = []
var oddReviewBit = 0
var numberOfReviews = 0;

app.get("/reviews", (req, res) =>{
    BookReview.find({}, function(err, foundReviews){
        if (err){
            console.log(err);
        }else{
            numberOfReviews = foundReviews.length;
            fullReview = foundReviews;
        }
    });
    if (numberOfReviews % 2 !== 0){
        numberOfReviews -= 1;
        oddReviewBit = 1; 
    }
    res.render("reviews", {
        numberOfBlogs: numberOfReviews,
        oddBit: oddReviewBit,
        fullData: fullReview
    });
});


app.get("/content/:blogNumber", (req, res) =>{
    var blogIndex = req.params.blogNumber;
    Blog.find({}, function(err, foundBlogs){
        if(err){
            console.log(err);
        }else{
         fullData = foundBlogs;
        }
    });
    res.render("content", {
        blogData: fullData[blogIndex],
        blogIndex: blogIndex,
        state: "blog"
    });
});


app.get("/reviews/:reviewNumber", (req, res) =>{
    var reviewIndex = req.params.reviewNumber;
    BookReview.find({}, function(err, foundBlogs){
        if(err){
            console.log(err);
        }else{
         fullReview = foundBlogs;
        }
    });
    res.render("content", {
        blogData: fullReview[reviewIndex],
        blogIndex: reviewIndex,
        state: "reviews"
    });
});


app.post("/commentSubmission/:state/:articleId", (req, res) =>{
    var articleNumber = req.params.articleId;
    var state = req.params.state;
    let name = req.body.personName;
    let email = req.body.personEmail;
    let body = req.body.personData;
    var comment = {
        name: name,
        email: email,
        body: body
    }
    if (state === "blog"){
        Blog.findOneAndUpdate({articleId: articleNumber},
            {$push: {comments: comment}},
            function(err, success){
                if(err){
                    console.log(err);
                } else{
                    let linkContent = "/content/"+articleNumber+"";
                    res.redirect(linkContent);
                }
            });
    } else if(state === "reviews"){
        BookReview.findOneAndUpdate({articleId: articleNumber},
            {$push: {comments: comment}},
            function(err, success){
                if(err){
                    console.log(err);
                } else{
                    let linkContent = "/reviews/"+articleNumber+"";
                    res.redirect(linkContent);
                }
            });       
    }
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
})


