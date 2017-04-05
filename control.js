document.addEventListener('DOMContentLoaded', function () {
  // elements
  var canvasPie        = document.getElementById('canvas-pie'),
      canvasMem        = document.getElementById('canvas-mem'),
      inputBuffSize    = document.getElementById('input-buff-size'),
      inputInfoSize    = document.getElementById('input-info-size'),
      inputBlockCnt    = document.getElementById('input-block-cnt'),
      inputStdev       = document.getElementById('input-stdev'),
      inputMemFree     = document.getElementById('input-mem-free'),
      inputAlgo        = document.getElementById('input-algo'),
      inputProc        = document.getElementById('input-proc'),
      buttonInitMem    = document.getElementById('button-init-mem'),
      buttonFragMem    = document.getElementById('button-frag-mem'),
      buttonAllocMem   = document.getElementById('button-alloc-all'),
      buttonDeallocMem = document.getElementById('button-dealloc-all'),
      buttonAnim       = document.getElementById('button-anim');
  
  // variables
  var isAnimating = false;
  
  // render
  function render () {
    $chart.drawChart(canvasPie, memory);
    $anim.drawBlocks(canvasMem, memory);
  }
  
  function toggleButtons () {
    buttonInitMem.disabled = isAnimating;
    buttonFragMem.disabled = isAnimating;
    buttonAllocMem.disabled = isAnimating;
    buttonDeallocMem.disabled = isAnimating;
    buttonAnim.disabled = isAnimating;
  }
  
  // events
  buttonInitMem.addEventListener('click', function (event) {
    event.preventDefault();
    
    if (isAnimating) {
      return;
    }
    
    var buffSize = Number(inputBuffSize.value),
        infoSize = Number(inputInfoSize.value);
    
    memory.init(buffSize, infoSize);
    
    inputBlockCnt.setAttribute('max', Math.floor(buffSize / (infoSize + 1)));
    render();
  });
  
  buttonFragMem.addEventListener('click', function (event) {
    event.preventDefault();
    
    if (isAnimating) {
      return;
    }
    
    var blockCnt = Number(inputBlockCnt.value),
        stdev    = Number(inputStdev.value),
        memFree  = Number(inputMemFree.value);
    
    memory.randomFragmentation(blockCnt, stdev, memFree);
    render();
  });
  
  buttonAllocMem.addEventListener('click', function (event) {
    event.preventDefault();
    
    if (isAnimating) {
      return;
    }
    
    memory.takeBlocks();
    render();
  });
  
  buttonDeallocMem.addEventListener('click', function (event) {
    event.preventDefault();
    
    if (isAnimating) {
      return;
    }
    
    memory.cleanBlocks();
    render();
  });
  
  inputAlgo.addEventListener('change', function (event) {
    event.preventDefault();
    
    // update HTML attribute according to DOM attribute to apply CSS
    inputAlgo.setAttribute('value', inputAlgo.value);
  });
  
  buttonAnim.addEventListener('click', function (event) {
    event.preventDefault();
    
    if (isAnimating) {
      return;
    }
    
    isAnimating = true;
    toggleButtons();
    
    var func = 'firstFit';
    switch (inputAlgo.value) {
      case 'NF':
        func = 'nextFit';
        break;
      case 'BF':
        func = 'bestFit';
        break;
      case 'WF':
        func = 'worstFit';
        break;
    }
    var sizes = inputProc.value.split(',');
    
    function callback () {
      render();
      if (sizes.length > 0) {
        var size = Number(sizes.shift());
        if (size > 0) {
          memory[func](size, true);
          $anim.startAnim(canvasMem, memory, function () {
            memory[func](size);
            setTimeout(callback, 200);
          });
        } else {
          callback();
        }
      } else {
        isAnimating = false;
        toggleButtons();
      }
    }
    
    callback();
  });
        
  
  // init
  buttonInitMem.click();
  
});
