module.exports.getString= (param)=>{
	let user_data = JSON.stringify(param);
  	let data = user_data.replace(/["']/g, "");

	return data;	
};

module.exports.getArray = (param,no)=>{
	let type = param.split('&');
	//console.log(type[no]);
	let data = type[no].split('=');
	return data[1];
};

module.exports.CheckTypeImage = (magic)=>{
	var MAGIC_NUMBERS = {
	    jpg: 'ffd8ffe0',
	    jpg1: 'ffd8ffe1',
	    png: '89504e47',
	    gif: '47494638'
	}

	if (magic == MAGIC_NUMBERS.jpg || magic == MAGIC_NUMBERS.jpg1 || magic == MAGIC_NUMBERS.png || magic == MAGIC_NUMBERS.gif) 
		return true

};