// const { default: swal } = require("sweetalert");
//const { response } = require("../../app")
// const swal = require('sweetalert');



function addToCart(prodId){
    $.ajax({
        url:'/add-to-cart/'+prodId,
        method:'get',
        success:(response)=>{
            if(response.stock){
                Swal.fire({
                    icon: 'warning',
                    title: 'out of stock!',
                    showConfirmButton: false,
                    timer: 2000
                })

            }else{

                if(response.status){
                    let count = $('#cart-count span').html();
                    count = parseInt(count) + 1;
                    console.log(count);
                    $('#cart-count span').html(count);
    
    
               
                }
                if(!response.status){
                    location.href='/login'
                }
    
                Swal.fire({
                    icon: 'success',
                    title: '1 item added to cart',
                    showConfirmButton: false,
                    timer: 2000
                })

            }          

        }

    })
}




function removeCartProduct(cartId,prodId,userId){
    
    console.log();
    $.ajax(
        {
            url:'/removeCartProduct',
            data:{
                cart:cartId,
                product:prodId,
                user:userId
            },
            method:'post',
            success:(response)=>{
                Swal.fire({
                    title: 'Are you sure?',
                    text: ' You want to delete this!',
                    icon: 'warning',
                    iconSize: 10, // set the size to 30 pixels
                    showCancelButton: true,
                    showConfirmButton: true
                }).then((result) => {
                    if(result.isConfirmed){
                        location.reload();
                    }
                });
            }
            
        }
    )
}




function addCart(prodId){
    $.ajax({
        url:'/add-cart/'+prodId,
        method:'post',
        success:(response)=>{
            swal("Good job!", "1 item added to your cart!", "success");
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(count)
           

            }
        }
    })
}




function getAddress() {
    let address = document.getElementById('address');
    let addressId = address.options[address.selectedIndex].value;
    console.log(addressId , " addressid");
    

    $.ajax({
      url : "/fillAddress",
      data : {
        addressId : addressId
      },
      method : 'post',
      success : (response) => {
       
        if(response.status) {
          document.getElementById('name').value = response.uname;
          document.getElementById('number').value = response.number;
          document.getElementById('email').value = response.email;
          document.getElementById('home number').value = response.houseNumber;
          document.getElementById('street number').value = response.streetNumber;
          document.getElementById('town').value = response.town;
          document.getElementById('state').value = response.state;
          document.getElementById('zip').value = response.pincode;
        }
        else{
          document.getElementById('name').value = "";
          document.getElementById('number').value = "";
          document.getElementById('email').value = "";
          document.getElementById('home number').value = "";
          document.getElementById('street number').value = "";
          document.getElementById('town').value = "";
          document.getElementById('state').value = "";
          document.getElementById('zip').value = "";
        }
      }
    });
}













