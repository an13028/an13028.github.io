
var $chart = (function () {
  
  
  var pieRadius = 60,
      pieWidth = 20,
      pieMargin = 25,
      legendY = 10,
      legendRow = 20,
      availColor = '#3D8F66',
      allocColor = '#990000',
      infoColor = '#94B8B8';
  
  
  function drawChart (canvas, memory) {
    var statistics = memory.getStatistics();
    var sectors = [
      {
        percentage: Math.round(statistics.available_percent * 10) / 10,
        bytes: statistics.available,
        color: availColor,
        text: "available"
      },
      {
        percentage: Math.round(statistics.allocated_percent * 10) / 10,
        bytes: statistics.allocated,
        color: allocColor,
        text: "allocated"
      },
      {
        percentage: Math.round(statistics.info_percent * 10) / 10,
        bytes: statistics.info,
        color: infoColor,
        text: "as block info"
      }
    ];
    var angle = 0;
    for (var i = 0; i < sectors.length; i++)
    {
      sectors[i].arcStart = angle;
      angle += 2 * Math.PI * sectors[i].percentage / 100;
      sectors[i].arcEnd = angle;
    }
    
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "13px Arial";
    
    // Draw arcs
    ctx.save();
    ctx.translate(pieMargin + pieRadius, canvas.height * 0.5);
    for (var i = 0; i < sectors.length; i++)
    {
      ctx.lineWidth = pieWidth;
      ctx.strokeStyle = sectors[i].color;
      ctx.beginPath();
      ctx.arc(0, 0, pieRadius, sectors[i].arcStart, sectors[i].arcEnd, false);
      ctx.stroke();
    }
    
    // Draw text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < sectors.length; i++)
    {
      if (sectors[i].percentage > 0) {
        angle = 0.5 * (sectors[i].arcStart + sectors[i].arcEnd);
        var x = pieRadius * Math.cos(angle);
        var y = pieRadius * Math.sin(angle);
        ctx.fillText(sectors[i].percentage + "%", x, y);
      }
    }
    ctx.restore();
    
    // Draw legend
    ctx.save();
    ctx.translate((pieMargin + pieRadius) * 2, legendY);
    for (var i = 0; i < sectors.length; i++)
    {
      ctx.fillStyle = sectors[i].color;
      ctx.fillRect(0, 0, 10, 10);
      ctx.fillStyle = "black";
      ctx.fillText(sectors[i].bytes + " bytes " + sectors[i].text, 13, 10);
      ctx.translate(0, legendRow);
    }
    ctx.restore();
  };
  
  return {
    drawChart: drawChart
  };
})();

