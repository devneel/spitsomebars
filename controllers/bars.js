/**
 * GET /bars
 * List all bars from all users.
 */
const Bars = require('../models/Bars.js');
const mongoose = require('mongoose');

//get bars across whole site
exports.getAllBars = (req, res) => {
  Bars.find({}).populate('author').sort('-createdOn').exec( function (err, bars)  {
    console.log("Loaded " + bars.length + " bars")
    bars.forEach(function(theBar) {

      if(req.user) {
          theBar.thisUserVoted = theBar.voted(req.user._id) == true ? 1 : 0
      }

      theBar.numUpVotes = theBar.upvotes();
    });

    //sort bars by number of upvotes
    bars.sort(function(a, b){
      return b.numUpVotes-a.numUpVotes
    })

    res.render('bars/viewBars', { bars: bars });
  });
};

// get bars for logged in user
exports.getMyBars = (req, res) => {
  Bars.find({author : req.user._id}).populate('author').sort('-createdOn').exec( function (err, bars)  {
    console.log("Loaded " + bars.length + " bars")
    res.render('bars/myBars', { bars: bars });
  });
};

// get bars for a rappa by id
exports.getBarsForThisRappa = (req, res) => {
  var oembetter = require('oembetter')();
  oembetter.whitelist(oembetter.suggestedWhitelist);

  var id = req.params.id != null ? req.params.id : req.user._id
  console.log("ID is " + id)

  Bars.find({author: id}).populate('author').sort('-createdOn').exec( function (err, bars)  {
    if(err) throw err;

    // see if this user voted, and capture upvotes for each bar
    bars.forEach(function(theBar) {

      if(req.user) {
          theBar.thisUserVoted = theBar.voted(req.user._id) == true ? 1 : 0
      }

      theBar.numUpVotes = theBar.upvotes();
    });

    //sort bars by number of upvotes
    bars.sort(function(a, b){
      return b.numUpVotes-a.numUpVotes
    })
    console.log("bars are " + bars)
    var portfolioLink = bars[0].author.portfolio || null;
    if(portfolioLink) {
      console.log("In the portfolio link")
      oembetter.fetch(portfolioLink, function(err, response) {
        if (!err) {
          // response.html contains markup to embed the video or
          // whatever it might be
          bars[0].author.portfolio = response.html
          res.render('bars/viewThisRappaBars', {bars: bars})
        }
      });
    } else {
      res.render('bars/viewThisRappaBars', {bars: bars})
    }
  });
};

// set bars page
exports.spitBars = (req, res) => {

  var justSubmittedid = req.query.id;
  if(justSubmittedid) {
    Bars.find({_id: justSubmittedid}).populate('author').exec( function(err, bars) {
      if(err) throw err;
      console.log("Just spit these:")
      console.log(bars);
      res.render('bars/spitBars', { bars: bars });
    })}
  else {
      res.render('bars/spitBars');
  }
};


// post set bars
exports.postBars = (req, res) => {
  var b = new Bars({
      bars: req.body.bars,
      author: req.body.author_id || null,
      anon_author: req.body.anon_author || null
  });

  b.save(function(err) {
      if (err)
         throw err;
      else {
         console.log('Saved bars successfully');
         if(req.user) {
            req.flash('success', { msg: 'Bars submitted yo. Thanks ' + req.user.rappaname + ' we love u ❤️' })
         } else {
           req.flash('success', { msg: 'Bars submitted yo' })
         }

         res.redirect('/spit-bars/?id=' + b._id)
      }
  });

};


// get edit bars
exports.editBars = (req, res) => {

  var toEditid = req.query.id;
    Bars.findById(toEditid).populate('author').exec( function(err, docs) {
      if(err) throw err;
      console.log(docs);
      res.render('bars/editBars', { theBar: docs });
    })
};


// post edit bars
exports.submitEdittedBars = (req, res) => {
  Bars.findById(req.body.id, function(err, updatedBars) {

    updatedBars.bars = req.body.bars;
    updatedBars.updatedOn = Date.now();

    updatedBars.save(function(err) {
        if (err)
           throw err;
        else {
           console.log('Updated bars successfully');
           req.flash('success', { msg: 'Bars updated yo. Thanks ' + req.user.rappaname + ' you a pretty cool person 👍' })
           res.redirect('/edit-bars/?id=' + updatedBars._id)
        }
    });
  });

};

// delete bars
exports.deleteBars = (req, res) => {
  var mongoose = require('mongoose');
  var id = req.body.id;
  Bars.findByIdAndRemove(new mongoose.mongo.ObjectID(id), function (err, deletedBars) {
     if (err) {
       throw err;
     }
     else {
       console.log('Deleted bars successfully');
       console.log(deletedBars)
       req.flash('success', { msg: 'Gone with dese bars: ' + deletedBars.bars })
       res.redirect('/')
     }
   });
};

// vote on a bar
exports.submitJudgement = (req, res) => {
  // judgement data comes in from ajax post: judgement: { id: data.id, up: data.upvoted, down: data.downvoted, star: data.starred }
  Bars.findById(req.body.id, function(err, barsWithUpdatedJudgement) {

    var voterID = req.user.id
    //user has upvoted
    if(req.body.up == 'true') {
      barsWithUpdatedJudgement.upvote(voterID, function(err, doc) {
        console.log("Post voted up!")
      });
    } else if(req.body.up == 'false') {
      barsWithUpdatedJudgement.unvote(voterID, function(err, doc) {
        console.log("Post unvoted!")
      });
    }
  });
};
