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

function minutes(date)
{
	return 60*date.getHours() + date.getMinutes();
}

function utcminutes(date)
{
	return 60*date.getUTCHours() + date.getUTCMinutes();
}

function addminutes(mins1, mins2)
{
	var sum = mins1 + mins2;
	if (sum >= 1440)
		sum -= 1440;
	else if (sum < 0)
		sum += 1440;
	return sum;
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

var EventDate = {
	dist_past: 45,
	dist_future: 120,
	color_past: Color.create(255, 0, 0),
	color_future: Color.create(0, 255, 0),
	color_faroff: Color.create(64, 64, 64),

	utcoffset: (function(){
		var date = new Date();
		return minutes(date) - utcminutes(date);
	})(),

	create: function(event, time_utc)
	{
		var eventdate = clone(this);
		eventdate.event = event;
		eventdate.time_utc = time_utc;
		return eventdate;
	},

	minutes: function()
	{
		var parts = this.time_utc.split(":");
		return 60*parts[0] + 1*parts[1];
	},

	format_minutes: function()
	{
		return format_minutes(addminutes(this.minutes(), this.utcoffset));
	},

	dist: function()
	{
		return mod((this.minutes() - utcminutes(new Date())), 1440);
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
		if (this.event.done)
			cssclass += " done";
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
		html += "<td class='time'>" + this.format_minutes() + "</td><td class='state'>\u2713</td><th>" + this.event.name + "</th>";
		html = $("<tr class='event " + cssclass + "'" + (this.event.done ? "" : " style='color: " + color.toString() + "'") + ">" + html + "</tr>");
		var self = this;
		html.on("tap", function(event){self.toggle()});
		return html;
	},

	toggle: function()
	{
		this.event.done = !this.event.done;
		make_events();
	}
};

var Event = {
	events: {},

	create: function(name, time_utc)
	{
		var event;

		if (typeof(this.events[name]) === "undefined")
		{
			event = clone(this);
			event.name = name;
			event.done = false;
			event.dates = [];
			this.events[name] = event;
		}
		else
			event = this.events[name];
		var eventdate = EventDate.create(event, time_utc);
		event.dates.push(eventdate);

		return eventdate;
	},


};

var eventdates = [
	Event.create('Tequatl', '00:00'),
	Event.create('Taidha Covington', '00:00'),
	Event.create('Svanir-Schamane', '00:15'),
	Event.create('Megazerstörer', '00:30'),
	Event.create('Feuerelementar', '00:45'),
	Event.create('Großer Dschungelwurm', '01:00'),
	Event.create('Der Zerschmetterer', '01:00'),
	Event.create('Dschungelwurm', '01:15'),
	Event.create('Modniir Ulgoth', '01:30'),
	Event.create('Schatten-Behemoth', '01:45'),
	Event.create('Karka-Königin', '02:00'),
	Event.create('Golem Typ II', '02:00'),
	Event.create('Svanir-Schamane', '02:15'),
	Event.create('Klaue von Jormag', '02:30'),
	Event.create('Feuerelementar', '02:45'),
	Event.create('Tequatl', '03:00'),
	Event.create('Taidha Covington', '03:00'),
	Event.create('Dschungelwurm', '03:15'),
	Event.create('Megazerstörer', '03:30'),
	Event.create('Schatten-Behemoth', '03:45'),
	Event.create('Großer Dschungelwurm', '04:00'),
	Event.create('Der Zerschmetterer', '04:00'),
	Event.create('Svanir-Schamane', '04:15'),
	Event.create('Modniir Ulgoth', '04:30'),
	Event.create('Feuerelementar', '04:45'),
	Event.create('Golem Typ II', '05:00'),
	Event.create('Dschungelwurm', '05:15'),
	Event.create('Klaue von Jormag', '05:30'),
	Event.create('Schatten-Behemoth', '05:45'),
	Event.create('Karka-Königin', '06:00'),
	Event.create('Taidha Covington', '06:00'),
	Event.create('Svanir-Schamane', '06:15'),
	Event.create('Megazerstörer', '06:30'),
	Event.create('Feuerelementar', '06:45'),
	Event.create('Tequatl', '07:00'),
	Event.create('Der Zerschmetterer', '07:00'),
	Event.create('Dschungelwurm', '07:15'),
	Event.create('Modniir Ulgoth', '07:30'),
	Event.create('Schatten-Behemoth', '07:45'),
	Event.create('Großer Dschungelwurm', '08:00'),
	Event.create('Golem Typ II', '08:00'),
	Event.create('Svanir-Schamane', '08:15'),
	Event.create('Klaue von Jormag', '08:30'),
	Event.create('Feuerelementar', '08:45'),
	Event.create('Taidha Covington', '09:00'),
	Event.create('Dschungelwurm', '09:15'),
	Event.create('Megazerstörer', '09:30'),
	Event.create('Schatten-Behemoth', '09:45'),
	Event.create('Der Zerschmetterer', '10:00'),
	Event.create('Svanir-Schamane', '10:15'),
	Event.create('Karka-Königin', '10:30'),
	Event.create('Modniir Ulgoth', '10:30'),
	Event.create('Feuerelementar', '10:45'),
	Event.create('Golem Typ II', '11:00'),
	Event.create('Dschungelwurm', '11:15'),
	Event.create('Tequatl', '11:30'),
	Event.create('Klaue von Jormag', '11:30'),
	Event.create('Schatten-Behemoth', '11:45'),
	Event.create('Taidha Covington', '12:00'),
	Event.create('Svanir-Schamane', '12:15'),
	Event.create('Großer Dschungelwurm', '12:30'),
	Event.create('Megazerstörer', '12:30'),
	Event.create('Feuerelementar', '12:45'),
	Event.create('Der Zerschmetterer', '13:00'),
	Event.create('Dschungelwurm', '13:15'),
	Event.create('Modniir Ulgoth', '13:30'),
	Event.create('Schatten-Behemoth', '13:45'),
	Event.create('Golem Typ II', '14:00'),
	Event.create('Svanir-Schamane', '14:15'),
	Event.create('Klaue von Jormag', '14:30'),
	Event.create('Feuerelementar', '14:45'),
	Event.create('Karka-Königin', '15:00'),
	Event.create('Taidha Covington', '15:00'),
	Event.create('Dschungelwurm', '15:15'),
	Event.create('Megazerstörer', '15:30'),
	Event.create('Schatten-Behemoth', '15:45'),
	Event.create('Tequatl', '16:00'),
	Event.create('Der Zerschmetterer', '16:00'),
	Event.create('Svanir-Schamane', '16:15'),
	Event.create('Modniir Ulgoth', '16:30'),
	Event.create('Feuerelementar', '16:45'),
	Event.create('Großer Dschungelwurm', '17:00'),
	Event.create('Golem Typ II', '17:00'),
	Event.create('Dschungelwurm', '17:15'),
	Event.create('Klaue von Jormag', '17:30'),
	Event.create('Schatten-Behemoth', '17:45'),
	Event.create('Karka-Königin', '18:00'),
	Event.create('Taidha Covington', '18:00'),
	Event.create('Svanir-Schamane', '18:15'),
	Event.create('Megazerstörer', '18:30'),
	Event.create('Feuerelementar', '18:45'),
	Event.create('Tequatl', '19:00'),
	Event.create('Der Zerschmetterer', '19:00'),
	Event.create('Dschungelwurm', '19:15'),
	Event.create('Modniir Ulgoth', '19:30'),
	Event.create('Schatten-Behemoth', '19:45'),
	Event.create('Großer Dschungelwurm', '20:00'),
	Event.create('Golem Typ II', '20:00'),
	Event.create('Svanir-Schamane', '20:15'),
	Event.create('Klaue von Jormag', '20:30'),
	Event.create('Feuerelementar', '20:45'),
	Event.create('Taidha Covington', '21:00'),
	Event.create('Dschungelwurm', '21:15'),
	Event.create('Megazerstörer', '21:30'),
	Event.create('Schatten-Behemoth', '21:45'),
	Event.create('Der Zerschmetterer', '22:00'),
	Event.create('Svanir-Schamane', '22:15'),
	Event.create('Modniir Ulgoth', '22:30'),
	Event.create('Feuerelementar', '22:45'),
	Event.create('Karka-Königin', '23:00'),
	Event.create('Golem Typ II', '23:00'),
	Event.create('Dschungelwurm', '23:15'),
	Event.create('Klaue von Jormag', '23:30'),
	Event.create('Schatten-Behemoth', '23:45')
];

function make_events()
{
	var allhtml = $("<table id='events'/>"), lastdist = null;
	var now = minutes();
	var offset = Math.floor(now/1440*eventdates.length+eventdates.length/2);
	var anydone = false;
	for (var i = 0; i < eventdates.length; ++i)
	{
		var event = eventdates[mod(i+offset, eventdates.length)], dist = event.dist();

		if (lastdist > 720 && dist < 720)
		{
			allhtml.append("<tr class='now'><td></td><td>" + format_minutes(now) + "</td><td></td><td></td></tr>");
		}
		var html = event.html();
		if (html !== null)
			allhtml.append(html);
		lastdist = dist;
		if (event.event.done)
			anydone = true;
	}
	if (anydone)
	{
		var reset = $('<tr class="reset"><td colspan="4">"Erledigt"-Status zurücksetzen</td></tr>');
		reset.on("tap", function(event){
			for (var name in Event.events)
			{
				Event.events[name].done = false;
				make_events();
			}
		});
		allhtml.append(reset);
	}
	allhtml.replaceAll("#events");
}

function make_events_handler()
{
	make_events();
	window.setTimeout(make_events_handler, 10000);
}
