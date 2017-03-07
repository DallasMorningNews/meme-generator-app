'use strict';

module.exports = function(db, cb){

	db.define("builders", {
		id : {type: 'serial', key:true},
		name: String,
		tags: String,
		date: String,
		author: String,
		head: String,
		intro: String,
		desk: String,
		images: String,
	});

	return cb();

}
