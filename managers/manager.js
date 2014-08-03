//manager


var db = require('../db/db');

var crypto = require('crypto');

var ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";
var ROLE_ADMIN = "ROLE_ADMIN";
var ROLE_AUTHOR = "ROLE_AUTHOR";
var ROLE_USER = "ROLE_USER";

var ACCESS_LEVEL_PUBLIC = "PUBLIC";
var ACCESS_LEVEL_USER = "USER";


exports.ROLE_SUPER_ADMIN = ROLE_SUPER_ADMIN;
exports.ROLE_ADMIN = ROLE_ADMIN;
exports.ROLE_AUTHOR = ROLE_AUTHOR;
exports.ROLE_USER = ROLE_USER;

exports.ACCESS_LEVEL_PUBLIC = ACCESS_LEVEL_PUBLIC;
exports.ACCESS_LEVEL_USER = ACCESS_LEVEL_USER;

hashPasswordSync =function(username, pw) {
    return crypto.pbkdf2Sync(pw, username, 250, 128).toString('base64');    
};

exports.hashPasswordSync = hashPasswordSync;

exports.hashPassword = function(username, pw, callback) {
    crypto.pbkdf2(pw, username, 250, 128, callback);
};

exports.securityCheck = function(obj) {
    var returnVal = true;
    if (obj !== undefined || obj !== null) { 
        var json = JSON.stringify(obj)
        var n = json.indexOf("function");
        if (n > -1) {
            console.log("Security Alert: " + json);
            returnVal = false;
        }
    }else{
        returnVal = false;
    }

    return returnVal;
};



exports.validateLanguage = function(id, callback){
    var Language = db.getLanguage();
        Language.findById(id, function(err, results) {
            console.log("varified language: " + JSON.stringify(results));
            if (!err && (results !== undefined && results !== null)) {
                callback(true);
            } else {
                callback(false);
            }
        });
};



exports.validateRole = function(id, callback){
    var returnVal = {
        "success": false,
        "id": "",
        "roleName" : ""
    };
    var Role = db.getRole();
        Role.findById(id, function(err, results) {
            console.log("varified role: " + JSON.stringify(results));
            if (!err && (results !== undefined && results !== null)) {
                returnVal.success = true;
                returnVal.id = results._id;
                returnVal.roleName = results.name;
                callback(returnVal);
            } else {
                callback(returnVal);
            }
        });
};

/*
exports.securityStringCheck = function(str) {
    var returnVal = true;
    if (str !== undefined || str !== null) {        
        var n = str.indexOf("function");
        if (n > -1) {
            console.log("Security Alert: " + json);
            returnVal = false;
        }
    }else{
        returnVal = false;
    }

    return returnVal;
};
*/
exports.generateFileUploadKey = function(username){
    return hashPasswordSync(username, getSalt(false));
};


function getSalt(shiftDown) {
    var returnVal;
    var oneHourMilli = 3600000;
    var month;
    var day;
    var year;
    var hour;
    var sead = "k44hhy3";
    if (shiftDown === true) {
        var today1 = new Date();
        var newTimeMilli = today1 - oneHourMilli;
        var newDate = new Date(newTimeMilli);
        month = newDate.getMonth() + 1;
        day = newDate.getDate() + 1;
        year = newDate.getFullYear();
        hour = newDate.getHours() + 1;

        /*
         Calendar cal = Calendar.getInstance();
         cal.add(Calendar.HOUR, -1);
         month = cal.get(Calendar.MONTH);
         day = cal.get(Calendar.DAY_OF_MONTH);
         year = cal.get(Calendar.YEAR);
         hour = cal.get(Calendar.HOUR);
         */
    } else {
        var today2 = new Date();
        month = today2.getMonth() + 1;
        day = today2.getDate() + 1;
        year = today2.getFullYear();
        hour = today2.getHours() + 1;
        /*
         Calendar cal = Calendar.getInstance();
         month = cal.get(Calendar.MONTH);
         day = cal.get(Calendar.DAY_OF_MONTH);
         year = cal.get(Calendar.YEAR);
         hour = cal.get(Calendar.HOUR);
         */
    }
    returnVal = sead + month + day + year + hour;

    return returnVal;
}