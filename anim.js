
var $anim = (function () {
  
  var linesCnt = 15,
      availColor = '#3D8F66',
      allocColor = '#990000',
      infoColor = '#94B8B8',
      strokeWidth = 1,
      strokeUpColor = '#555',
      strokeDownColor = '#CCC',
      boxStrokeWidth = 6,
      box1Color = 'rgba(0, 153, 0, 0.5)',
      box2Color = 'rgba(0, 0, 153, 0.5)',
      animSpeed = 0.09, // bytes/ms
      isAnim = false;
  
  function isAnimating () {
    return isAnim;
  }
  
  function drawBlocks (canvas, memory, boxes) {
    var width = canvas.width,
        height = canvas.height,
        byteWidth = linesCnt * width / memory.size,
        byteHeight = height / linesCnt;
    
    function memPosToCanvas (pos) {
      pos *= byteWidth;
      var y = Math.floor(pos / width);
      var x = pos - y * width;
      return {
        x: x,
        y: y * byteHeight
      };
    }
    
    var ctx = canvas.getContext('2d');
    
    var blocks = memory.getBlocks(),
        colorBlocks = [];
    
    for (var i = 0; i < blocks.length; i++) {
      colorBlocks.push({
        size: memory.info_size,
        color: infoColor
      });
      colorBlocks.push({
        size: blocks[i].size,
        color: blocks[i].free ? availColor : allocColor
      });
    }
    
    
    
    // draw fragments
    var i = 0, x = 0, y = 0, curCol = colorBlocks[i].color;
    var curSize = byteWidth * colorBlocks[i].size;
    while (y < height) {
      ctx.fillStyle = curCol;
      var x2 = x + curSize;
      if (x2 <= width) { // block fits, draw it
        ctx.fillRect(x, y, curSize, byteHeight);
        x = x2;
        if (x >= width) {
          x = 0;
          y += byteHeight;
        }
        i++;
        if (i < colorBlocks.length) {
          curSize = byteWidth * colorBlocks[i].size;
          curCol = colorBlocks[i].color;
        }
      } else {
        ctx.fillRect(x, y, width - x, byteHeight);
        curSize -= width - x;
        x = 0;
        y += byteHeight;
      }
    }
    
    
    // draw lines
    // horizontal
    for (i = 0; i < linesCnt; i++) {
      y = Math.floor(i * byteHeight);
      ctx.strokeStyle = strokeUpColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5 * strokeWidth);
      ctx.lineTo(width, y + 0.5 * strokeWidth);
      ctx.stroke();
      
      y = Math.floor((i + 1) * byteHeight);
      ctx.strokeStyle = strokeDownColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(0, y - 0.5 * strokeWidth);
      ctx.lineTo(width, y - 0.5 * strokeWidth);
      ctx.stroke();
    }
    
    
    // vertical
    for (i = 0; i < blocks.length; i++) {
      var pos = blocks[i].start;
      var p = memPosToCanvas(pos);
      y = p.y;
      x = Math.floor(p.x) + 0.5 * strokeWidth;
      
      ctx.strokeStyle = strokeUpColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(x, Math.floor(y));
      ctx.lineTo(x, Math.floor(y + byteHeight));
      ctx.stroke();
      
      pos += blocks[i].size + memory.info_size;
      p = memPosToCanvas(pos);
      y = p.y;
      x = Math.floor(p.x) - 0.5 * strokeWidth;
      
      ctx.strokeStyle = strokeDownColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(x, Math.floor(y));
      ctx.lineTo(x, Math.floor(y + byteHeight));
      ctx.stroke();
    }
    
    
    if (boxes) {
      for (i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        
        ctx.fillStyle = box.color;
        ctx.beginPath();
        
        var p = memPosToCanvas(box.pos);
        x = p.x;
        y = p.y;
        curCol = colorBlocks[i].color;
        curSize = byteWidth * box.size;
        while (y < height) {
          var x2 = x + curSize;
          if (x2 <= width) { // block fits, draw it
            ctx.rect(x - 0.5 * boxStrokeWidth, y - 0.5 * boxStrokeWidth, curSize + boxStrokeWidth, byteHeight + boxStrokeWidth);
            break;
          } else {
            ctx.rect(x - 0.5 * boxStrokeWidth, y - 0.5 * boxStrokeWidth, width - x + boxStrokeWidth, byteHeight + boxStrokeWidth);
            curSize -= width - x;
            x = 0;
            y += byteHeight;
          }
        }
        
        ctx.fill();
      }
    }
    
    
  }
  
  function startAnim (canvas, memory, callback) {
    if (isAnim) {
      return;
    }
    isAnim = true;
    
    var animStart = memory.animStart,
        animEnd = memory.animEnd,
        animSize = memory.animSize,
        animStops = memory.animStops.slice(), // copy
        animStop = -1,
        prevTime = 0;
    
    function animate (curTime) {
      var dt = curTime - prevTime; // in ms
      prevTime = curTime;
      
      animStart += animSpeed * dt;
      
      while (animStops.length > 0 && animStart >= animStops[0]) {
        animStop = animStops.shift();
      }
      
      var isDone = animStart > animEnd;
      // var isDone = true;
      if (isDone) {
        animStart = animEnd;
        isAnim = false;
      } else {
        requestAnimationFrame(animate);
      }
      
      var boxes = [];
      var pos = animStart % memory.size;
      if (pos + animSize <= memory.size) {
        boxes.push({
          pos: pos,
          size: animSize,
          color: box1Color
        });
      } else {
        boxes.push({
          pos: pos,
          size: memory.size - pos,
          color: box1Color
        });
        boxes.push({
          pos: 0,
          size: animSize - (memory.size - pos),
          color: box1Color
        });
      }
      if (animStop >= 0) {
        var pos = animStop % memory.size;
        if (pos + animSize <= memory.size) {
          boxes.push({
            pos: pos,
            size: animSize,
            color: box2Color
          });
        } else {
          boxes.push({
            pos: pos,
            size: memory.size - pos,
            color: box2Color
          });
          boxes.push({
            pos: 0,
            size: animSize - (memory.size - pos),
            color: box2Color
          });
        }
      }
      drawBlocks(canvas, memory, boxes);
      if (isDone && callback) {
        callback();
      }
    }
    
    requestAnimationFrame(function (curTime) {
      prevTime = curTime;
      animate(curTime);
    });
  }
  
  return {
    isAnimating: isAnimating,
    startAnim: startAnim,
    drawBlocks: drawBlocks
  };
})();

