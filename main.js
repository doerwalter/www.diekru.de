var query = location.search.substr(1).split("&");
var params = {};
for(var i = 0; i<query.length; i++)
{
	var item = query[i].split("=");
	params[item[0]] = item[1];
}

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

			// Fetch information about events
			$.getJSON("https://api.guildwars2.com/v1/event_names.json", {lang: lang}, function(data)
			{
				for (var i = 0; i < data.length; ++i)
					events[data[i].id] = data[i].name;
				callback(params);
			});
		});
	});
}

function isbossevent(event)
{
	var bossevents = [
		/.*Eisklamm-Sund: .*Jormag.*/,
		/.*Flammenkamm-Steppe: .*Zerschmetterer.*/,
		/.*Königintal: .*Schatten-Behemoth.*/,
		/.*Caledo-Wald: .*Dschungelwurm.*/,
		/.*Funkenschwärmersumpf: .*Tequatl.*/,
		/.*Mahlstromgipfel: .*Megazerstörer.*/,
		/.*Provinz Metrica: .*(Rooba|S.A.U.B.E.R.).*/,
		/.*Mahlstromgipfel: .*Inquestur-Golem Typ II*/
	];
	var msg = maps[event.map_id] + ": " + events[event.event_id];
	for (var j = 0; j < bossevents.length; ++j)
	{
		if (bossevents[j].test(msg))
			return true;
	}
	return false;
}
