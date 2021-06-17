const { cloudinary } = require('../cloudinary');
const Campground=require('../models/campground');
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN; 
const geocoder=mbxGeocoding({accessToken:mapBoxToken});

module.exports.index=async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
}

module.exports.postCampground=async (req,res)=>{
    const geodata=await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    const camp=new Campground(req.body);
    camp.geometry=geodata.body.features[0].geometry;
    camp.images=req.files.map(f=>({url:f.path,filename:f.filename}));
    camp.author=req.user._id;
    await camp.save();
    req.flash('success','Successfully posted a new campground');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.renderCampground=async (req,res)=>{
    try{
        const id=req.params.id;
        const camp=await Campground.findById(id).populate({
            path:'reviews',
            populate:{
                path:'author'
            }
        }).populate('author');
        if (!camp) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show',{camp});
    }
    catch(e){
        req.flash('error',`Campground not found: ${e}`);
        res.redirect('/campgrounds');
    }
}

module.exports.renderEditForm=async (req,res)=>{
    const id=req.params.id;
    const camp=await Campground.findById(id);
    if(!camp){
        req.flash('error','campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
}

module.exports.putEdit=async (req,res)=>{
    const id=req.params.id;
    const camp=await Campground.findByIdAndUpdate(id,{...req.body});
    const geodata=await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    camp.geometry=geodata.body.features[0].geometry;
    const img=req.files.map(f=>({url:f.path,filename:f.filename}));
    camp.images.push(...img);
    await camp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success','Campground successfully updated');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground=async (req,res)=>{
    const id=req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Campground successfully deleted');
    res.redirect('/campgrounds');
}