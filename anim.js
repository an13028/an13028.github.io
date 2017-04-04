
var $anim = (function () {
  
  var linesCnt = 15,
      availColor = '#3d8f66',
      allocColor = '#990000',
      infoColor = '#94B8B8',
      isAnim = false;
  
  function isAnimating () {
    return isAnim;
  }
  
  function drawBlocks (canvas, memory) {
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
    
    var bytesInLine = Math.floor(memory.size / linesCnt),
        byteWidth = canvas.width / bytesInLine,
        byteHeight = canvas.height / linesCnt;
    
    var ctx = canvas.getContext('2d');
    
    // console.log('blocks', blocks);
    // console.log('colorBlocks', colorBlocks);
    // console.log('bytesInLine', bytesInLine, 'byteWidth', byteWidth, 'byteHeight', byteHeight);
    
    // draw fragments
    var i = 0, bX = 0, bY = 0, curCol = colorBlocks[i].color;
    var curSize = colorBlocks[i].size;
    while (bX + bytesInLine * bY < memory.size) {
      ctx.fillStyle = curCol;
      // ctx.strokeStyle = '#000';
      // ctx.lineWidth = 1;
      ctx.beginPath();
      var bX2 = bX + curSize;
      if (bX2 <= bytesInLine) { // block fits, draw it
        ctx.rect(bX * byteWidth, bY * byteHeight, curSize * byteWidth, byteHeight);
        bX = bX2;
        if (bX === bytesInLine) {
          bX = 0;
          bY++;
        }
        i++;
        if (i < colorBlocks.length) {
          curSize = colorBlocks[i].size;
          curCol = colorBlocks[i].color;
        }
      } else {
        ctx.rect(bX * byteWidth, bY * byteHeight, (bytesInLine - bX) * byteWidth, byteHeight);
        curSize -= bytesInLine - bX;
        bX = 0;
        bY++;
      }
      ctx.fill();
      // ctx.stroke();
      
    }
    
    // todo: draw animated blocks
    
  }
  
  function startAnim (canvas, memory, callback) {
    if (isAnim) {
      return;
    }
    isAnim = true;
    
    function animate () {
      var isDone = true; // todo
      if (isDone) {
        isAnim = false;
      } else {
        requestAnimationFrame(animate);
      }
      drawBlocks(canvas, memory);
      if (isDone && callback) {
        callback();
      }
    }
    
    animate();
  }
  
  return {
    isAnimating: isAnimating,
    startAnim: startAnim,
    drawBlocks: drawBlocks
  };
})();

