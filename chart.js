var canvas = document.getElementById("pie_chart");
var ctx = canvas.getContext("2d");
ctx.clear = function() { ctx.clearRect(0, 0, canvas.width, canvas.height); };
ctx.drawCircle = function(x,y,radius,color,semi,line_width)
{
	ctx.beginPath();
    ctx.arc(x, y, radius, 0, semi * Math.PI, false);
    ctx.lineWidth = line_width;
    ctx.strokeStyle = color;
    ctx.stroke();
};
var pieChart = {
	pos : {x:100,y:100},
	radius: 60,
	line_width:20
};
ctx.drawRect = function(x, y, width, height, color) {
	ctx.beginPath();
	ctx.rect(x, y, width, height);
	ctx.fillStyle = color;
	ctx.fill();
};
ctx.drawChart = function() {
	ctx.clear();
	var statistics = memory.getStatistics();
	var sectors = new Array();
	sectors.push({ arc: (2*statistics.available_percent/100), bytes: statistics.available, color:"#39ac39", text:"available"});
	sectors.push({ arc: (2*statistics.allocated_percent/100), bytes: statistics.allocated, color:"rgba(153, 0, 0, 0.6)", text:"allocated"});
	sectors.push({ arc: (2*statistics.info_percent/100), bytes: statistics.info, color:"#94b8b8", text:"as block info"});
	

	var angle = 0;
	for(var i=0; i<sectors.length; i++)
	{
		ctx.save();
		ctx.translate(pieChart.pos.x - pieChart.radius/2, pieChart.pos.y - pieChart.radius/2);
		ctx.rotate(angle* Math.PI);
		ctx.drawCircle(0,0,pieChart.radius,sectors[i].color, sectors[i].arc, pieChart.line_width);
		ctx.restore();
		angle+=sectors[i].arc;
	}
	angle = 0;
	var pos,half_angle,percentage;
	for(var i=0; i<sectors.length; i++)	// Draw text
	{
		percentage = Math.round((sectors[i].arc/2*100)*10)/10;
		angle+=sectors[i].arc/2;
		if(percentage>0)
		{
			
			ctx.save();
			ctx.translate(pieChart.pos.x - pieChart.radius/2, pieChart.pos.y - pieChart.radius/2);
			pos = {x:0,y:0};
	 		pos.x = (pieChart.radius) * Math.cos(angle* Math.PI);
			pos.y = (pieChart.radius) * Math.sin(angle* Math.PI);
			ctx.font = "13px Arial";
			ctx.fillText(percentage+"%",pos.x-8,pos.y+5);
			ctx.restore();
		}
		angle+=sectors[i].arc/2;
	}
	for(var i=0; i<sectors.length; i++)	// Draw legend
	{
		ctx.save();
		ctx.translate(160,10+20*i);
		ctx.drawRect(0,0,10,10,sectors[i].color);
		ctx.font = "13px Arial";
		ctx.fillStyle = "black";
		ctx.fillText(sectors[i].bytes+" bytes "+sectors[i].text,13,10);
		ctx.restore();
	}
};

ctx.drawChart();
