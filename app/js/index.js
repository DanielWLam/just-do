// Add your index.js code in this file
'use strict';
const electron = require('electron');
var fs = require('fs')
const {ipcRenderer} = electron;

var closeEl = document.querySelector('.close');
var wrap = document.querySelector('.wrap');
var controlbar = document.querySelector('.control-bar');
var list = document.querySelector('.list');
var tabChooseBtn = document.querySelectorAll('.tabChoose');
var todoData = '';

fs.readFile('./app/data.json',{encoding:'UTF-8'},function(err,data){
		if(err) throw err;
		todoData = JSON.parse(data);
		renderList();
})

function renderList() {
    var _html = ''
    for (let i = 0, len = todoData.length; i < len; i++) {
        var curArr = todoData[i];
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


closeEl.addEventListener('click',function(){
	ipcRenderer.send('close-main-window');
})
controlbar.addEventListener('click',function(e){
	var target = null;
	var iconNode = null;
	var allI = controlbar.querySelectorAll('i');
	var allItem = list.querySelectorAll('.item');

	if(e.target.className=='tabChoose'){
		target = e.target;
	}
	if(e.target.parentNode.className=='tabChoose'){
		target = e.target.parentNode;
	}
	iconNode = target.querySelector('.circle');
	if(iconNode.className.indexOf('thin')>-1){
		var firstClick = true;
		for(var i=0,len=allI.length;i<len;i++){
			if(allI[i].className.indexOf('thin')<=-1){
				allI[i].className += ' thin';
			}
		}
		iconNode.className = iconNode.className.replace('thin','');
	}else{
		var firstClick = false;
		for(var i=0,len=allI.length;i<len;i++){
			if(allI[i].className.indexOf('thin')<=-1){
				allI[i].className += ' thin';
			}
		}
	}

	var priority = target.id;
	if(firstClick){
		for(let i=0,len=allItem.length;i<len;i++){
			allItem[i].style.display='none';
			if(allItem[i].className.indexOf('item '+priority)>-1){
				allItem[i].style.display='block';
			}
		}
	}else{
		for(let i=0,len=allItem.length;i<len;i++){
			allItem[i].style.display='block';
		}
	}
},false)

list.addEventListener('click',function(e){
	var index = getIndex(list,'.circle',e.target);
	if(e.target.className.indexOf('circle')>-1){
		e.target.className = e.target.className.replace('thin','');
	}
	todoData.splice(index,1);
	fs.writeFile('./app/data.json',JSON.stringify(todoData),function(err,data){
		if(err) throw err;
		renderList();
	})
},false)

var getIndex = (parent,ele,target) => {
	if(!parent){
		var elements = document.querySelectorAll(ele);
	}else{
		var elements = parent.querySelectorAll(ele);
	}
	
	for(var i=0,len=elements.length;i<len;i++){
		if(elements[i]==target){
			return i;
		}
	}
	return -1;
}

ipcRenderer.on('global-shortcut',function(event,message){
	var event = new MouseEvent('click');
    soundButtons[message].dispatchEvent(event);
})
