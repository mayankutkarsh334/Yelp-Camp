const mongoose=require('mongoose');
const Review=require('./review.js');
const { cloudinary } = require('../cloudinary');
const Schema=mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const imageSchema=new Schema({
    url:String,
    filename:String
});

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
})

const CampgroundSchema=new Schema({
    title:String,
    price:Number,
    images:[imageSchema],
    description:String,
    location:String,
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
            <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete',async (doc)=>{
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
        console.log(doc.images);
        for(let img of doc.images){
            console.log(img.filename);
            await cloudinary.uploader.destroy(img.filename);
        }
    }
});

module.exports=mongoose.model('Campground',CampgroundSchema);