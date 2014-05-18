// Crockford style object creation
function clone(obj)
{
	function F(){};
	F.prototype = obj;
	var result = new F();
	return result;
};

function mod(obj1, obj2)
{
	var div = Math.floor(obj1 / obj2);
	var mod = obj1 - div * obj2;

	if (mod !== 0 && ((obj2 < 0 && mod > 0) || (obj2 > 0 && mod < 0)))
	{
		mod += obj2;
		--div;
	}
	return obj1 - div * obj2;
};

function lpad(string, pad, len)
{
	if (typeof(string) === "number")
		string = string.toString();
	while (string.length < len)
		string = pad + string;
	return string;
};

function minutes()
{
	var now = new Date();
	return 60*now.getHours() + now.getMinutes();
}

function format_minutes(minutes)
{
	return lpad(Math.floor(minutes/60), "0", 2) + ":" + lpad(minutes % 60, "0", 2);
};

function min(x, y)
{
	return x < y ? x : y;
}

var Color = {
	create: function(r, g, b)
	{
		var c = clone(this);
		c.r = typeof(r) !== "undefined" ? Math.round(r) : 0;
		c.g = typeof(g) !== "undefined" ? Math.round(g) : 0;
		c.b = typeof(b) !== "undefined" ? Math.round(b) : 0;
		return c;
	},

	toString: function()
	{
		var r = lpad(this.r.toString(16), "0", 2);
		var g = lpad(this.g.toString(16), "0", 2);
		var b = lpad(this.b.toString(16), "0", 2);
		if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1])
			return "#" + r[0] + g[0] + b[0];
		else
			return "#" + r + g + b;
	},

	mix: function(value1, color1, value2, color2)
	{
		var sum = value1 + value2;

		return Color.create(
			(value1*color1.r+value2*color2.r)/sum,
			(value1*color1.g+value2*color2.g)/sum,
			(value1*color1.b+value2*color2.b)/sum
		);
	}
};


var Event = {
	dist_past: 30,
	dist_future: 120,
	color_past: Color.create(255, 0, 0),
	color_future: Color.create(0, 255, 0),
	color_faroff: Color.create(64, 64, 64),

	create: function(name, time_pdt, time_est, time_mesz)
	{
		var event = clone(this);
		event.name = name;
		event.time_pdt = time_pdt;
		event.time_est = time_est;
		event.time_mesz = time_mesz;

		return event;
	},

	mins: function()
	{
		var parts = this.time_mesz.split(":");
		return 60*parts[0] + 1*parts[1];
	},

	dist: function()
	{
		return mod((this.mins() - minutes()), 1440);
	},

	visible: function()
	{
		var dist = this.dist();
		return (dist >= 1440-this.dist_past) || (dist < this.dist_future);
	},

	html: function()
	{
		if (!this.visible())
			return null;
		var html, dist = this.dist(), isfuture = dist < 720, cssclass = isfuture ? "future" : "past", color;
		if (isfuture)
		{
			if (dist == 0)
				html = "<td class='dist'>jetzt</td>";
			else
				html = "<td class='dist'>in " + dist + " min</td>";
			color = Color.mix(dist, this.color_faroff, this.dist_future-dist, this.color_future);
		}
		else
		{
			dist = 1440-dist;
			html = "<td class='dist'>vor " + dist + " min</td>";
			color = Color.mix(dist, this.color_faroff, this.dist_past-dist, this.color_past);
		}
		html += "<td class='time'>" + this.time_mesz + "</td><th>" + this.name + "</th>";
		return $("<tr class='" + cssclass + "' style='color: " + color.toString() + "'>" + html + "</tr>");
	}
};

