// Crockford style object creation
function clone(obj)
{
	function F(){};
	F.prototype = obj;
	var result = new F();
	return result;
};

// Adds attributes from on object to another and returns it
function extend(obj, attrs)
{
	for (var name in attrs)
		obj[name] = attrs[name];
	return obj;
};

// Clone an object and extend it
function inherit(baseobj, attrs)
{
	return extend(clone(baseobj), attrs);
};

function bool(obj)
{
	for (var key in obj)
		return true;
	return false;
};

var Params =
{
	create: function()
	{
		var params = clone(this);
		var query = location.search.substr(1).split("&");
		for (var i = 0; i < query.length; ++i)
		{
			var item = query[i].split("=");
			params[item[0]] = item[1];
		}
		return params;
	}
}

function islist(obj)
{
	return Object.prototype.toString.call(obj) == "[object Array]";
}

function sorted(seq, cmp)
{
	var newlist = [];
	if (islist(seq))
	{
		for (var i = 0; i < seq.length; ++i)
			newlist.push(seq[i]);
	}
	else
	{
		for (var key in seq)
			newlist.push(key);
	}
	if (cmp)
		newlist.sort(cmp);
	else
		newlist.sort();
	return newlist;
}

var Event = {
	create: function(map_id, event_id)
	{
		var event = clone(this);
		event.map_id = map_id;
		event.event_id = event_id;
		event.names = {};
		event.ischest = event._ischest();
		event.start = new Date();
		event.state = null; // unknown
		return event;
	},

	addname: function(lang, name)
	{
		this.names[lang] = name;
	},

	setstate: function(newstate)
	{
		if (newstate != this.state)
		{
			this.state = newstate;
			this.start = new Date();
		}
	},

	html: function(lang)
	{
		var diff = (new Date()) - this.start;
		diff = Math.floor(diff/1000);
		var seconds = diff % 60;
		diff = Math.floor(diff/60);
		var minutes = diff % 60;
		diff = Math.floor(diff/60);
		var v = [];
		if (diff)
			v.push(diff + ":");
		if (minutes < 10)
			v.push("0");
		v.push(minutes + ":");
		if (seconds < 10)
			v.push("0");
		v.push(seconds + "");
		return "<p id='event-" + this.event_id + "' class='event " + this.state + "'>[" + v.join("") + "] " + this.names[lang] + "</p>";
	},

	show: function(type)
	{
		if (type == "active")
			return (this.state == "Active" || this.state == "Preparation");
		else if (type == "chest")
			return this.ischest;
		else if (type == "chestactive")
			return this.ischest && (this.state == "Active" || this.state == "Preparation");
		else
			return true;
	},

	_ischest: function()
	{
		var chestevents = [
			"568A30CF-8512-462F-9D67-647D69BEFAED", // Tequatl
			"C876757A-EF3E-4FBE-A484-07FF790D9B05", // Megazerstörer
			"9AA133DC-F630-4A0E-BB5D-EE34A2B306C2", // Inquestur-Golem
			"2C833C11-5CD5-4D96-A4CE-A74C04C9A278", // Feuerelementar
			"5E4E9CD9-DD7C-49DB-8392-C99E1EF4E7DF", //
			"33F76E9E-0BB6-46D0-A3A9-BE4CDFC4A3A4", //
			"BFD87D5B-6419-4637-AFC5-35357932AD2C", // Klaue Jormags
			"0464CB9E-1848-4AAA-BA31-4779A959DD71", //
			"295E8D3B-8823-4960-A627-23E07575ED96", // Feuer-Schamane
			"03BF176A-D59F-49CA-A311-39FC6F533F2F", // Zerschmetterer
			"31CEBA08-E44D-472F-81B0-7143D73797F5", // Schatten-Behemoth
			"C5972F64-B894-45B4-BC31-2DEEA6B7C033"  // Dschungel-Wurm
		];
		for (var j = 0; j < chestevents.length; ++j)
		{
			if (chestevents[j] == this.event_id)
				return true;
		}
		return false;
	}
};

var langs = {};
var maps = {};
var events = {};
var worlds = {};

function init(params, callback)
{
	var lang = params.lang || 'de';

	// Fetch information about worlds
	$.getJSON("https://api.guildwars2.com/v1/world_names.json", {lang: lang}, function(data)
	{
		for (var i = 0; i < data.length; ++i)
			worlds[data[i].id] = data[i].name.replace(/<br>/g, ' ');

		// Fetch information about maps
		$.getJSON("https://api.guildwars2.com/v1/map_names.json", {lang: lang}, function(data)
		{
			for (var i = 0; i < data.length; ++i)
				maps[data[i].id] = data[i].name;

			callback(params);
		});
	});
}
