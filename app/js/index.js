// Add your index.js code in this file
'use strict';
const electron = require('electron');
let fs = require('fs')
const { ipcRenderer } = electron;

let closeEl = document.querySelector('.close');
let wrap = document.querySelector('.wrap');
let controlbar = document.querySelector('.control-bar');
let list = document.querySelector('.list');
let tabChooseBtn = document.querySelectorAll('.tabChoose');
let addItem = document.querySelector('.addItem');
let addBg = document.querySelector('.add-bg');
let addArea = addBg.querySelector('.add-area');
let todoData = '';



fs.readFile('./app/data.json',{encoding:'UTF-8'},function(err,data){
		if(err) throw err;
		todoData = JSON.parse(data);
		renderList();
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


closeEl.addEventListener('click',function(){
	ipcRenderer.send('close-main-window');
})
controlbar.addEventListener('click',function(e){
	let target = null;
	let iconNode = null;
	let allI = controlbar.querySelectorAll('i');
	let allItem = list.querySelectorAll('.item');

	if(e.target.className=='tabChoose'){
		target = e.target;
	}
	if(e.target.parentNode.className=='tabChoose'){
		target = e.target.parentNode;
	}
	iconNode = target.querySelector('.circle');
	if(iconNode.className.indexOf('thin')>-1){
		let firstClick = true;
		for(let i=0,len=allI.length;i<len;i++){
			if(allI[i].className.indexOf('thin')<=-1){
				allI[i].className += ' thin';
			}
		}
		iconNode.className = iconNode.className.replace('thin','');
	}else{
		let firstClick = false;
		for(let i=0,len=allI.length;i<len;i++){
			if(allI[i].className.indexOf('thin')<=-1){
				allI[i].className += ' thin';
			}
		}
	}

	let priority = target.id;
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
	let index = getIndex(list,'.circle',e.target);
	if(e.target.className.indexOf('circle')>-1){
		e.target.className = e.target.className.replace('thin','');
	}
	
	if(index>-1){
		todoData.splice(index,1);
		fs.writeFile('./app/data.json',JSON.stringify(todoData),function(err,data){
			if(err) throw err;
			list.removeChild(e.target.parentNode);
		})
	}
},false)

let getIndex = (parent,ele,target) => {
	if(!parent){
		var elements = document.querySelectorAll(ele);
	}else{
		var elements = parent.querySelectorAll(ele);
	}
	
	for(let i=0,len=elements.length;i<len;i++){
		if(elements[i]==target){
			return i;
		}
	}
	return -1;
}

addItem.addEventListener('click',function(){
	addItem.className += ' slideOutDown';
	addArea.className += ' slideInUp';
	addBg.className = addBg.className.replace('fn-hide','');
},false);


addArea.addEventListener('click',function(e){
	let addAreaCircle = addArea.querySelectorAll('.circle');
	let input = addArea.querySelector('input');
	let selectedPri = null;
	if(e.target.className.indexOf('circle')>-1){
		for(let i=0,len=addAreaCircle.length;i<len;i++){
			if(addAreaCircle[i].className.indexOf('thin')==-1){
				addAreaCircle[i].className += ' thin';				
			}
			addAreaCircle[i].className = addAreaCircle[i].className.replace('selected','');
		}
		e.target.className = e.target.className.replace('thin','');
		e.target.className += ' selected';
	}
	if(e.target.className.indexOf('button')>-1){
		for(var i=0,len=addAreaCircle.length;i<len;i++){
			if(addAreaCircle[i].className.indexOf('thin')==-1){
				break;
			}
		}
		if(i>=len){
			alert('要选择任务的优先级噢！');
		}else{
			if(input.value.trim()===''){
				alert('任务内容不能为空');
			}else{
				selectedPri = addArea.querySelector('.selected').parentNode.className;

				var lastIndex = getObjectIndexInArray(todoData,'priority',selectedPri);
				console.log(lastIndex)
				return;

				todoData.push({"priority":selectedPri,"name":input.value.trim()});
				
				todoData.sort(keysort('priority'));
			
				fs.writeFile('./app/data.json',JSON.stringify(todoData),function(err,data){
					if(err) throw err;
					for(let i=0,len=addAreaCircle.length;i<len;i++){
						addAreaCircle[i].className = addAreaCircle[i].className.replace('selected','');
						if(addAreaCircle[i].className.indexOf('thin')==-1){
							addAreaCircle[i].className += ' thin';				
						}
					}
					input.value='';
					addBg.className += ' fn-hide';
					var tmpNode = document.createElement('li');
					tmpNode.className = 'item fadeInDown animated selectedPri';+selectedPri
					tmpNode.innerHTML = '<i class="circle thin icon green"></i>' + input.value.trim();
					li.insertBefore()
				})
			}
		}
	}
});

function getObjectIndexInArray(arr,key,value){
	let count = 0;
	console.log(arr,key,value)
	for(var i=0,k=0,len=arr.length;i<len;i++){
		let tmpObj = arr[i];
		if(tmpObj[key]&&tmpObj[key]!=value){
			k++;
		}
		if(tmpObj[key]&&tmpObj[key]==value){
			count++;
		}
	}
	console.log(count,k)
	return count+k>=arr.length ? -1 : count+k;
}

function keysort(key,desc){
	return function(a,b){
		return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
	}
}

ipcRenderer.on('global-shortcut',function(event,message){
	let event = new MouseEvent('click');
    soundButtons[message].dispatchEvent(event);
})
