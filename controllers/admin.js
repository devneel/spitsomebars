const User = require('../models/User');
const dateFormat = require('dateformat');

/**
 * GET admin
 * Admin overview page.
 */
exports.getAdminOverview = (req, res, next) => {

// get all users

  User
    .find({})
    .exec((err, users) => {
      if (err) { return next(err); }
      console.log(users)
      var dateString = "ddd, mmm/dd/yy h:MM tt";



      users = users.map(function(item) {
        return {
          'rappaname' : item.rappaname,
          'email' : item.email,
          'portfolio' : item.portfolio,
          'createdAt' : dateFormat(item.createdAt, dateString),
          'lastLoggedIn' : dateFormat(item.lastLoggedIn, dateString),
          'updatedAt' : dateFormat(item.updatedAt, dateString)
        };
      });

      console.log(users)
      res.render('admin/user-overview', {
        users: users
      });
    });
};
