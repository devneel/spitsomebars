var BarsHelper = function(){};

//sort bars by number of upvotes
BarsHelper.prototype.sortByUpVotes = function(bars){
  bars.sort(function(a, b){
    return b.numUpVotes-a.numUpVotes
  })

  return bars;
}

// for each bar in the bars array, add the thisUserVoted (currently viewing user) property (true/false)
// and add the numUpVotes for that bar
BarsHelper.prototype.addThisUserVotedandNumUpVotesToEachBar = function(bars,user){

  bars.forEach(function(theBar) {

    if(user) {
        theBar.thisUserVoted = theBar.voted(user._id) == true ? 1 : 0
    }

    theBar.numUpVotes = theBar.upvotes();
  });
  return bars;
}

// combine top two functions for adding upvotes / thisUserVoted and then sorting bars by upvotes
BarsHelper.prototype.prepareBarsList = function(bars,user){

  bars = this.addThisUserVotedandNumUpVotesToEachBar(bars, user)

  bars = this.sortByUpVotes(bars)

  console.log("Loaded " + bars.length + " bars")

  return bars;
}


module.exports = BarsHelper;
