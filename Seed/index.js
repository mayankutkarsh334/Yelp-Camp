const Campground=require('../models/campground');
const Review=require('../models/review');
const User=require('../models/user')
const cities = require('./cities');
const {descriptors,places}=require('./seed_helper');
const mongoose=require('mongoose');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

const sample=array=>array[Math.floor(Math.random()*array.length)];

const seedDB=async ()=>{
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for(let i=0;i<300;i++){
        const rnd=Math.floor(Math.random()*1000);
        const camp=new Campground({
            location:`${cities[rnd].city}, ${cities[rnd].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam eos sint error dolorem, cupiditate, cum similique culpa voluptatibus molestiae corporis rem debitis consectetur voluptas officia ad! Maiores dolorem ducimus tempora.',
            price:0.00,
            author:'60bc7f6de84e692810fb0254',
            geometry : { 
              type : "Point",
              coordinates : [ cities[rnd].longitude,cities[rnd].latitude ]
            },
            images: [
              {
                url: 'https://res.cloudinary.com/de7ngrcie/image/upload/v1623165260/Yelp-Camp/x46rvp0vvalssgjrnayn.jpg',
                filename: 'Yelp-Camp/x46rvp0vvalssgjrnayn'
              },
              {
                url: 'https://res.cloudinary.com/de7ngrcie/image/upload/v1623165264/Yelp-Camp/snvk1cf5jzcnanalobmt.jpg',
                filename: 'Yelp-Camp/snvk1cf5jzcnanalobmt'
              },
              {
                url: 'https://res.cloudinary.com/de7ngrcie/image/upload/v1623167067/Yelp-Camp/zsyipzmnq5mvljcfmk52.jpg',
                filename: 'Yelp-Camp/zsyipzmnq5mvljcfmk52'
              }
            ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})
