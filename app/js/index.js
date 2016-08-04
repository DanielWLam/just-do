// Add your index.js code in this file
'use strict';
const electron = require('electron');
let fs = require('fs')
const {
	ipcRenderer
} = electron;

let minEl = document.querySelector('.min');
let closeEl = document.querySelector('.close');
let wrap = document.querySelector('.wrap');
let controlbar = document.querySelector('.control-bar');
let list = document.querySelector('.list');
let tabChooseBtn = document.querySelectorAll('.tabChoose');
let addItem = document.querySelector('.addItem');
let addBg = document.querySelector('.add-bg');
let addArea = addBg.querySelector('.add-area');
let closeAddArea = addBg.querySelector('.close-add');
let todoData = '';
let historyData = '';
let historyBtn = document.querySelector('.history');
let historyList = document.querySelector('.history-list');



fs.readFile('./resources/app/app/data.json', {
	encoding: 'UTF-8'
}, function(err, data) {
	if (err) throw err;
	todoData = JSON.parse(data);
	renderList();
});

fs.readFile('./resources/app/app/history.json',{
	encoding:'UTF-8'
},function(err,data){
	if(err){
		throw err;
	}
	historyData = JSON.parse(data);
})

function renderList() {
	let _html = ''
	for (let i = 0, len = todoData.length; i < len; i++) {
		let curArr = todoData[i];
		switch (curArr.priority) {
			case 'A':
				_html += '<li class="item priA fadeInDown animated"><i class="circle thin icon red"></i>' + curArr.name + '</li>';
				break;
			case 'B':
				_html += '<li class="item priB fadeInDown animated"><i class="circle thin icon yellow"></i>' + curArr.name + '</li>';
				break;
			case 'C':
				_html += '<li class="item priC fadeInDown animated"><i class="circle thin icon blue"></i>' + curArr.name + '</li>';
				break;
			case 'D':
				_html += '<li class="item priD fadeInDown animated"><i class="circle thin icon green"></i>' + curArr.name + '</li>';
		}
	}
	list.innerHTML = _html;
}


closeEl.addEventListener('click', function() {
	ipcRenderer.send('close-main-window');
});
minEl.addEventListener('click',function(){
	ipcRenderer.send('minimize-main-window');
});
controlbar.addEventListener('click', function(e) {
	let target = null;
	let iconNode = null;
	let allI = controlbar.querySelectorAll('i');
	let allItem = list.querySelectorAll('.item');

	if (e.target.className == 'tabChoose') {
		target = e.target;
	}
	if (e.target.parentNode.className == 'tabChoose') {
		target = e.target.parentNode;
	}
	iconNode = target.querySelector('.circle');
	if (iconNode.className.indexOf('thin') > -1) {
		var firstClick = true;
		for (let i = 0, len = allI.length; i < len; i++) {
			if (allI[i].className.indexOf('thin') <= -1) {
				allI[i].className += ' thin';
			}
		}
		iconNode.className = iconNode.className.replace('thin', '');
	} else {
		var firstClick = false;
		for (let i = 0, len = allI.length; i < len; i++) {
			if (allI[i].className.indexOf('thin') <= -1) {
				allI[i].className += ' thin';
			}
		}
	}

	let priority = target.id;
	if (firstClick) {
		for (let i = 0, len = allItem.length; i < len; i++) {
			allItem[i].style.display = 'none';
			if (allItem[i].className.indexOf(priority) > -1) {
				allItem[i].style.display = 'block';
			}
		}
	} else {
		for (let i = 0, len = allItem.length; i < len; i++) {
			allItem[i].style.display = 'block';
		}
	}
}, false)

list.addEventListener('click', function(e) {
	let index = getIndex(list, '.circle', e.target);
	if (e.target.className.indexOf('circle') > -1) {
		e.target.className = e.target.className.replace('thin', '');
	}

	if (index > -1) {
		var doneItem = todoData.splice(index, 1)[0];
		doneItem.timestamp = new Date();
		historyData.push(doneItem);
		fs.writeFile('./resources/app/app/data.json', JSON.stringify(todoData), function(err, data) {
			if (err) throw err;
			fs.writeFile('./resources/app/app/history.json',JSON.stringify(historyData),function(err,data){
				if(err){
					throw err;
				}
				list.removeChild(e.target.parentNode);		
			})
		})
	}
}, false)

let getIndex = (parent, ele, target) => {
	if (!parent) {
		var elements = document.querySelectorAll(ele);
	} else {
		var elements = parent.querySelectorAll(ele);
	}

	for (let i = 0, len = elements.length; i < len; i++) {
		if (elements[i] == target) {
			return i;
		}
	}
	return -1;
}

addItem.addEventListener('click', function() {
	addBg.className = addBg.className.replace('fn-hide', '');
}, false);