var events = [
	Event.create('Megazerstörer', '16:00', '19:00', '1:00'),
	Event.create('Dschungelwurm', '16:15', '19:15', '1:15'),
	Event.create('Schatten-Behemoth', '16:45', '19:45', '1:45'),
	Event.create('Der Zerschmetterer', '17:00', '20:00', '2:00'),
	Event.create('Svanir-Schamane', '17:15', '20:15', '2:15'),
	Event.create('Modniir Ulgoth', '17:30', '20:30', '2:30'),
	Event.create('Feuerelementar', '17:45', '20:45', '2:45'),
	Event.create('Karka-Königin', '18:00', '21:00', '3:00'),
	Event.create('Dschungelwurm', '18:15', '21:15', '3:15'),
	Event.create('Golem Typ II', '18:30', '21:30', '3:30'),
	Event.create('Schatten-Behemoth', '18:45', '21:45', '3:45'),
	Event.create('Tequatl', '19:00', '22:00', '4:00'),
	Event.create('Svanir-Schamane', '19:15', '22:15', '4:15'),
	Event.create('Klaue von Jormag', '19:30', '22:30', '4:30'),
	Event.create('Feuerelementar', '19:45', '22:45', '4:45'),
	Event.create('Großer Dschungelwurm', '20:00', '23:00', '5:00'),
	Event.create('Dschungelwurm', '20:15', '23:15', '5:15'),
	Event.create('Taidha Covington', '20:30', '23:30', '5:30'),
	Event.create('Schatten-Behemoth', '20:45', '23:45', '5:45'),
	Event.create('Megazerstörer', '21:00', '0:00', '6:00'),
	Event.create('Svanir-Schamane', '21:15', '0:15', '6:15'),
	Event.create('Feuerelementar', '21:45', '0:45', '6:45'),
	Event.create('Der Zerschmetterer', '22:00', '1:00', '7:00'),
	Event.create('Dschungelwurm', '22:15', '1:15', '7:15'),
	Event.create('Modniir Ulgoth', '22:30', '1:30', '7:30'),
	Event.create('Schatten-Behemoth', '22:45', '1:45', '7:45'),
	Event.create('Golem Typ II', '23:00', '2:00', '8:00'),
	Event.create('Svanir-Schamane', '23:15', '2:15', '8:15'),
	Event.create('Klaue von Jormag', '23:30', '2:30', '8:30'),
	Event.create('Feuerelementar', '23:45', '2:45', '8:45'),
	Event.create('Der Zerschmetterer', '24:00:00', '3:00', '9:00'),
	Event.create('Dschungelwurm', '0:15', '3:15', '9:15'),
	Event.create('Modniir Ulgoth', '0:30', '3:30', '9:30'),
	Event.create('Schatten-Behemoth', '0:45', '3:45', '9:45'),
	Event.create('Golem Typ II', '1:00', '4:00', '10:00'),
	Event.create('Svanir-Schamane', '1:15', '4:15', '10:15'),
	Event.create('Klaue von Jormag', '1:30', '4:30', '10:30'),
	Event.create('Feuerelementar', '1:45', '4:45', '10:45'),
	Event.create('Taidha Covington', '2:00', '5:00', '11:00'),
	Event.create('Dschungelwurm', '2:15', '5:15', '11:15'),
	Event.create('Megazerstörer', '2:30', '5:30', '11:30'),
	Event.create('Schatten-Behemoth', '2:45', '5:45', '11:45'),
	Event.create('Svanir-Schamane', '3:15', '6:15', '12:15'),
	Event.create('Karka-Königin', '3:30', '6:30', '12:30'),
	Event.create('Feuerelementar', '3:45', '6:45', '12:45'),
	Event.create('Der Zerschmetterer', '4:00', '7:00', '13:00'),
	Event.create('Dschungelwurm', '4:15', '7:15', '13:15'),
	Event.create('Tequatl', '4:30', '7:30', '13:30'),
	Event.create('Schatten-Behemoth', '4:45', '7:45', '13:45'),
	Event.create('Modniir Ulgoth', '5:00', '8:00', '14:00'),
	Event.create('Svanir-Schamane', '5:15', '8:15', '14:15'),
	Event.create('Großer Dschungelwurm', '5:30', '8:30', '14:30'),
	Event.create('Feuerelementar', '5:45', '8:45', '14:45'),
	Event.create('Golem Typ II', '6:00', '9:00', '15:00'),
	Event.create('Dschungelwurm', '6:15', '9:15', '15:15'),
	Event.create('Klaue von Jormag', '6:30', '9:30', '15:30'),
	Event.create('Schatten-Behemoth', '6:45', '9:45', '15:45'),
	Event.create('Taidha Covington', '7:00', '10:00', '16:00'),
	Event.create('Dschungelwurm', '7:15', '10:15', '16:15'),
	Event.create('Megazerstörer', '7:30', '10:30', '16:30'),
	Event.create('Feuerelementar', '7:45', '10:45', '16:45'),
	Event.create('Dschungelwurm', '8:15', '11:15', '17:15'),
	Event.create('Der Zerschmetterer', '8:30', '11:30', '17:30'),
	Event.create('Schatten-Behemoth', '8:45', '11:45', '17:45'),
	Event.create('Karka-Königin', '9:00', '12:00', '18:00'),
	Event.create('Svanir-Schamane', '9:15', '12:15', '18:15'),
	Event.create('Modniir Ulgoth', '9:30', '12:30', '18:30'),
	Event.create('Feuerelementar', '9:45', '12:45', '18:45'),
	Event.create('Tequatl', '10:00', '13:00', '19:00'),
	Event.create('Dschungelwurm', '10:15', '13:15', '19:15'),
	Event.create('Golem Typ II', '10:30', '13:30', '19:30'),
	Event.create('Schatten-Behemoth', '10:45', '13:45', '19:45'),
	Event.create('Großer Dschungelwurm', '11:00', '14:00', '20:00'),
	Event.create('Svanir-Schamane', '11:15', '14:15', '20:15'),
	Event.create('Klaue von Jormag', '11:30', '14:30', '20:30'),
	Event.create('Feuerelementar', '11:45', '14:45', '20:45'),
	Event.create('Taidha Covington', '12:00', '15:00', '21:00'),
	Event.create('Dschungelwurm', '12:15', '15:15', '21:15'),
	Event.create('Megazerstörer', '12:30', '15:30', '21:30'),
	Event.create('Schatten-Behemoth', '12:45', '15:45', '21:45'),
	Event.create('Svanir-Schamane', '13:15', '16:15', '22:15'),
	Event.create('Der Zerschmetterer', '13:30', '16:30', '22:30'),
	Event.create('Feuerelementar', '13:45', '16:45', '22:45'),
	Event.create('Modniir Ulgoth', '14:00', '17:00', '23:00'),
	Event.create('Dschungelwurm', '14:15', '17:15', '23:15'),
	Event.create('Golem Typ II', '14:30', '17:30', '23:30'),
	Event.create('Schatten-Behemoth', '14:45', '17:45', '23:45'),
	Event.create('Klaue von Jormag', '15:00', '18:00', '0:00'),
	Event.create('Svanir-Schamane', '15:15', '18:15', '0:15'),
	Event.create('Taidha Covington', '15:30', '18:30', '0:30'),
	Event.create('Feuerelementar', '15:45', '18:45', '0:45')
];

function make_events()
{
	var allhtml = $("<table id='events'/>"), lastdist = null;
	for (var i = 0; i < events.length; ++i)
	{
		var event = events[i], dist = event.dist();

		if (lastdist > 720 && dist < 720)
		{
			allhtml.append("<tr class='now'><td></td><td>" + format_minutes(minutes()) + "</td><td></td></tr>");
		}
		var html = event.html();
		if (html !== null)
			allhtml.append(html);
		lastdist = dist;
	}
	allhtml.replaceAll("#events");
}

function make_events_handler()
{
	make_events();
	window.setTimeout(make_events_handler, 10000);
}
