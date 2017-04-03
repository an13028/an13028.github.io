// Allows insertion between array elements
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

// Init memory
var memory = {
	size: 0,				// Size of system memory buffer
	info_size: 0,
	position: 0,			// Current block index
	blocks: new Array()		// List of all memory blocks
};

memory.init = function(size,info_size) {
	memory.size = size;
	memory.info_size = info_size;
	memory.free();	// delete blocks
	memory.blocks.push({free:true, size: (size-info_size)});	// start with long, big uncut
};
memory.cleanBlock = function ( index ) { memory.blocks[index].free = true; };
memory.cleanBlocks = function () { for(var i=0; i<memory.blocks.length; i++) memory.cleanBlock(i); };
memory.takeBlock = function ( index ) { memory.blocks[index].free = false; };
memory.takeBlocks = function () { for(var i=0; i<memory.blocks.length; i++) memory.takeBlock(i); };
memory.getBlocks = function (){ return memory.blocks; }
memory.free = function () {		// Clears all array elements
	memory.position = 0;
	while (memory.blocks.length) { memory.blocks.pop(); }
};
memory.getStatistics = function () {	// returns statistics of memory
	var info_size = memory.blocks.length * memory.info_size; // info size per block * block number
	var taken = 0;
	for(var i=0; i<memory.blocks.length; i++) {	// Counts how much memory is allocated
		if(!memory.blocks[i].free)
			taken += memory.blocks[i].size;
	}
	var available = memory.size - taken - info_size;
	var percentage_taken = 100*(taken)/memory.size;
	var percentage_info = 100*(info_size)/memory.size;
	var percentage_free = 100 - percentage_taken-percentage_info;
	return {total:memory.size, allocated:taken, available:available, info:info_size, total_percent:100, allocated_percent:percentage_taken, available_percent:percentage_free, info_percent:percentage_info};
};

infoMemory = function ( block_size ) { return block_size+memory.info_size; };	// Takes into account info size stored in mem block

gaussian = function ( mean, stdev ) {	// returns a gaussian random function with the given mean and stdev.
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }
       var retval = mean + stdev * y1;
       if(retval > 0) 
           return retval;
       return -retval;
   }
};

// Search for best fit inside integral of available block memory
binarySearch = function( r1, r2, array, search_value ) {
	var range = r2 - r1;
	var ind = range / 2;
	
	if(ind < 1)	// If no 
	{
		if(search_value > array[r1-1])
			return r2-1;
		return r1-1;
	}

	ind = Math.floor(ind) + r1;
	if(search_value == array[ind-1])
		return ind-1;
	if(search_value > array[ind-1])
		return binarySearch(ind,r2,array,search_value);
	else
		return binarySearch(r1,ind,array,search_value);
};

memory.allocate = function ( index, new_block_size ) {
	if(index < 0 || index >= memory.blocks.length)
		return false;
	var real_block_size = new_block_size+memory.info_size;
	// If currently pointed mem block is free and has enough size
	if(memory.blocks[index].free && real_block_size <= memory.blocks[index].size)	
	{
		var size_left = (memory.blocks[index].size-real_block_size);
		if(size_left > memory.info_size) {	// if block left has some space
			memory.blocks[index] = {size:size_left, free: true};
			memory.blocks.insert(index, {size:new_block_size, free:false});
		}
		else{
			memory.blocks[index].free = false;
		}
		memory.position = index;
		return true;	// Successful allocation
	}
	else 
		return false;
};

// Starts always from beginning till finds block large enough - O(n) worst case
memory.firstFit = function ( new_block_size ) {
	if((new_block_size+memory.info_size) > memory.size)	// block size is bigger than memory buffer
		return -1;
	// Always start from beginning	
	for(var i=0; i<memory.blocks.length; i++) 	// O(n) in worst case (no blocks available)
	{
		if(memory.allocate(i, new_block_size)) 
			return 1;
	}
	return 0;	// If no memory left
};

// Starts from previously allocated block till finds block large enough - O(n) worst case
memory.nextFit = function ( new_block_size ) {
	if((new_block_size+memory.info_size) > memory.size)	// block size is bigger than memory buffer
		return -1;
	for(var i=0; i<memory.blocks.length; i++) 	// O(n) in worst case (no blocks available)
	{
		// Start from current position, end in current position (if no blocks available)
		var index = (memory.position + i) % memory.blocks.length;
		if(memory.allocate(index, new_block_size))			
			return 1;
	}
	return 0;	// If no memory left
};