addArea.addEventListener('click', function(e) {
	let addAreaCircle = addArea.querySelectorAll('.circle');
	let input = addArea.querySelector('input');
	let selectedPri = null;
	if (e.target.className.indexOf('circle') > -1) {
		for (let i = 0, len = addAreaCircle.length; i < len; i++) {
			if (addAreaCircle[i].className.indexOf('thin') == -1) {
				addAreaCircle[i].className += ' thin';
			}
			addAreaCircle[i].className = addAreaCircle[i].className.replace('selected', '');
		}
		e.target.className = e.target.className.replace('thin', '');
		e.target.className += ' selected';
	}
	if (e.target.className.indexOf('button') > -1) {
		for (var i = 0, len = addAreaCircle.length; i < len; i++) {
			if (addAreaCircle[i].className.indexOf('thin') == -1) {
				break;
			}
		}
		if (i >= len) {
			alert('要选择任务的优先级噢！');
		} else {
			if (input.value.trim() === '') {
				alert('任务内容不能为空');
			} else {
				selectedPri = addArea.querySelector('.selected').parentNode.className;

				var lastIndex = getObjectIndexInArray(todoData, 'priority', selectedPri);

				todoData.push({
					"priority": selectedPri,
					"name": input.value.trim()
				});

				todoData.sort(keysort('priority'));

				fs.writeFile('./resources/app/app/data.json', JSON.stringify(todoData), function(err, data) {
					if (err) throw err;
					for (let i = 0, len = addAreaCircle.length; i < len; i++) {
						addAreaCircle[i].className = addAreaCircle[i].className.replace('selected', '');
						if (addAreaCircle[i].className.indexOf('thin') == -1) {
							addAreaCircle[i].className += ' thin';
						}
					}
					var tmpNode = document.createElement('li');
					tmpNode.className = 'item fadeInDown animated pri'+ selectedPri;
					tmpNode.innerHTML = '<i class="circle thin icon '+priColorMap[selectedPri]+'"></i>' + input.value.trim();
					var referenceNode = list.querySelectorAll('.item')[lastIndex];
					var refePri = '';
					if(referenceNode){
						refePri = /pri(\w)/.exec(referenceNode.className)[1];
					}
					//如果refernceNode的pri比要插入的小，应该用insertBefore
					if(refePri > selectedPri){
						list.insertBefore(tmpNode,referenceNode);
					}else{
					//否则用insertAfter
					//模拟insertAfter
						list.insertBefore(tmpNode,referenceNode ? referenceNode.nextSibling : referenceNode);
					}
					

					input.value = '';
					addBg.className += ' fn-hide';
				})
			}
		}
	}
});

closeAddArea.addEventListener('click',function(){
	addBg.className += ' fn-hide';
	let addAreaCircle = addArea.querySelectorAll('.circle');
	let input = addArea.querySelector('input');
	input.value = '';
})

let priColorMap = {
	'A':'red',
	'B':'yellow',
	'C':'blue',
	'D':'green'
}

function getObjectIndexInArray(arr, key, value) {
	let count = -1;
	let equalFlag = false;
	for (var i = arr.length - 1, len = 0; i >= len; i--) {
		let tmpObj = arr[i];
		if (tmpObj[key] && tmpObj[key] == value) {
			return i;
		}
	}
	
	if (i < len) {
		switch (value) {
			case 'A':
				return 0;
			case 'B':
				return getObjectKeyDataLength(arr, 'priority', 'A')+getObjectKeyDataLength(arr, 'priority', 'B') - 1;
			case 'C':
				return getObjectKeyDataLength(arr, 'priority', 'A')+getObjectKeyDataLength(arr, 'priority', 'B')+getObjectKeyDataLength(arr, 'priority', 'C') - 1;
			case 'D':
				return getObjectKeyDataLength(arr, 'priority', 'A')+getObjectKeyDataLength(arr, 'priority', 'B')+getObjectKeyDataLength(arr, 'priority', 'C')+getObjectKeyDataLength(arr, 'priority', 'D') - 1 ;
		}
	}
}

function getObjectKeyDataLength(arr, key, value) {
	let count = 0;
	for (let i = 0, len = arr.length; i < len; i++) {
		let tmpObj = arr[i];
		if (tmpObj[key] && tmpObj[key] == value) {
			count++;
		}
	}
	return count;
}

function keysort(key, desc) {
	return function(a, b) {
		return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
	}
}


historyBtn.addEventListener('click',function(){
	historyList.style.left = 0;
	renderHistory()
})

document.body.addEventListener('click',function(e){
	if(e.target.offsetParent && e.target.offsetParent.className != 'history-list' && e.target.className != 'history-list'){
		if(historyList.offsetLeft===0){
			historyList.style.left = '-360px'
		}
	}
})

function renderHistory() {
	let _html = ''
	for (let i = 0, len = historyData.length; i < len; i++) {
		let curArr = historyData[i];
		switch (curArr.priority) {
			case 'A':
				_html += '<li><i class="circle icon red"></i><span class="task-name">'+curArr.name+'</span><span class="finished-time">'+timestampTransform(curArr.timestamp)+'</span></li>';
				break;
			case 'B':
				_html += '<li><i class="circle icon yellow"></i><span class="task-name">'+curArr.name+'</span><span class="finished-time">'+timestampTransform(curArr.timestamp)+'</span></li>';
				break;
			case 'C':
				_html += '<li><i class="circle icon blue"></i><span class="task-name">'+curArr.name+'</span><span class="finished-time">'+timestampTransform(curArr.timestamp)+'</span></li>';
				break;
			case 'D':
				_html += '<li><i class="circle icon green"></i><span class="task-name">'+curArr.name+'</span><span class="finished-time">'+timestampTransform(curArr.timestamp)+'</span></li>';
		}
	}
	historyList.querySelector('ul').innerHTML = _html;
}

function timestampTransform(timestamp){
	var timestampDate = new Date(timestamp);
	var monthMap = {
		0:'01',
		1:'02',
		2:'03',
		3:'04',
		4:'05',
		5:'06',
		6:'07',
		7:'08',
		8:'09',
		9:'10',
		10:'11',
		11:'12'
	}
	var year = timestampDate.getFullYear();
	var month = monthMap[timestampDate.getMonth()];
	var date = timestampDate.getDate()+'';
	var hour = timestampDate.getHours()+'';
	var minute = timestampDate.getMinutes()+'';
	var second = timestampDate.getSeconds()+'';

	return year+'-'+month+'-'+addTimePreZero(date)+' '+addTimePreZero(hour)+':'+addTimePreZero(minute)+':'+addTimePreZero(second);
}

function addTimePreZero(str){
	return str.length==1 ? 0 + str : str;
}