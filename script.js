(function(){
'use strict';
var KEY='firebite_order', order=[];
var $=function(s){return document.querySelector(s)};
var list=$('#order-list'), totalEl=$('#order-total'), countEl=$('#cart-count'), msg=$('#order-msg'), toast=$('#toast'), tt;
var peso=function(n){return '\u20B1'+n.toLocaleString('en-PH')};
function load(){try{order=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){order=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(order))}catch(e){}}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function say(t){toast.textContent=t;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},1800)}

// CREATE
function addItem(name,price){
  var it=order.find(function(o){return o.name===name});
  if(it){it.qty+=1}else{order.push({id:Date.now()+Math.random(),name:name,price:price,qty:1,note:''})}
  save();render();say(name+' added to your order');
}
// UPDATE
function updateItem(id,changes){
  var it=order.find(function(o){return o.id===id});
  if(!it)return;
  Object.assign(it,changes);
  if(it.qty<1)it.qty=1; if(it.qty>99)it.qty=99;
  save();render(id);
}
// DELETE
function removeItem(id){order=order.filter(function(o){return o.id!==id});save();render();}
function clearAll(){order=[];save();render();}

// READ
function render(focusId){
  var total=0,count=0;
  if(!order.length){
    list.innerHTML='<p class="empty">Your order is empty. Pick something tasty from the menu!</p>';
  }else{
    list.innerHTML=order.map(function(o){
      total+=o.price*o.qty;count+=o.qty;
      return '<div class="o-item" data-id="'+o.id+'"><div class="o-main"><h3>'+esc(o.name)+'</h3><span class="o-price">'+peso(o.price)+' each</span></div>'+
      '<div class="qty"><button type="button" data-act="dec" aria-label="Decrease quantity of '+esc(o.name)+'">&minus;</button>'+
      '<input type="number" min="1" max="99" value="'+o.qty+'" data-act="qty" aria-label="Quantity of '+esc(o.name)+'">'+
      '<button type="button" data-act="inc" aria-label="Increase quantity of '+esc(o.name)+'">+</button></div>'+
      '<input class="note" type="text" maxlength="80" placeholder="Note (e.g. no onions)" value="'+esc(o.note)+'" data-act="note" aria-label="Note for '+esc(o.name)+'">'+
      '<strong class="o-sub">'+peso(o.price*o.qty)+'</strong>'+
      '<button type="button" class="del" data-act="del" aria-label="Remove '+esc(o.name)+'">Remove</button></div>';
    }).join('');
  }
  totalEl.textContent=peso(total);countEl.textContent=count;
  $('#place-order').disabled=$('#clear-order').disabled=!order.length;
}

// Add buttons (menu cards, bestsellers, deals)
document.addEventListener('click',function(e){
  var a=e.target.closest('.card .buy a, .deal-body a');
  if(!a)return;
  e.preventDefault();
  var box=a.closest('.card, .deal');
  var name=box.querySelector('h3').textContent.trim();
  var price=parseInt(box.querySelector('.price').textContent.replace(/[^\d]/g,''),10)||0;
  addItem(name,price);
});
list.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  var row=b.closest('.o-item'),id=parseFloat(row.dataset.id),it=order.find(function(o){return o.id===id});
  if(b.dataset.act==='inc')updateItem(id,{qty:it.qty+1});
  if(b.dataset.act==='dec'){if(it.qty>1)updateItem(id,{qty:it.qty-1});else removeItem(id)}
  if(b.dataset.act==='del')removeItem(id);
});
list.addEventListener('change',function(e){
  var t=e.target,row=t.closest('.o-item');if(!row)return;
  var id=parseFloat(row.dataset.id);
  if(t.dataset.act==='qty')updateItem(id,{qty:parseInt(t.value,10)||1});
  if(t.dataset.act==='note')updateItem(id,{note:t.value.trim()});
});
$('#clear-order').addEventListener('click',function(){clearAll();msg.textContent=''});
$('#place-order').addEventListener('click',function(){
  var n=order.reduce(function(s,o){return s+o.qty},0),t=order.reduce(function(s,o){return s+o.price*o.qty},0);
  msg.textContent='Thank you! Your order of '+n+' item(s) totaling '+peso(t)+' has been received (sample only).';
  order=[];save();render();
});
load();render();
})();