// Loops through all memory to find smallest mem block it can fit - O(n) always
memory.bestFit = function ( new_block_size ) {
	if((new_block_size+memory.info_size) > memory.size)	// block size is bigger than memory buffer
		return -1;
	var best_fit = memory.size;
	var bf_position = -1;
	// Always start from beginning	
	for(var i=0; i<memory.blocks.length; i++) 	// O(n) always
	{
		// If currently pointed mem block is free and has enough size
		if(memory.blocks[i].free && (new_block_size+memory.info_size) <= memory.blocks[i].size)	
		{
			// If current block is smaller than previously found ones, save as best fit
			if(best_fit >= memory.blocks[i].size)
			{
				best_fit = memory.blocks[i].size;
				bf_position = i;
			}
		}
	}
	if(memory.allocate(bf_position, new_block_size)) 
		return 1;
	else 
		return 0;	// If no memory left
};

// Loops through all memory to find largest mem block it can fit - O(n) always
memory.worstFit = function ( new_block_size ) {
	if((new_block_size+memory.info_size) > memory.size)	// block size is bigger than memory buffer
		return -1;
	var worst_fit = 0;
	var wf_position = -1;
	// Always start from beginning	
	for(var i=0; i<memory.blocks.length; i++) 	// O(n) always
	{
		// If currently pointed mem block is free and has enough size
		if(memory.blocks[i].free && (new_block_size+memory.info_size) <= memory.blocks[i].size)	
		{
			// If current block is smaller than previously found ones, save as best fit
			if(worst_fit <= memory.blocks[i].size)
			{
				worst_fit = memory.blocks[i].size;
				wf_position = i;
			}
		}
	}
	if(memory.allocate(wf_position, new_block_size)) 
		return 1;
	else 
		return 0;	// If no memory left
};

