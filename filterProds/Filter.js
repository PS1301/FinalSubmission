var site_url="http://sitedemo.stage.sitesuite.net.au";
var request_url = "products.json"; 

 var global_data;  
 var global_atti_keys= [];   
 var global_atti_values= []; 
 var global_atti_values_checked= [];   

  $(document).ready(function(){
  

     $.get(request_url, function(data) {
		
		var local_atti_keys= [];   
		var local_atti_values= [];  
		 
		 $.each(data, function(index, singleobj) {         //loop to standardise JSON input (fist letter upper, the rest lower case)
			var atti_obj = singleobj.attributes;
				$.each(atti_obj, function(key, atti_obj_value) { 
					
			updateFirstUpper(atti_obj_value);
				   
                   var new_key = makeFirstUpper(key); 
                   atti_obj[new_key]=atti_obj[key];  
                   delete(atti_obj[key]);
              });   
        }); 

        $.each(data, function(index, singleobj) {
		     
			   var atti_obj = singleobj.attributes;   
		     
				$.each(atti_obj, function(key, atti_obj_value_array) {                               //Loop product attributes and add them and their values to arrays. If the key already exists then find position and check if value exists in that array. If not, add.
				     if($.inArray(key,local_atti_keys)<0){  
					   
					    local_atti_keys.push(key);            		
                        var clone_atti_obj_value_array = atti_obj_value_array.slice()    					
						local_atti_values.push(clone_atti_obj_value_array);  
                                                
					 } else{   	
					    var index = local_atti_keys.indexOf(key);						 
						var  saved_atti_value_array =  local_atti_values[index];			    
						var flag = 0;  
						
						$.each(atti_obj_value_array, function(key_index, sing_v) {   
						     if($.inArray(sing_v,saved_atti_value_array)<0){  
							     saved_atti_value_array.push(sing_v); 			
                                                            
							     flag = 1;  
							 }
						});
						if(flag>0){
						    local_atti_values[index] = saved_atti_value_array;   
						}
					 }
				}
				);
		
			  var img_obj = singleobj.image;                  
			  var prod_url = site_url+singleobj.url;		
			  var full_img_url = site_url+img_obj.url;		
																														
              $('#ss-category').append('<div class="ss-product"><div class="ss-product-thumb-link"><a href="'+prod_url +'" target=_blank><img class="ss-product-thumb" width="140" height="140" src="'+full_img_url+'" alt="'+img_obj.title+ '"></a></br></div><div class="ss-product-name"><a href="'+prod_url +'" class="ss-product-name-link">'+singleobj.name  + '</a></div><div class ="ss-product-price">$' + singleobj.price  + '</div></div>'); 
		   });  
	  	
		setGlobalVarial(data,local_atti_keys,local_atti_values);  		
		showAtti();  
    },"json");  
});  

////////////////////////////Functions///////////////////////////////////////////

function setGlobalVarial(data,atti_keys,atti_values){   		//Function to save local variable data into globals so can be be used by other functions.
	global_data = data;
	global_atti_keys= atti_keys;
	global_atti_values= atti_values;

  initCheckstatus();
}

function initCheckstatus(){		                                         //reset multidimensional array of checkboxed check values.							  		
   for(var i=0;i<global_atti_values.length;i++){
           var atti_values_checked = [];
           for(var j=0;j<global_atti_values[i].length;j++){
               atti_values_checked.push("0");
           } 
           global_atti_values_checked[i]=atti_values_checked; 
    } 
}

function showAtti(){				  // append attribute names and values to #attributeCheckboxList									

    $.each(global_atti_keys, function(key_i, key_v) {  
	      var append_content =  "<div class=\"attribute-name\">"+key_v+"</div>";  
			
		         $.each(global_atti_values[key_i], function(v_i, v_v) {   
			         append_content += "<div class=\"attribute-value\"><label><input type=\"checkbox\" name="+key_v+" value="+v_i+"  onchange=\"filterData()\"/>"+v_v+" </label> <br /></div>";
			     });
			 
		 $("#attributeCheckboxList").append(append_content);
	});
}

function getKeyIndex(key){            //function to return index 
   for(e=0;e<global_atti_keys.length;e++){
        if(global_atti_keys[e] == key){
            return e;
         }
   }
}

function resetGlobalCheckStatus(){   		//reset user selected tickboxes and reload.
 initCheckstatus();  

 $("input:checkbox").each( function () {
       if($(this).get(0).checked==true){
	      att_name = $(this).attr('name'); 
	          v_index = $(this).val(); 
              k_index = getKeyIndex(att_name);

              var value_checked_arr = global_atti_values_checked[k_index];  
              value_checked_arr[v_index] = "1";
		         
	      global_atti_values_checked[k_index] = value_checked_arr; 
	   }	     
   });
}

function filterData(){                 //triggered by all checkbox  onchange=filterData() event. Compares JSON products against selected checkboxes.
    resetGlobalCheckStatus();
      
	var filtered_json_data = [];
	filtered_json_data.length = 0; 
	
	$.each(global_data, function(index, singleobj) {
                var atti_obj = singleobj.attributes;	
				
		if(isAttiChecked(atti_obj)==="1"){    
                        
		   filtered_json_data.push(singleobj);
                }				
	});	 
	renderPage(filtered_json_data);     
}

function isAttiChecked(atti_obj){                          //Loop through attribute keys and their values and if match is found in all selected checked keys and JSON then  return r_v otherwise disregard product.
 var r_v="0"; 
 
   for(var i=0;i<global_atti_values_checked.length;i++){    
       var values_checked = global_atti_values_checked[i]; 
	    
	   var  key_name = global_atti_keys[i]; 
       var atti_values_arr_in_json=[];  
	    
       $.each(atti_obj, function(key, values) {  
	              
                  if(key==key_name){ 
                      atti_values_arr_in_json = values; 
                      return false;                                                             			
                  }
       });  
	  
       var has_checked = false;  
       for(var j=0;j<values_checked.length;j++){  
                      
            if(values_checked[j]==="1"){ 
			    r_v = "0";  
                has_checked = true;
		        var value_name = global_atti_values[i][j]; 
				
                if($.inArray(value_name, atti_values_arr_in_json)>=0){
				    
		                r_v="1"; 
                        break;
		         }                
            }            
       }

       if(has_checked){ 
           if(r_v==="0"){
   
             break; 
           }
       } 
   }
   return r_v;
}

function renderPage(json_data){   //append JSON products to div and display.
       $('#ss-category').empty();
      if(json_data.length<1){  
           $('#ss-category').append('<p></br>Your Search Returned no products</p>');
      }

      $.each(json_data, function(index, singleobj) {
			var img_obj = singleobj.image;			  
	        var prod_url = site_url+singleobj.url;
	        var full_img_url = site_url+img_obj.url;
			
			$('#ss-category').append('<div class="ss-product"><div class="ss-product-thumb-link"><a href="'+prod_url +'" target=_blank><img class="ss-product-thumb" width="140" height="140" src="'+full_img_url+'" alt="'+img_obj.title+ '"></a></br></div><div class="ss-product-name"><a href="'+prod_url +'" class="ss-product-name-link">'+singleobj.name  + '</a></div><div class ="ss-product-price">$' + singleobj.price  + '</div></div>');
     });

}

function updateFirstUpper(value_arr){
   for(var i=0;i<value_arr.length;i++){
        value_arr[i]=makeFirstUpper(value_arr[i]);
   }
}

function makeFirstUpper(str){
  //alert("hello");
  return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {       
     return letter.toUpperCase();
  });
}