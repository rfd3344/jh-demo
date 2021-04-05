'use strict';
var httpStatus = require('../common/httpStatus');

exports.allowOnly = function(accessLevel, callback) {
    function checkUserRole(req, res) {
        if(!(accessLevel & req.user.role_id)) {
            res.status(httpStatus.FORBIDDEN).json({ message: 'Execute access forbidden' })
            return;
        }
        callback(req, res);
    }

    return checkUserRole;
};