// Fragments all memory based on percentage to be left free, how many blocks and standard deviation between them (low std_dev, blocks tend to be same size)
memory.randomFragmentation = function ( block_num, std_dev, percentage_free ) {
	// Deallocate all memory first
	memory.free();

	// Special case or wrong input
	if(block_num <= 1){
		memory.init(memory.size,memory.info_size);
		if(percentage_free < 50)	// if 1 block then binary choice
			memory.takeBlocks();
		return;
	}

	var mean = Math.floor((memory.size-(memory.info_size*block_num)) / block_num);
	if(mean <= memory.info_size)	// all blocks will be just info_size or smaller
		return -1;

	if(std_dev > mean)	// Don't allow deviation more than mean
		std_dev = mean;

	var standard = gaussian(mean, std_dev);		// Init random gaussian generator
	var blocks = new Array();
	var memory_left = memory.size-(memory.info_size*block_num);
	var bs;
	for(var i=0; i<block_num; i++)
	{
		bs = memory.info_size+Math.floor(standard());
		if(bs <= memory.info_size){
			bs = memory.info_size+1;
		}
		else if(bs >= memory_left) {
			blocks.push(memory_left);
			memory_left = 0;
			break;
		}
		memory_left -= bs;
		// If memory left is smaller than info_size then add it to current block
		if(memory_left <= memory.info_size) {
			bs += memory_left;
			blocks.push(bs);
			memory_left = 0;
			break;
		}
		blocks.push(bs);
	}

	// Deal with memory left case or when less blocks allocated (usually when large standard deviation)
	if(blocks.length < block_num)	// Take from each block, to create n new blocks
	{
		var diff = block_num-blocks.length;
		blocks.sort(function(a, b){ return b-a} );	// Sort descending

		var bsize = blocks.length;	// No need to take from just created blocks

		// Create new blocks - of smalles size possible, because they should be zeroes
		for(i=0; i<diff; i++) {
			bs = 0;
			for(j=0; j<bsize; j++) {	// Take bigger pieces from biggest blocks
				var take = 0;
				if(j==0)
					take = memory.info_size;
				else
					take = Math.floor(memory.info_size*((blocks.length-(j))/blocks.length));
				if((blocks[j] - take) > memory.info_size)
				{
					bs += take;
					blocks[j] -= take;
					if(bs > memory.info_size)
						break;
				}
			}
			blocks.push(bs);
		}	
	}
	else if(memory_left > 0)	// if memory left, smallest blocks will get biggest pieces
	{
		blocks.sort(function(a, b){ return a-b} );	// Sort ascending
		for(i=0; i<blocks.length; i++)
		{
			var take = Math.floor(memory_left*((blocks.length-(i+1))/blocks.length));
			if(take >= memory_left)
			{
				take = memory_left;
				memory_left = 0;
				blocks[i] += take;
				break;
			}
			blocks[i] += take;
			memory_left -= take;
		}
		if(memory_left > 0)	// if still something left, give it to smallest block
		{
			blocks[0] += memory_left;
			memory_left = 0;
		}
	}

	blocks.sort(function(a, b){ return b-a} );	// Sort descending

	// Delete zeroes just in case they still can be found
	bs = 0;
	for(i=blocks.length-1; i>0; i--)
		if(blocks[i] == 0) 
			bs++;
		else 
			break;
	while(bs>0)	{ blocks.pop(); bs--; }	// Delete zero blocks

	// Divide taken memory betweeen blocks
	var percentage_should_be_taken = 100 - percentage_free;
	var info_size = blocks.length * memory.info_size;
	var taken_percent = Math.floor(100*info_size/memory.size);
	var free = new Array(); 

	var should_be_taken = Math.floor(memory.size*(percentage_should_be_taken)/100);
	var to_take = should_be_taken - info_size;

	if(taken_percent >= percentage_should_be_taken)
	{
		for(i=0; i<blocks.length; i++)
			free.push(true);
	}
	else if(percentage_should_be_taken >= 100)
	{
		for(i=0; i<blocks.length; i++)
			free.push(false);
	}
	else {	// If percentage of free memory is possible to achieve
		for(i=0; i<blocks.length; i++)
			free.push(true);

		var even_integral = new Array();
		var odd_integral = new Array();
		even_integral.push(blocks[0]);
		odd_integral.push(blocks[1]);
		for(i=2; i<blocks.length; i++)
			if(i % 2 == 0)
				even_integral.push(blocks[i]+even_integral[even_integral.length-1]);
			else
				odd_integral.push(blocks[i]+odd_integral[odd_integral.length-1]);

		var coin = Math.floor((Math.random() * 2) + 1);	// Make a coin flip
		var index = -1;
		if(coin == 1)	// odd
		{
			if(to_take >= odd_integral[odd_integral.length-1])	// If need to take more than there is
			{
				to_take -= odd_integral[odd_integral.length-1];
				for(i=0; i<blocks.length; i++)
					if(i % 2 != 0)
						free[i] = false;
				index = binarySearch( 1, even_integral.length, even_integral, to_take ); // search else in even integral
				for(i=0; i<=index; i++)
					free[i*2] = false;
			}
			else {
				index = binarySearch( 1, odd_integral.length, odd_integral, to_take );
				for(i=0; i<=index; i++)
					free[(i*2)+1] = false;
			}
		}
		else{	// even
			if(to_take >= even_integral[even_integral.length-1])	// If need to take more than there is
			{
				to_take -= even_integral[even_integral.length-1];
				for(i=0; i<blocks.length; i++)
					if(i % 2 == 0)
						free[i] = false;
				index = binarySearch( 1, odd_integral.length, odd_integral, to_take );	// search else in odd integral
				for(i=0; i<=index; i++)
					free[(i*2)-1] = false;
			} else {
				index = binarySearch( 1, even_integral.length, even_integral, to_take );
				for(i=0; i<=index; i++)
					free[i*2] = false;
			}
		}
	}

	// Randomly mix blocks, cause of all the sorting
	for(i=0; i<blocks.length; i++)
	{
		// Swap
		var random_index = Math.floor((Math.random() * blocks.length));	// 0...number_of_blocks-1
		var variable = blocks[i];
		blocks[i] = blocks[random_index];
		blocks[random_index] = variable;
		variable = free[i];
		free[i] = free[random_index];
		free[random_index] = variable;
	}
	// Allocate memory
	for(i=0; i<blocks.length; i++)
		memory.blocks.push({size:blocks[i], free: free[i]});
};
